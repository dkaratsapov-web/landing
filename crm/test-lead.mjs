/* test-lead.mjs — проверка приёма заявок на поддельном MAX.

   Настоящий platform-api2.max.ru тесты не трогают: вместо него поднимается
   свой сервер, а его адрес подставляется через LEAD_MAX_API. Так
   проверяется то, что может сломаться у нас: формат запроса к MAX, запись
   на диск, honeypot, ограничение частоты и то, что эндпоинт открыт без
   входа, а всё остальное API — нет.

   Запуск: node test-lead.mjs */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const MAX_PORT = 9411;
const CRM_PORT = 9412;
const BASE = `http://127.0.0.1:${CRM_PORT}`;
const LEADS = '/tmp/crm-lead-test/leads.ndjson';

let ok = 0, fail = 0;
const check = (cond, title, extra = '') => {
  console.log(`${cond ? '  ok  ' : ' ПЛОХО'} ${title}${cond || !extra ? '' : ' — ' + extra}`);
  cond ? ok++ : fail++;
};

rmSync('/tmp/crm-lead-test', { recursive: true, force: true });

/* Поддельный MAX: запоминает, что и с какими заголовками ему прислали. */
const got = [];
let maxDown = false;
const fakeMax = createServer((req, res) => {
  let body = '';
  req.on('data', (d) => { body += d; });
  req.on('end', () => {
    if (maxDown) { res.writeHead(500); return res.end('{}'); }
    got.push({
      url: req.url,
      auth: req.headers.authorization || '',
      ctype: req.headers['content-type'] || '',
      body: (() => { try { return JSON.parse(body); } catch { return {}; } })(),
    });
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ message: { body: { mid: 'mid-1' } } }));
  });
});
await new Promise((r) => fakeMax.listen(MAX_PORT, '127.0.0.1', r));

const crm = spawn(process.execPath, [join(DIR, 'server.mjs')], {
  env: {
    ...process.env,
    CRM_PORT: String(CRM_PORT),
    CRM_DATA: '/tmp/crm-lead-test/base.ndjson',
    CRM_PASSWORD: 'test-password',
    CRM_SECRET: 'test-secret',
    LEAD_MAX_API: `http://127.0.0.1:${MAX_PORT}`,
    LEAD_MAX_TOKEN: 'test-token-abc123',
    LEAD_MAX_USER_ID: '777',
    LEAD_TG_TOKEN: '',
    LEAD_TG_CHAT: '',
    LEAD_FILE: LEADS,
    LEAD_ORIGINS: 'https://karatsapov.ru',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
crm.stderr.on('data', (d) => process.stderr.write('[crm] ' + d));
await new Promise((r) => {
  crm.stdout.on('data', (d) => { if (String(d).includes('слушает')) r(); });
  setTimeout(r, 4000);
});

/* Каждый сценарий ходит со своего адреса: ограничение частоты считает по
   адресу, и без этого тесты начали бы влиять друг на друга. */
let ipN = 0;
const post = (payload, headers = {}) => fetch(BASE + '/api/lead', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    origin: 'https://karatsapov.ru',
    'x-forwarded-for': '10.0.0.' + (++ipN),
    ...headers,
  },
  body: JSON.stringify(payload),
});

try {
  /* 1. Эндпоинт открыт без входа — им пользуется посетитель, а не владелец. */
  let r = await post({ name: 'Иван', phone: '+7 (996) 347-00-65', source: 'главная' });
  let j = await r.json();
  check(r.status === 200 && j.ok && j.delivered === 'max',
    'заявка принимается без входа и уходит в MAX', `статус ${r.status} ${JSON.stringify(j)}`);

  /* 2. Запрос к MAX собран ровно так, как требует документация. */
  const sent = got[0] || {};
  check(sent.url === '/messages?user_id=777', 'user_id уходит в query', sent.url);
  check(sent.auth === 'test-token-abc123', 'токен в заголовке Authorization, без Bearer', sent.auth);
  check(String(sent.ctype || '').includes('application/json'), 'content-type json', String(sent.ctype));
  check(typeof sent.body?.text === 'string' && sent.body.text.includes('347-00-65'),
    'в сообщении есть телефон', JSON.stringify(sent.body).slice(0, 120));

  /* 3. Заявка записана на диск до отправки. */
  const line = existsSync(LEADS) ? readFileSync(LEADS, 'utf8').trim().split('\n')[0] : '';
  const saved = line ? JSON.parse(line) : {};
  check(saved.name === 'Иван' && saved.phone.includes('347-00-65'),
    'заявка записана на диск', line.slice(0, 120));

  /* 4. Готовый текст от форм на страницах услуг. */
  r = await post({ text: '🟢 Заявка\n📞 +7 996 347 00 65' });
  check(r.status === 200, 'принимается готовый текст заявки', 'статус ' + r.status);

  /* 5. Honeypot: бот заполнил скрытое поле — тихо отбрасываем. */
  const before = got.length;
  r = await post({ name: 'Бот', phone: '+7 996 347 00 65', website: 'http://spam' });
  j = await r.json();
  check(r.status === 200 && j.delivered === 'ignored' && got.length === before,
    'honeypot отбрасывает бота и ничего не отправляет', JSON.stringify(j));

  /* 6. Без телефона не принимаем. */
  r = await post({ name: 'Иван', phone: '123' });
  check(r.status === 400, 'заявка без телефона отклоняется', 'статус ' + r.status);

  /* 7. Чужой источник. */
  r = await post({ name: 'Иван', phone: '+7 996 347 00 65' }, { origin: 'https://evil.example' });
  check(r.status === 403, 'заявка с чужого домена отклоняется', 'статус ' + r.status);

  /* 8. Ограничение частоты: лимит 8 за окно, девятая с того же адреса не проходит. */
  let last = 0;
  for (let i = 0; i < 9; i++) {
    last = (await post({ name: 'Иван', phone: '+7 996 347 00 65' },
      { 'x-forwarded-for': '10.9.9.9' })).status;
  }
  check(last === 429, 'частые заявки с одного адреса отбиваются', 'статус ' + last);

  /* 9. MAX недоступен — заявка всё равно принята и лежит на диске. */
  maxDown = true;
  const crm2 = await fetch(BASE + '/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://karatsapov.ru',
      'x-forwarded-for': '10.1.2.3' },
    body: JSON.stringify({ name: 'Пётр', phone: '+7 996 111 22 33' }),
  });
  j = await crm2.json();
  const all = readFileSync(LEADS, 'utf8');
  check(crm2.status === 200 && j.delivered === 'stored' && all.includes('Пётр'),
    'при недоступном MAX заявка не теряется', `статус ${crm2.status} ${JSON.stringify(j)}`);
  maxDown = false;

  /* 10. Остальное API по-прежнему закрыто. */
  r = await fetch(BASE + '/api/stats');
  check(r.status === 401, 'остальные методы API закрыты входом', 'статус ' + r.status);

  /* 11. GET на эндпоинт. */
  r = await fetch(BASE + '/api/lead');
  check(r.status === 405, 'GET на приём заявок отклоняется', 'статус ' + r.status);
} finally {
  crm.kill();
  fakeMax.close();
}

console.log(`\nпройдено ${ok}, провалено ${fail}`);
process.exit(fail ? 1 : 0);
