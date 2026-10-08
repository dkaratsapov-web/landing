/* test-auth.mjs — проверка входа через Яндекс на поддельном Яндексе.

   Настоящий oauth.yandex.ru тесты не трогают: вместо него поднимается свой
   сервер, а адреса эндпоинтов подменяются переменными окружения. Так
   проверяется ровно то, что может сломаться у нас, — обмен кода на токен,
   сверка state, список разрешённых адресов и выдача сессии.

   Запуск: node test-auth.mjs */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSession, makeSession, YandexAuth } from './auth.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const FAKE_PORT = 9311;
const CRM_PORT = 9312;
const BASE = `http://127.0.0.1:${CRM_PORT}`;

let ok = 0, fail = 0;
const check = (cond, title, extra = '') => {
  console.log(`${cond ? '  ok  ' : ' ПЛОХО'} ${title}${cond || !extra ? '' : ' — ' + extra}`);
  cond ? ok++ : fail++;
};

/* Поддельный Яндекс: выдаёт токен по коду и описывает пользователя. */
const USERS = {
  'code-boss': { default_email: 'boss@yandex.ru', login: 'boss', real_name: 'Даниил Карацапов' },
  'code-stranger': { default_email: 'stranger@yandex.ru', login: 'stranger', real_name: 'Чужой' },
  'code-nomail': { login: 'nomail', real_name: 'Без почты', emails: [] },
};
const TOKENS = new Map();

const fake = createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/token') {
    let body = '';
    req.on('data', (d) => { body += d; });
    req.on('end', () => {
      const code = new URLSearchParams(body).get('code');
      if (!USERS[code]) {
        res.writeHead(400, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ error: 'invalid_grant', error_description: 'код не найден' }));
      }
      const token = 'tok-' + code;
      TOKENS.set(token, USERS[code]);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ access_token: token, token_type: 'bearer', expires_in: 3600 }));
    });
    return;
  }
  if (u.pathname === '/info') {
    const token = String(req.headers.authorization || '').replace('OAuth ', '');
    const user = TOKENS.get(token);
    if (!user) { res.writeHead(401); return res.end('{}'); }
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(user));
  }
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end('<h1>поддельная страница согласия Яндекса</h1>');
});

const cookieFrom = (res, name) => {
  for (const c of res.headers.getSetCookie?.() || []) {
    const m = new RegExp(`^${name}=([^;]*)`).exec(c);
    if (m) return decodeURIComponent(m[1]);
  }
  return '';
};

await new Promise((r) => fake.listen(FAKE_PORT, '127.0.0.1', r));

