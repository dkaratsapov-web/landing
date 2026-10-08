/* auth.mjs — вход через Яндекс ID (OAuth 2.0).

   Важно понимать, что именно даёт OAuth. Он отвечает ровно на один вопрос:
   «этот человек действительно владеет таким-то яндекс-аккаунтом». Он НЕ
   отвечает на вопрос «пускать ли его». Яндекс-аккаунт есть у ста миллионов
   человек, и каждый из них пройдёт эту проверку успешно.

   Поэтому дверь закрывает не Яндекс, а список CRM_ALLOWED_EMAILS. Яндекс
   только подтверждает, что человек — тот, за кого себя выдаёт.

   Как настроить:
     1. https://oauth.yandex.ru/client/new — создать приложение
     2. Платформа: «Веб-сервисы», Redirect URI:
        https://crm.karatsapov.ru/auth/yandex/callback
     3. Доступы: «Доступ к адресу электронной почты» (login:email)
        и «Доступ к логину, имени и фамилии» (login:info)
     4. Полученные ID и пароль приложения — в /etc/crm.env:
        CRM_YANDEX_CLIENT_ID=...
        CRM_YANDEX_CLIENT_SECRET=...
        CRM_BASE_URL=https://crm.karatsapov.ru
        CRM_ALLOWED_EMAILS=вы@yandex.ru
*/
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

/* Адреса эндпоинтов вынесены в переменные окружения ради тестов: подменив их
   на локальный сервер, можно прогнать весь сценарий входа, не выходя наружу.
   В бою их никто не трогает, и значения по умолчанию верные. */
const OAUTH_AUTHORIZE = process.env.CRM_YANDEX_AUTHORIZE_URL || 'https://oauth.yandex.ru/authorize';
const OAUTH_TOKEN = process.env.CRM_YANDEX_TOKEN_URL || 'https://oauth.yandex.ru/token';
const OAUTH_INFO = process.env.CRM_YANDEX_INFO_URL || 'https://login.yandex.ru/info';

export class YandexAuth {
  constructor(env = process.env) {
    this.clientId = env.CRM_YANDEX_CLIENT_ID || '';
    this.clientSecret = env.CRM_YANDEX_CLIENT_SECRET || '';
    this.baseUrl = (env.CRM_BASE_URL || '').replace(/\/+$/, '');
    this.allowed = new Set(
      (env.CRM_ALLOWED_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean));
    /* Ожидающие входы: state → когда создан. Живёт в памяти, потому что
       дольше десяти минут state и не нужен. */
    this.pending = new Map();
  }

  get enabled() { return Boolean(this.clientId && this.clientSecret && this.baseUrl); }
  get redirectUri() { return this.baseUrl + '/auth/yandex/callback'; }

  /* Почему именно так: без списка разрешённых адресов вход через Яндекс
     означал бы «заходите все, у кого есть почта на Яндексе». Поэтому пустой
     список — это не «пускать всех», а «не пускать никого». */
  isAllowed(email) {
    return this.allowed.has(String(email || '').toLowerCase());
  }

  /* state защищает от подделки запроса: злоумышленник не может заставить
     браузер жертвы завершить вход по чужому коду, потому что не знает,
     какое значение мы положили в куку. */
  startUrl() {
    const state = randomBytes(16).toString('hex');
    this.pending.set(state, Date.now());
    for (const [k, t] of this.pending) if (Date.now() - t > 10 * 60_000) this.pending.delete(k);
    const u = new URL(OAUTH_AUTHORIZE);
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('client_id', this.clientId);
    u.searchParams.set('redirect_uri', this.redirectUri);
    u.searchParams.set('scope', 'login:email login:info');
    u.searchParams.set('state', state);
    u.searchParams.set('force_confirm', 'yes');
    return { url: u.toString(), state };
  }

  checkState(state, cookieState) {
    if (!state || !cookieState) return false;
    if (Buffer.byteLength(state) !== Buffer.byteLength(cookieState)) return false;
    if (!timingSafeEqual(Buffer.from(state), Buffer.from(cookieState))) return false;
    const born = this.pending.get(state);
    this.pending.delete(state);
    return Boolean(born) && Date.now() - born < 10 * 60_000;
  }

  async exchange(code) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
    });
    const r = await fetch(OAUTH_TOKEN, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.access_token) {
      throw new Error(`Яндекс не выдал токен: ${data.error_description || data.error || r.status}`);
    }
    return data.access_token;
  }

  async userInfo(token) {
    const r = await fetch(OAUTH_INFO + '?format=json', {
      headers: { authorization: 'OAuth ' + token },
    });
    if (!r.ok) throw new Error('Яндекс не отдал данные пользователя: ' + r.status);
    const u = await r.json();
    /* default_email есть не всегда — у аккаунтов с телефоном вместо почты
       его может не быть, тогда берём первый из списка. */
    const email = u.default_email || (u.emails || [])[0] || '';
    return { email, login: u.login || '', name: u.real_name || u.display_name || '' };
  }

  async complete(code) {
    const token = await this.exchange(code);
    const user = await this.userInfo(token);
    if (!user.email) throw new Error('у аккаунта нет почтового адреса');
    if (!this.isAllowed(user.email)) {
      const e = new Error(`${user.email} нет в списке разрешённых адресов`);
      e.forbidden = true;
      e.email = user.email;
      throw e;
    }
    return user;
  }
}

/* ───────────────────────── сессия ───────────────────────── */

/* В подпись входит адрес, а не только время. Благодаря этому достаточно
   убрать человека из CRM_ALLOWED_EMAILS и перезапустить сервис, чтобы его
   выкинуло: при каждой проверке сессии адрес сверяется со списком заново. */
export function makeSession(secret, email, ttlDays = 30) {
  const ts = Date.now();
  const payload = `${ts}.${email}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return { value: `${payload}.${sig}`, maxAge: ttlDays * 24 * 3600 };
}

export function readSession(secret, raw, ttlDays = 30) {
  if (!raw) return null;
  const i = raw.lastIndexOf('.');
  if (i < 0) return null;
  const payload = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  const want = createHmac('sha256', secret).update(payload).digest('hex');
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(want, 'hex'))) return null;
  } catch { return null; }
  const dot = payload.indexOf('.');
  const ts = +payload.slice(0, dot);
  const email = payload.slice(dot + 1);
  if (!ts || Date.now() - ts > ttlDays * 24 * 3600 * 1000) return null;
  return { ts, email };
}
