/* lead.mjs — приём заявок с сайта и доставка их в MAX.

   Зачем это вообще появилось. Раньше форма ходила в Bot API прямо из
   браузера, а значит токен лежал в файле, который сайт отдаёт всем подряд.
   Так его и прочитали: бота переименовали посторонние. Клиентский код не
   может хранить секрет — всё, что доходит до браузера, доходит и до чужого.
   Поэтому токен теперь живёт только здесь, на сервере, в переменной
   окружения, а браузер видит лишь адрес эндпоинта.

   Порядок действий на заявку: проверить → записать на диск → попытаться
   доставить. Именно в таком порядке. Запись идёт до отправки, поэтому
   недоступность MAX означает «заявка полежит в файле», а не «заявка
   потеряна». Для 152-ФЗ это же и есть первичная запись персональных данных
   на российском сервере.

   Настройки (в /etc/crm.env):
     LEAD_MAX_TOKEN    — токен бота из business.max.ru
     LEAD_MAX_USER_ID  — кому слать (ваш user_id, см. README)
     LEAD_TG_TOKEN     — необязательно, второй канал в Telegram
     LEAD_TG_CHAT      — необязательно
     LEAD_FILE         — куда писать заявки (по умолчанию рядом с базой)
     LEAD_ORIGINS      — домены, которым разрешено слать, через запятую
*/
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const MAX_API = process.env.LEAD_MAX_API || 'https://platform-api2.max.ru';
const SEND_TIMEOUT = 8000;

/* Считаем все обращения с адреса, а не только удачные: иначе бот, который
   шлёт мусор и получает 400, не ограничен ничем. Поэтому лимит не три, а
   восемь — человек, дважды ошибившийся в телефоне и отправивший заявку с
   третьего раза, в него укладывается с запасом, а поток всё равно режется.
   Счётчик в памяти: перезапуск сервиса его обнуляет, и это допустимо — он
   защищает от потока, а не от упорного. */
const RATE_WINDOW = 10 * 60_000;
const RATE_LIMIT = 8;
const hits = new Map();

function tooMany(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW)) hits.delete(k);
  }
  return list.length > RATE_LIMIT;
}

/* За Nginx настоящий адрес приходит заголовком. Берём первый элемент списка:
   остальные дописывают прокси по пути, и подделать можно только их. */
const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  || req.socket.remoteAddress || '—';

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

/* ───────────────────────── доставка ───────────────────────── */

/* MAX требует токен заголовком: передача через query-параметр отключена.
   Сертификат у platform-api2.max.ru от российского УЦ, поэтому на сервере
   нужен корень Минцифры в доверенных (см. README), иначе запрос упадёт
   на проверке TLS ещё до ответа. */