const crm = spawn(process.execPath, [join(DIR, 'server.mjs')], {
  env: {
    ...process.env,
    CRM_PORT: String(CRM_PORT),
    CRM_DATA: '/tmp/crm-auth-test/base.ndjson',
    CRM_PASSWORD: '',
    CRM_SECRET: 'test-secret-для-подписи',
    CRM_BASE_URL: BASE,
    CRM_YANDEX_CLIENT_ID: 'test-client',
    CRM_YANDEX_CLIENT_SECRET: 'test-secret',
    CRM_ALLOWED_EMAILS: 'boss@yandex.ru',
    CRM_YANDEX_AUTHORIZE_URL: `http://127.0.0.1:${FAKE_PORT}/authorize`,
    CRM_YANDEX_TOKEN_URL: `http://127.0.0.1:${FAKE_PORT}/token`,
    CRM_YANDEX_INFO_URL: `http://127.0.0.1:${FAKE_PORT}/info`,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
crm.stderr.on('data', (d) => process.stderr.write('[crm] ' + d));
await new Promise((r) => {
  crm.stdout.on('data', (d) => { if (String(d).includes('слушает')) r(); });
  setTimeout(r, 4000);
});

try {
  /* 1. Без входа внутрь не пускают. */
  let r = await fetch(BASE + '/api/stats');
  check(r.status === 401, 'без входа API отвечает 401', 'статус ' + r.status);

  /* 2. Способы входа: пароль выключен, Яндекс включён. */
  const methods = await (await fetch(BASE + '/api/auth-methods')).json();
  check(methods.yandex === true && methods.password === false,
    'сервер сообщает, что вход только через Яндекс', JSON.stringify(methods));

  /* 3. Старт входа ведёт на Яндекс и кладёт state в куку. */
  r = await fetch(BASE + '/auth/yandex', { redirect: 'manual' });
  const loc = new URL(r.headers.get('location'));
  const state = cookieFrom(r, 'crm_state');
  check(r.status === 302 && loc.port === String(FAKE_PORT) && loc.searchParams.get('state') === state
    && loc.searchParams.get('redirect_uri') === BASE + '/auth/yandex/callback'
    && loc.searchParams.get('scope').includes('login:email'),
    'старт входа ведёт на Яндекс с нужными параметрами', loc.search);

  /* 4. Возврат с чужим state отбивается. */
  r = await fetch(`${BASE}/auth/yandex/callback?code=code-boss&state=подделка`,
    { headers: { cookie: `crm_state=${state}` }, redirect: 'manual' });
  check(r.status === 400, 'возврат с подделанным state отвергается', 'статус ' + r.status);

  /* 5. Нормальный вход: сессия выдана, API открылся. */
  r = await fetch(`${BASE}/auth/yandex/callback?code=code-boss&state=${state}`,
    { headers: { cookie: `crm_state=${state}` }, redirect: 'manual' });
  const sess = cookieFrom(r, 'crm_session');
  check(r.status === 302 && r.headers.get('location') === '/' && sess,
    'разрешённый адрес входит и получает сессию', 'статус ' + r.status);

  r = await fetch(BASE + '/api/stats', { headers: { cookie: `crm_session=${encodeURIComponent(sess)}` } });
  check(r.status === 200, 'с сессией API открыт', 'статус ' + r.status);

  const me = await (await fetch(BASE + '/api/me',
    { headers: { cookie: `crm_session=${encodeURIComponent(sess)}` } })).json();
  check(me && me.email === 'boss@yandex.ru' && me.kind === 'yandex',
    'сервис знает, кто вошёл', JSON.stringify(me));

  /* 6. Тот же state второй раз не работает — защита от повтора запроса. */
  r = await fetch(`${BASE}/auth/yandex/callback?code=code-boss&state=${state}`,
    { headers: { cookie: `crm_state=${state}` }, redirect: 'manual' });
  check(r.status === 400, 'повторное использование state отвергается', 'статус ' + r.status);

  /* 7. Чужой яндекс-аккаунт проходит OAuth, но внутрь не попадает.
        Это главная проверка во всём файле: без списка адресов вход через
        Яндекс означал бы «пускаем любого, у кого есть яндекс-почта». */
  r = await fetch(BASE + '/auth/yandex', { redirect: 'manual' });
  const st2 = cookieFrom(r, 'crm_state');
  r = await fetch(`${BASE}/auth/yandex/callback?code=code-stranger&state=${st2}`,
    { headers: { cookie: `crm_state=${st2}` }, redirect: 'manual' });
  const body = await r.text();
  check(r.status === 403 && !cookieFrom(r, 'crm_session') && body.includes('stranger@yandex.ru'),
    'чужой яндекс-аккаунт получает отказ и не получает сессию', 'статус ' + r.status);

  /* 8. Аккаунт без почтового адреса. */
  r = await fetch(BASE + '/auth/yandex', { redirect: 'manual' });
  const st3 = cookieFrom(r, 'crm_state');
  r = await fetch(`${BASE}/auth/yandex/callback?code=code-nomail&state=${st3}`,
    { headers: { cookie: `crm_state=${st3}` }, redirect: 'manual' });
  check(r.status === 502 || r.status === 403, 'аккаунт без почты не пускают', 'статус ' + r.status);

  /* 9. Отказ на стороне Яндекса показывается человеку, а не роняет сервис. */
  r = await fetch(`${BASE}/auth/yandex/callback?error=access_denied&error_description=отказ`,
    { redirect: 'manual' });
  check(r.status === 400, 'отказ пользователя обрабатывается', 'статус ' + r.status);

  /* 10. Подпись сессии: подделать нельзя, чужим секретом не прочитать. */
  const good = makeSession('секрет', 'boss@yandex.ru');
  check(readSession('секрет', good.value)?.email === 'boss@yandex.ru', 'своя сессия читается');
  check(readSession('другой-секрет', good.value) === null, 'сессия с чужим секретом отвергается');
  check(readSession('секрет', good.value.replace('boss', 'hack')) === null,
    'подмена адреса в куке ломает подпись');

  /* 11. Снятие доступа действует сразу: адрес убрали — сессия больше не годится. */
  const ya2 = new YandexAuth({ CRM_ALLOWED_EMAILS: 'other@yandex.ru' });
  check(!ya2.isAllowed('boss@yandex.ru'), 'убранный из списка адрес теряет доступ');
  const ya3 = new YandexAuth({ CRM_ALLOWED_EMAILS: '' });
  check(!ya3.isAllowed('кто@угодно.ru'), 'пустой список не пускает никого');
} finally {
  crm.kill();
  fake.close();
}

console.log(`\nпройдено ${ok}, провалено ${fail}`);
process.exit(fail ? 1 : 0);
