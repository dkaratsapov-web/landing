/* server.mjs — сервис работы с базами компаний.

   Запуск:  CRM_PASSWORD=... node server.mjs
   Порт:    CRM_PORT (по умолчанию 8787), слушаем только 127.0.0.1 —
            наружу пускает Nginx, он же держит сертификат.

   Зависимостей нет ни одной: всё, что нужно, есть во встроенных модулях.
   Это сознательный выбор. На сервере не нужен npm install, нечему протухнуть
   и нечего обновлять по уязвимостям — разворачивание сводится к копированию
   каталога и одному юниту systemd. */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual, randomBytes } from 'node:crypto';
import { Store, STATUS_LABELS, STATUSES } from './store.mjs';
import { parseCsv, parseXlsx, importRows, findHeader } from './import.mjs';
import { Checker, VERDICTS } from './check.mjs';
import { score, SERVICES, NICHE_FIT } from './score.mjs';
import { YandexAuth, makeSession, readSession } from './auth.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const PORT = +(process.env.CRM_PORT || 8787);
const HOST = process.env.CRM_HOST || '127.0.0.1';
const PASSWORD = process.env.CRM_PASSWORD || '';
const DATA = process.env.CRM_DATA || join(DIR, 'data', 'base.ndjson');
/* Секрет для подписи сессий. Если не задан, берётся случайный — тогда
   перезапуск сервиса разлогинивает. Для входа через Яндекс это одна лишняя
   кнопка, поэтому по умолчанию так и оставляем: меньше секретов на диске. */
const SECRET = process.env.CRM_SECRET || randomBytes(32).toString('hex');

const ya = new YandexAuth();

if (!PASSWORD && !ya.enabled) {
  console.error('Не настроен ни один способ входа. Задайте CRM_PASSWORD либо '
    + 'CRM_YANDEX_CLIENT_ID, CRM_YANDEX_CLIENT_SECRET и CRM_BASE_URL.');
  process.exit(1);
}
if (ya.enabled && !ya.allowed.size) {
  console.error('CRM_YANDEX_* заданы, но CRM_ALLOWED_EMAILS пуст. Вход через Яндекс '
    + 'без списка разрешённых адресов пускал бы любого владельца яндекс-почты.');
  process.exit(1);
}
if (ya.enabled) console.log(`вход через Яндекс: ${[...ya.allowed].join(', ')}`);
if (PASSWORD) console.log('вход по паролю: включён');

const store = new Store(DATA);
const checker = new Checker(store, score);
console.log(`store: ${store.size()} компаний из ${DATA}`);

/* ───────────────────────── вспомогательное ───────────────────────── */

const json = (res, code, obj) => {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(body);
};

const cookieOf = (req, name) => {
  const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(req.headers.cookie || '');
  return m ? decodeURIComponent(m[1]) : '';
};

/* Права проверяются при каждом запросе, а не один раз при входе. Поэтому
   достаточно убрать адрес из CRM_ALLOWED_EMAILS и перезапустить сервис —
   и человек теряет доступ, не дожидаясь, пока истечёт его кука. */
function currentUser(req) {
  const sess = readSession(SECRET, cookieOf(req, 'crm_session'));
  if (!sess) return null;
  if (sess.email === 'password') return PASSWORD ? { email: 'вход по паролю', kind: 'password' } : null;
  return ya.isAllowed(sess.email) ? { email: sess.email, kind: 'yandex' } : null;
}

const authed = (req) => Boolean(currentUser(req));

function setSession(res, email) {
  const s = makeSession(SECRET, email);
  res.setHeader('set-cookie',
    `crm_session=${encodeURIComponent(s.value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${s.maxAge}`);
}

/* Страница с понятным текстом вместо голого кода ошибки: человек, которому
   отказали, должен понимать почему и что делать дальше. */
