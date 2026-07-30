/* lead-proxy.js — Cloudflare Worker: приём заявок с сайта и отправка в Telegram.
 *
 * Зачем: раньше токен бота лежал в lead-config.js и отдавался каждому
 * посетителю. Теперь токен живёт в переменных окружения воркера, а браузер
 * знает только адрес этого эндпойнта.
 *
 * Секреты (wrangler secret put ...):
 *   TG_TOKEN — токен бота от @BotFather
 *   TG_CHAT  — chat_id получателя (группы)
 * Переменные (vars в wrangler.toml):
 *   ALLOWED_ORIGINS — список Origin через запятую
 *
 * Опционально: биндинг RATE_LIMIT (Cloudflare Rate Limiting) — если он есть,
 * воркер им пользуется; если нет, работает без него.
 */

const MAX = { name: 100, phone: 32, site: 200, comment: 2000, source: 120, page: 300 };

function corsHeaders(origin, allowed) {
  const ok = allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed[0] || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

/* Обрезаем и чистим управляющие символы — в Telegram уходит наш собственный
   текст, но входные данные всё равно приходят из браузера. */
function clean(value, limit) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, limit);
}

function digitsOf(s) {
  return (String(s).match(/\d/g) || []).length;
}

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, cors);

    // Заявку принимаем только со своих доменов.
    if (allowed.length && !allowed.includes(origin)) {
      return json({ ok: false, error: 'forbidden_origin' }, 403, cors);
    }

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return json({ ok: false, error: 'bad_json' }, 400, cors);
    }

    // Honeypot: поле скрыто в CSS, человек его не заполнит, бот заполнит.
    // Отвечаем «ок», чтобы бот не понял, что его отсекли.
    if (clean(data.company, 100)) return json({ ok: true }, 200, cors);

    const phone = clean(data.phone, MAX.phone);
    if (digitsOf(phone) < 11) return json({ ok: false, error: 'bad_phone' }, 400, cors);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    if (env.RATE_LIMIT && typeof env.RATE_LIMIT.limit === 'function') {
      const { success } = await env.RATE_LIMIT.limit({ key: ip });
      if (!success) return json({ ok: false, error: 'rate_limited' }, 429, cors);
    }

    const name = clean(data.name, MAX.name);
    const site = clean(data.site, MAX.site);
    const comment = clean(data.comment, MAX.comment);
    const source = clean(data.source, MAX.source);
    const page = clean(data.page, MAX.page);

    const text = [
      '🟢 Новая заявка с сайта' + (source ? ' (' + source + ')' : ''),
      '👤 Имя: ' + (name || '—'),
      '📞 Телефон: ' + phone,
      site ? '🌐 Сайт: ' + site : null,
      comment ? '💬 Комментарий: ' + comment : null,
      page ? '📄 Страница: ' + page : null,
    ].filter(Boolean).join('\n');

    const tgUrl = 'https://api.telegram.org/bot' + env.TG_TOKEN + '/sendMessage';
    let tg;
    try {
      tg = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TG_CHAT,
          text,
          disable_web_page_preview: true,
        }),
      });
    } catch (e) {
      return json({ ok: false, error: 'telegram_unreachable' }, 502, cors);
    }

    if (!tg.ok) return json({ ok: false, error: 'telegram_error' }, 502, cors);

    const result = await tg.json().catch(() => ({}));
    if (!result.ok) return json({ ok: false, error: 'telegram_rejected' }, 502, cors);

    return json({ ok: true }, 200, cors);
  },
};
