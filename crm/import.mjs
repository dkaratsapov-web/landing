/* import.mjs — разбор выгрузок и загрузка их в базу.

   Поддерживаем CSV и XLSX. Старый .xls (BIFF8, Excel до 2007) не поддерживаем
   намеренно: это бинарный формат с собственной файловой системой внутри, и
   ради него пришлось бы тащить зависимость. Excel и LibreOffice пересохраняют
   такой файл в XLSX или CSV в два клика — это дешевле, чем держать парсер.

   XLSX разбираем сами: это zip с XML внутри, а распаковка есть в zlib,
   который в Node встроен. Выходит сотня строк вместо внешней библиотеки. */
import { inflateRawSync } from 'node:zlib';
import { randomUUID } from 'node:crypto';

/* ─────────────────────────── CSV ─────────────────────────── */

/* Разделитель определяем по первой строке. Русский Excel сохраняет CSV с
   точкой с запятой, выгрузки из сервисов — чаще с запятой, а из баз данных
   приходят табы. Угадать по частоте надёжнее, чем спрашивать. */
function guessDelimiter(head) {
  const counts = [',', ';', '\t'].map((d) => [d, (head.match(new RegExp(`\\${d}`, 'g')) || []).length]);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] ? counts[0][0] : ',';
}

export function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM от Excel
  const d = guessDelimiter(text.slice(0, text.indexOf('\n') + 1 || 500));
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else q = false;
      } else field += c;
      continue;
    }
    if (c === '"') { q = true; continue; }
    if (c === d) { row.push(field); field = ''; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    if (c === '\r') continue;
    field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim()));
}

/* ─────────────────────────── XLSX ─────────────────────────── */

/* Читаем центральный каталог zip с конца файла и достаём нужные записи.
   Распаковываем только два файла: лист и таблицу общих строк. */
function unzip(buf, wanted) {
  const out = {};
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('не похоже на xlsx: не найден конец zip-архива');
  const total = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < total; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;
    if (!wanted.some((w) => name === w || name.startsWith(w))) continue;
    /* Длина служебных полей в локальном заголовке своя — берём её оттуда,
       а не из центрального каталога: они расходятся. */
    const lNameLen = buf.readUInt16LE(local + 26);
    const lExtraLen = buf.readUInt16LE(local + 28);
    const start = local + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + csize);
    out[name] = method === 0 ? raw : inflateRawSync(raw);
  }
  return out;
}