async function sendMax(text) {
  const token = process.env.LEAD_MAX_TOKEN;
  const userId = process.env.LEAD_MAX_USER_ID;
  if (!token || !userId) return { ok: false, why: 'не настроен' };
  /* Заголовки HTTP передаются в latin1, поэтому один случайно скопированный
     кириллический символ в токене роняет запрос ещё до отправки, причём с
     невнятной ошибкой про ByteString. Проверяем сами и говорим понятно. */
  if (!/^[\x20-\x7e]+$/.test(token)) {
    return { ok: false, why: 'в LEAD_MAX_TOKEN есть символы вне латиницы — проверьте, что токен скопирован целиком и без лишнего' };
  }

  const ctl = AbortSignal.timeout(SEND_TIMEOUT);
  try {
    const r = await fetch(`${MAX_API}/messages?user_id=${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: { authorization: token, 'content-type': 'application/json' },
      body: JSON.stringify({ text, notify: true }),
      signal: ctl,
    });
    if (r.ok) return { ok: true };
    const body = await r.text().catch(() => '');
    return { ok: false, why: `HTTP ${r.status} ${body.slice(0, 200)}` };
  } catch (e) {
    return { ok: false, why: String(e.message || e) };
  }
}

async function sendTelegram(text) {
  const token = process.env.LEAD_TG_TOKEN;
  const chat = process.env.LEAD_TG_CHAT;
  if (!token || !chat) return { ok: false, why: 'не настроен' };
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(SEND_TIMEOUT),
    });
    const j = await r.json().catch(() => ({}));
    return j && j.ok ? { ok: true } : { ok: false, why: `HTTP ${r.status}` };
  } catch (e) {
    return { ok: false, why: String(e.message || e) };
  }
}

/* ───────────────────────── обработчик ───────────────────────── */

export async function handleLead(req, res, readBody, json) {
  if (req.method !== 'POST') return json(res, 405, { error: 'только POST' });

  /* Проверяем, откуда пришло. Это не защита — заголовок подделывается, —
     а отсечка случайного постороннего трафика на эндпоинт. */
  const allowed = (process.env.LEAD_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const origin = String(req.headers.origin || '');
  if (allowed.length && origin && !allowed.includes(origin)) {
    return json(res, 403, { error: 'чужой источник' });
  }
  if (origin) {
    res.setHeader('access-control-allow-origin', origin);
    res.setHeader('access-control-allow-headers', 'content-type');
  }

  const ip = clientIp(req);
  if (tooMany(ip)) return json(res, 429, { error: 'слишком часто, попробуйте через несколько минут' });

  let body;
  try {
    body = JSON.parse((await readBody(req, 16 * 1024)).toString('utf8') || '{}');
  } catch {
    return json(res, 400, { error: 'плохой запрос' });
  }

  /* Honeypot. Поле спрятано стилями, человек его не видит и не заполняет,
     а простой бот заполняет все поля подряд. Отвечаем успехом, чтобы он
     не начал подбирать обход. */
  if (clean(body.website, 100)) return json(res, 200, { ok: true, delivered: 'ignored' });

  /* Формы на страницах услуг собирают текст заявки сами и шлют его целиком.
     Разбирать его обратно на поля смысла нет: нам важно, что в заявке есть
     телефон, по которому можно перезвонить. */
  const prepared = clean(body.text, 4000);
  const name = clean(body.name, 80);
  const phone = clean(body.phone, 40);
  const digits = ((prepared || name + phone).match(/\d/g) || []).length;
  if (!prepared) {
    if (name.length < 2) return json(res, 400, { error: 'укажите имя' });
    if ((phone.match(/\d/g) || []).length < 11) return json(res, 400, { error: 'укажите телефон' });
  } else if (digits < 11) {
    return json(res, 400, { error: 'в заявке нет телефона' });
  }

  const lead = {
    at: new Date().toISOString(),
    text: prepared,
    name,
    phone,
    comment: clean(body.comment, 2000),
    source: clean(body.source, 120) || 'сайт',
    page: clean(body.page, 300),
    ip,
    ua: clean(req.headers['user-agent'], 300),
  };

  /* Запись до отправки — чтобы заявка существовала даже если ни один
     мессенджер сейчас не отвечает. */
  const file = process.env.LEAD_FILE || '/var/lib/crm/leads.ndjson';
  let stored = true;
  try {
    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, JSON.stringify(lead) + '\n');
  } catch (e) {
    stored = false;
    console.error('заявка не записана на диск:', e.message);
  }

  const text = prepared || [
    '🟢 Новая заявка с сайта',
    `👤 ${lead.name}`,
    `📞 ${lead.phone}`,
    lead.comment ? `💬 ${lead.comment}` : '',
    `📄 ${lead.source}${lead.page ? ' · ' + lead.page : ''}`,
  ].filter(Boolean).join('\n');

  const [max, tg] = await Promise.all([sendMax(text), sendTelegram(text)]);
  const delivered = [max.ok && 'max', tg.ok && 'tg'].filter(Boolean);

  if (!delivered.length) {
    console.error('заявка не доставлена:', { max: max.why, tg: tg.why, name: lead.name });
  }

  /* Для посетителя заявка принята, если она у нас на диске: дальше её
     судьба — наша забота, а не его. Если не записалась и не доставлена —
     честно отвечаем ошибкой, чтобы форма предложила запасной путь. */
  if (!stored && !delivered.length) return json(res, 502, { error: 'не удалось принять заявку' });
  return json(res, 200, { ok: true, delivered: delivered.join('+') || 'stored' });
}