function authPage(res, code, title, text) {
  res.writeHead(code, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{margin:0;background:#0d0d0f;color:#f5f5f7;font-family:system-ui,sans-serif;
display:flex;align-items:center;justify-content:center;height:100vh}
.b{max-width:420px;padding:28px;background:#161618;border:1px solid rgba(255,255,255,.1);border-radius:16px}
h1{font-size:18px;margin:0 0 10px}p{color:#a1a1a6;font-size:14px;line-height:1.5;margin:0 0 16px}
a{color:#c4f53e}</style></head><body><div class="b"><h1>${title}</h1><p>${text}</p>
<a href="/">Вернуться ко входу</a></div></body></html>`);
}

function readBody(req, limit = 64 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let len = 0;
    req.on('data', (d) => {
      len += d.length;
      if (len > limit) { req.destroy(); reject(new Error('файл больше 64 МБ')); return; }
      chunks.push(d);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/* ───────────────────────── фильтрация ───────────────────────── */

/* Один фильтр на список, экспорт и запуск проверки: «проверить всё, что я
   сейчас вижу» должно означать ровно то, что на экране, без оговорок. */
function filtered(q) {
  const needle = (q.get('q') || '').trim().toLowerCase();
  const status = q.get('status') || '';
  const verdict = q.get('verdict') || '';
  const need = q.get('need') || '';
  const cat = q.get('cat') || '';
  const city = q.get('city') || '';
  const checked = q.get('checked') || '';     // yes | no
  const contact = q.get('contact') || '';     // any | mobile | email

  return store.all().filter((c) => {
    if (status && c.status !== status) return false;
    if (verdict && (c.check?.verdict || '') !== verdict) return false;
    if (need && !(c.score?.needs || []).includes(need)) return false;
    if (cat && !(c.categories || []).includes(cat)) return false;
    if (city && c.city !== city) return false;
    if (checked === 'yes' && !c.check) return false;
    if (checked === 'no' && c.check) return false;
    if (contact === 'mobile' && !c.mobiles?.length) return false;
    if (contact === 'email' && !c.emails?.length) return false;
    if (contact === 'any' && !(c.mobiles?.length || c.phones?.length || c.emails?.length)) return false;
    if (needle) {
      const hay = [c.name, c.site, c.address, (c.categories || []).join(' '),
        (c.subcategories || []).join(' '), (c.emails || []).join(' '),
        (c.phones || []).join(' '), (c.mobiles || []).join(' ')].join(' ').toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

const sorters = {
  priority: (a, b) => (b.score?.priority || 0) - (a.score?.priority || 0),
  name: (a, b) => a.name.localeCompare(b.name, 'ru'),
  checked: (a, b) => String(b.check?.at || '').localeCompare(String(a.check?.at || '')),
};

/* ───────────────────────── API ───────────────────────── */

async function api(req, res, url) {
  const p = url.pathname;
  const q = url.searchParams;

  /* Какие способы входа показывать — решает сервер: интерфейс не должен
     угадывать, настроен ли Яндекс. */
  if (p === '/api/auth-methods') {
    return json(res, 200, { password: Boolean(PASSWORD), yandex: ya.enabled });
  }

  if (p === '/api/login' && req.method === 'POST') {
    if (!PASSWORD) return json(res, 400, { error: 'вход по паролю выключен' });
    const body = JSON.parse((await readBody(req, 4096)).toString('utf8') || '{}');
    const ok = Buffer.byteLength(body.password || '') === Buffer.byteLength(PASSWORD)
      && timingSafeEqual(Buffer.from(body.password || ''), Buffer.from(PASSWORD));
    if (!ok) return json(res, 401, { error: 'неверный пароль' });
    setSession(res, 'password');
    return json(res, 200, { ok: true });
  }

  if (!authed(req)) return json(res, 401, { error: 'нужен вход' });

  if (p === '/api/me') return json(res, 200, currentUser(req));

  if (p === '/api/logout' && req.method === 'POST') {
    res.setHeader('set-cookie', 'crm_session=; HttpOnly; Path=/; Max-Age=0');
    return json(res, 200, { ok: true });
  }

  if (p === '/api/stats') {
    const all = store.all();
    const by = (f) => all.reduce((m, c) => { const k = f(c); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
    return json(res, 200, {
      total: all.length,
      checked: all.filter((c) => c.check).length,
      byStatus: by((c) => c.status),
      byVerdict: by((c) => c.check?.verdict),
      byNeed: all.reduce((m, c) => { for (const n of c.score?.needs || []) m[n] = (m[n] || 0) + 1; return m; }, {}),
      labels: { status: STATUS_LABELS, verdict: VERDICTS, service: SERVICES },
    });
  }

  if (p === '/api/facets') {
    const cats = new Map(), cities = new Map();
    for (const c of store.all()) {
      for (const k of c.categories || []) cats.set(k, (cats.get(k) || 0) + 1);
      if (c.city) cities.set(c.city, (cities.get(c.city) || 0) + 1);
    }
    const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ k, n }));
    return json(res, 200, { categories: top(cats), cities: top(cities).slice(0, 40), fit: Object.keys(NICHE_FIT) });
  }

  if (p === '/api/companies') {
    const rows = filtered(q);
    const sort = sorters[q.get('sort')] || sorters.priority;
    rows.sort(sort);
    const page = Math.max(1, +(q.get('page') || 1));
    const limit = Math.min(200, +(q.get('limit') || 50));
    return json(res, 200, {
      total: rows.length,
      page,
      rows: rows.slice((page - 1) * limit, page * limit).map((c) => ({
        id: c.id, name: c.name, city: c.city, site: c.site, status: c.status,
        categories: c.categories, mobiles: c.mobiles, phones: c.phones, emails: c.emails,
        verdict: c.check?.verdict || null, checkedAt: c.check?.at || null,
        priority: c.score?.priority || 0, hook: c.score?.hook || '', needs: c.score?.needs || [],
      })),
    });
  }

  const one = /^\/api\/company\/([\w-]+)$/.exec(p);
  if (one) {
    const c = store.get(one[1]);
    if (!c) return json(res, 404, { error: 'не найдено' });
    if (req.method === 'GET') return json(res, 200, c);
    if (req.method === 'PATCH') {
      const body = JSON.parse((await readBody(req, 1 << 20)).toString('utf8') || '{}');
      const patch = {};
      if (body.status && STATUSES.includes(body.status)) patch.status = body.status;
      if (typeof body.note === 'string') patch.note = body.note.slice(0, 20000);
      if (Array.isArray(body.tags)) patch.tags = body.tags.slice(0, 30).map((t) => String(t).slice(0, 40));
      if ('next_step' in body) patch.next_step = body.next_step;
      store.update(c.id, patch);
      store.save();
      return json(res, 200, store.get(c.id));
    }
  }

  const touch = /^\/api\/company\/([\w-]+)\/touch$/.exec(p);
  if (touch && req.method === 'POST') {
    const c = store.get(touch[1]);
    if (!c) return json(res, 404, { error: 'не найдено' });
    const body = JSON.parse((await readBody(req, 1 << 20)).toString('utf8') || '{}');
    c.touches = c.touches || [];
    c.touches.unshift({
      at: new Date().toISOString(),
      kind: String(body.kind || 'note').slice(0, 20),
      text: String(body.text || '').slice(0, 5000),
    });
    store.touch(); store.save();
    return json(res, 200, c);
  }

  if (p === '/api/import' && req.method === 'POST') {
    const name = q.get('name') || 'файл';
    const source = (q.get('source') || name).slice(0, 80);
    const buf = await readBody(req);
    let rows;
    if (/\.xlsx$/i.test(name) || buf.subarray(0, 2).toString('latin1') === 'PK') rows = parseXlsx(buf);
    else if (/\.xls$/i.test(name)) {
      return json(res, 400, {
        error: 'Старый формат .xls не поддерживается. Откройте файл в Excel или LibreOffice '
          + 'и сохраните как .xlsx или .csv — разбор таких файлов требует отдельной библиотеки, '
          + 'а пересохранение занимает два клика.',
      });
    } else rows = parseCsv(buf.toString('utf8'));
    if (!rows.length) return json(res, 400, { error: 'в файле нет строк' });

    if (q.get('dry') === '1') {
      const { index, map } = findHeader(rows);
      return json(res, 200, {
        dry: true, rowsTotal: rows.length, headerIndex: index, map,
        header: rows[index], sample: rows.slice(index + 1, index + 4),
      });
    }
    const backup = store.backup();
    const r = importRows(store, rows, source);
    for (const c of store.all()) if (c.check && !c.score) c.score = score(c);
    return json(res, 200, { ...r, backup });
  }

  if (p === '/api/check' && req.method === 'GET') return json(res, 200, checker.status());

  if (p === '/api/check' && req.method === 'POST') {
    if (checker.state.running) return json(res, 409, { error: 'проверка уже идёт' });
    const body = JSON.parse((await readBody(req, 1 << 20)).toString('utf8') || '{}');
    let ids;
    if (Array.isArray(body.ids) && body.ids.length) ids = body.ids;
    else {
      let rows = filtered(new URLSearchParams(body.filter || ''));
      if (body.onlyNew) rows = rows.filter((c) => !c.check);
      ids = rows.map((c) => c.id);
    }
    if (body.limit) ids = ids.slice(0, +body.limit);
    if (!ids.length) return json(res, 400, { error: 'нечего проверять' });
    checker.run(ids, +(body.concurrency || 6)).catch((e) => console.error('checker:', e));
    return json(res, 200, { started: ids.length });
  }

  if (p === '/api/check/stop' && req.method === 'POST') {
    checker.state.stop = true;
    return json(res, 200, { ok: true });
  }

  if (p === '/api/export.csv') {
    const rows = filtered(q).sort(sorters[q.get('sort')] || sorters.priority);
    const head = ['Организация', 'Город', 'Адрес', 'Телефоны', 'Мобильные', 'E-mail', 'Сайт',
      'Категории', 'Статус домена', 'Новый домен', 'Метрика', 'CMS', 'Адаптив',
      'Приоритет', 'Что предлагать', 'Повод', 'Статус', 'Заметка'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const body = rows.map((c) => [
      c.name, c.city, c.address, (c.phones || []).join(' '), (c.mobiles || []).join(' '),
      (c.emails || []).join(' '), c.site, (c.categories || []).join('; '),
      VERDICTS[c.check?.verdict] || '', c.check?.new_domain || '',
      c.check?.tech?.metrika ? 'есть' : (c.check ? 'нет' : ''),
      c.check?.tech?.cms || '', c.check?.tech ? (c.check.tech.viewport ? 'да' : 'нет') : '',
      c.score?.priority || '', (c.score?.needs || []).map((n) => SERVICES[n].name).join('; '),
      c.score?.hook || '', STATUS_LABELS[c.status] || c.status, c.note || '',
    ].map(esc).join(';')).join('\n');
    res.writeHead(200, {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="crm-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    });
    /* BOM — иначе русский Excel откроет файл кракозябрами. */
    res.end('﻿' + head.map(esc).join(';') + '\n' + body);
    return;
  }

  return json(res, 404, { error: 'нет такого метода' });
}

/* ───────────────────────── вход через Яндекс ───────────────────────── */

async function auth(req, res, url) {
  if (!ya.enabled) return authPage(res, 404, 'Вход через Яндекс не настроен',
    'В окружении сервиса не заданы CRM_YANDEX_CLIENT_ID, CRM_YANDEX_CLIENT_SECRET и CRM_BASE_URL.');

  if (url.pathname === '/auth/yandex') {
    const { url: go, state } = ya.startUrl();
    res.writeHead(302, {
      location: go,
      /* Кука со state живёт десять минут и только ради одной проверки на
         обратном пути. Secure не ставим жёстко: на локальной отладке по http
         такая кука просто не доедет, а на сервере всё и так за https. */
      'set-cookie': `crm_state=${state}; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=600`,
    });
    return res.end();
  }

  if (url.pathname === '/auth/yandex/callback') {
    const err = url.searchParams.get('error');
    if (err) {
      return authPage(res, 400, 'Яндекс отказал во входе',
        `Причина: ${escapeHtml(url.searchParams.get('error_description') || err)}.`);
    }
    if (!ya.checkState(url.searchParams.get('state'), cookieOf(req, 'crm_state'))) {
      /* Либо ссылку открыли не с той вкладки, где начинали, либо прошло
         больше десяти минут, либо кто-то подсунул чужой адрес возврата. */
      return authPage(res, 400, 'Вход не завершён',
        'Проверочный код не совпал или устарел. Начните вход заново — это нормальная ситуация, '
        + 'если страница провисела открытой слишком долго.');
    }
    try {
      const user = await ya.complete(url.searchParams.get('code'));
      setSession(res, user.email);
      res.setHeader('set-cookie', [res.getHeader('set-cookie')].flat().concat(
        'crm_state=; HttpOnly; Path=/auth; Max-Age=0'));
      res.writeHead(302, { location: '/' });
      console.log('вход:', user.email, user.name ? `(${user.name})` : '');
      return res.end();
    } catch (e) {
      if (e.forbidden) {
        console.warn('отказано во входе:', e.email);
        return authPage(res, 403, 'Доступ не разрешён',
          `Вы вошли как <b>${escapeHtml(e.email)}</b>, но этого адреса нет в списке разрешённых. `
          + 'Добавьте его в CRM_ALLOWED_EMAILS и перезапустите сервис.');
      }
      console.error('ошибка входа через Яндекс:', e.message);
      return authPage(res, 502, 'Не получилось войти', escapeHtml(e.message));
    }
  }

  return authPage(res, 404, 'Нет такой страницы', 'Проверьте адрес.');
}

const escapeHtml = (s) => String(s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ───────────────────────── статика ───────────────────────── */

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function serveStatic(res, pathname) {
  const rel = normalize(pathname === '/' ? '/index.html' : pathname).replace(/^(\.\.[/\\])+/, '');
  const file = join(DIR, 'public', rel);
  if (!file.startsWith(join(DIR, 'public')) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('не найдено');
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
  res.end(readFileSync(file));
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  /* Админка не должна попадать в поиск ни при какой ошибке в конфиге Nginx. */
  res.setHeader('x-robots-tag', 'noindex, nofollow');
  res.setHeader('referrer-policy', 'no-referrer');
  try {
    if (url.pathname.startsWith('/auth/')) return await auth(req, res, url);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    return serveStatic(res, url.pathname);
  } catch (e) {
    console.error('ошибка запроса', url.pathname, e);
    if (!res.headersSent) json(res, 500, { error: String(e.message || e) });
    else res.end();
  }
}).listen(PORT, HOST, () => console.log(`CRM слушает http://${HOST}:${PORT}`));

/* Страховка от потери правок: раз в минуту сбрасываем изменения на диск,
   и обязательно — перед остановкой сервиса. */
setInterval(() => store.save(), 60_000).unref();
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { store.save(); console.log('база сохранена, выходим'); process.exit(0); });
}