function xmlTags(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?(?:/>|>([\\s\\S]*?)</${tag}>)`, 'g');
  const res = [];
  let m;
  while ((m = re.exec(xml))) res.push({ attrs: m[0].slice(0, m[0].indexOf('>') + 1), inner: m[1] ?? '' });
  return res;
}

const unescapeXml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
  .replace(/&amp;/g, '&');

export function parseXlsx(buf) {
  const files = unzip(buf, ['xl/worksheets/sheet1.xml', 'xl/sharedStrings.xml']);
  const sheet = files['xl/worksheets/sheet1.xml'];
  if (!sheet) throw new Error('в книге нет первого листа');
  const shared = files['xl/sharedStrings.xml']
    ? xmlTags(files['xl/sharedStrings.xml'].toString('utf8'), 'si')
      .map((si) => xmlTags(si.inner, 't').map((t) => unescapeXml(t.inner)).join(''))
    : [];

  const xml = sheet.toString('utf8');
  const rows = [];
  for (const r of xmlTags(xml, 'row')) {
    const cells = [];
    for (const c of xmlTags(r.inner, 'c')) {
      const ref = (c.attrs.match(/r="([A-Z]+)\d+"/) || [])[1] || '';
      let col = 0;
      for (const ch of ref) col = col * 26 + (ch.charCodeAt(0) - 64);
      col = Math.max(0, col - 1);
      const type = (c.attrs.match(/t="([^"]+)"/) || [])[1];
      let v = '';
      if (type === 'inlineStr') {
        v = xmlTags(c.inner, 't').map((t) => unescapeXml(t.inner)).join('');
      } else {
        const raw = (c.inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        if (raw != null) v = type === 's' ? (shared[+raw] ?? '') : unescapeXml(raw);
      }
      cells[col] = v;
    }
    for (let i = 0; i < cells.length; i++) if (cells[i] === undefined) cells[i] = '';
    rows.push(cells);
  }
  return rows.filter((r) => r.some((v) => String(v).trim()));
}

/* ───────────────────── нормализация значений ───────────────────── */

/* Телефон приводим к цифрам с ведущей семёркой. В справочниках один и тот же
   номер записан десятком способов — с кодом города, без него, через дефисы,
   с добавочным. Без нормализации дубли по телефону не ловятся. */
export function normPhone(s) {
  const out = [];
  for (const part of String(s).split(/[,;/]| или /i)) {
    let d = part.replace(/\(доб[^)]*\)/gi, '').replace(/\D/g, '');
    if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
    if (d.length === 10) d = '7' + d;
    if (d.length === 6) d = '74822' + d;           // городской Твери без кода
    if (d.length === 11 && d[0] === '7') out.push(d);
  }
  return [...new Set(out)];
}

export function normEmail(s) {
  return [...new Set(String(s).toLowerCase().match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [])];
}

export function normDomain(s) {
  const t = String(s).trim().toLowerCase();
  if (!t) return '';
  const d = t.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0].trim();
  return /^[a-z0-9.-]+\.[a-z0-9-]{2,}$/i.test(d) || d.includes('xn--') ? d : '';
}

const splitList = (s) => String(s).split(/[,;]/).map((x) => x.trim()).filter(Boolean);

/* ───────────────────── сопоставление колонок ───────────────────── */

const ALIASES = {
  name: ['организация', 'название', 'компания', 'наименование', 'name', 'фирма'],
  city: ['город', 'city', 'населённый пункт', 'населенный пункт'],
  address: ['адрес', 'address', 'улица'],
  zip: ['индекс', 'почтовый индекс'],
  phones: ['телефоны', 'телефон', 'phone', 'тел'],
  mobiles: ['мобильные', 'мобильный', 'сотовый', 'mobile'],
  emails: ['e-mail', 'email', 'почта', 'мейл', 'мэйл'],
  site: ['сайт', 'site', 'website', 'url', 'веб-сайт'],
  categories: ['категории', 'категория', 'рубрика', 'рубрики'],
  subcategories: ['подкатегории', 'подкатегория', 'подрубрика'],
};

export function guessMapping(header) {
  const map = {};
  header.forEach((h, i) => {
    const t = String(h).trim().toLowerCase();
    if (!t) return;
    for (const [field, names] of Object.entries(ALIASES)) {
      if (map[field] !== undefined) continue;
      if (names.some((n) => t === n || t.startsWith(n))) { map[field] = i; return; }
    }
  });
  return map;
}

/* Шапка не всегда в первой строке: выгрузки часто начинаются с пустых строк
   или заголовка отчёта. Ищем первую строку, в которой узнаём хотя бы два поля. */
export function findHeader(rows) {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const map = guessMapping(rows[i]);
    if (Object.keys(map).length >= 2) return { index: i, map };
  }
  return { index: 0, map: guessMapping(rows[0] || []) };
}

/* ───────────────────────── загрузка ───────────────────────── */

/* Ключ дедупликации: домен, если он есть, иначе название плюс город.
   Домен надёжнее — две компании с одинаковым названием в разных городах
   это разные компании, а один домен на двоих не бывает. */
function dedupKey(c) {
  if (c.site) return 'd:' + c.site;
  return 'n:' + c.name.toLowerCase().replace(/[^а-яёa-z0-9]/gi, '') + '|' + c.city.toLowerCase();
}

export function rowToCompany(row, map, source) {
  const at = (f) => (map[f] !== undefined ? String(row[map[f]] ?? '').trim() : '');
  const c = {
    id: randomUUID(),
    source,
    imported_at: new Date().toISOString(),
    name: at('name'),
    city: at('city'),
    address: at('address'),
    zip: at('zip'),
    phones: normPhone(at('phones')),
    mobiles: normPhone(at('mobiles')),
    emails: normEmail(at('emails')),
    site: normDomain(at('site')),
    categories: splitList(at('categories')),
    subcategories: splitList(at('subcategories')),
    status: 'new',
    tags: [],
    note: '',
    next_step: null,
    touches: [],
    check: null,
    score: null,
  };
  c.key = dedupKey(c);
  return c;
}

/* Слияние вместо перезаписи: новая выгрузка может знать телефон, которого
   не было, но не должна стирать заметку и статус, проставленные руками. */
function merge(old, fresh) {
  const uniq = (a, b) => [...new Set([...(a || []), ...(b || [])])];
  old.phones = uniq(old.phones, fresh.phones);
  old.mobiles = uniq(old.mobiles, fresh.mobiles);
  old.emails = uniq(old.emails, fresh.emails);
  old.categories = uniq(old.categories, fresh.categories);
  old.subcategories = uniq(old.subcategories, fresh.subcategories);
  for (const f of ['address', 'zip', 'city', 'site']) if (!old[f] && fresh[f]) old[f] = fresh[f];
  old.sources = [...new Set([...(old.sources || [old.source]), fresh.source])];
  return old;
}

export function importRows(store, rows, source, opts = {}) {
  const { index, map } = opts.map ? { index: opts.headerIndex ?? 0, map: opts.map } : findHeader(rows);
  if (map.name === undefined) {
    throw new Error('не нашёл колонку с названием организации — проверьте шапку файла');
  }
  const res = { added: 0, merged: 0, skipped: 0, total: 0, map, header: rows[index] };
  for (let i = index + 1; i < rows.length; i++) {
    const c = rowToCompany(rows[i], map, source);
    res.total++;
    if (!c.name) { res.skipped++; continue; }
    const old = store.findByKey(c.key);
    if (old) { merge(old, c); store.touch(); res.merged++; continue; }
    store.add(c);
    res.added++;
  }
  store.save();
  return res;
}
