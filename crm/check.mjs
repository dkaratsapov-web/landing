/* check.mjs — проверка компаний: жив ли домен и что стоит на сайте.

   Зачем это вообще. Справочник говорит только «сайт такой-то». Этого мало:
   домен мог умереть, переехать или оказаться у перекупщика. А главное — по
   самой странице видно, ведёт ли компания рекламу: нет счётчика Метрики,
   значит, и Директа нет. Это не догадка, а факт, который сразу превращается
   в повод для разговора.

   Вежливость. Один запрос на домен, параллельно не больше горстки, таймаут
   десять секунд, честный User-Agent с адресом сайта — чтобы администратор
   чужого сервера мог понять, кто к нему пришёл, и написать. Больше 256 КБ
   страницы не читаем: нужные признаки лежат в начале, а качать мегабайтные
   главные ради них незачем. */
import { lookup } from 'node:dns/promises';
import https from 'node:https';
import http from 'node:http';

/* Только латиница: заголовки HTTP передаются в latin1, кириллица в них
   роняет запрос на этапе сборки заголовков. */
const UA = 'KaratsapovCRM/1.0 (+https://karatsapov.ru; directory freshness check)';
const TIMEOUT = 10_000;
const MAX_BODY = 256 * 1024;
const MAX_REDIRECTS = 5;

/* Признаки, по которым читаем страницу. Порядок важен только для CMS:
   берём первое совпадение, а конструкторы идут раньше самописного Bitrix,
   потому что Tilda внутри тоже иногда отдаёт битриксовые пути. */
const TECH = {
  metrika: [/mc\.yandex\.ru\/(?:metrika|watch)/i, /ym\s*\(\s*\d{5,}/],
  ga: [/googletagmanager\.com\/gt[am]/i, /google-analytics\.com/i, /gtag\s*\(/],
  mailru: [/top-fwz1\.mail\.ru/i, /top\.mail\.ru\/counter/i],
  vk: [/vk\.com\/js\/api\/openapi/i, /VK\.Retargeting/i, /vk\.com\/rtrg/i],
  chat: [/jivo(?:site)?\./i, /cdn\.envybox/i, /talk-me\.ru/i, /carrotquest/i, /bitrix24.*crm\.?site\.?button/i],
};

const CMS = [
  ['Tilda', /tilda(?:cdn|\.ws|\.cc)/i],
  ['Nethouse', /nethouse\.(?:ru|site)/i],
  ['uCoz', /ucoz\.(?:ru|net)/i],
  ['1С-UMI', /\.umi\.ru|umi-cms/i],
  ['Megagroup', /megagroup\.ru|s\d+\.megagroup/i],
  ['InSales', /insales\.(?:ru|site)/i],
  ['WordPress', /wp-content|wp-includes|\/wp-json/i],
  ['1С-Битрикс', /bitrix\/(?:js|templates|cache)/i],
  ['Joomla', /\/media\/jui\/|joomla/i],
  ['OpenCart', /catalog\/view\/theme/i],
  ['ModX', /assets\/components|modx/i],
];

/* Парковка и заглушки регистраторов. Домен резолвится и отдаёт 200, но
   бизнеса за ним нет — без этой проверки такие попадут в «сайт работает». */
const PARKED = [
  /домен(?:ное имя)?\s+(?:припаркован|продаётся|продается|не\s+делегирован)/i,
  /этот домен (?:продаётся|продается|выставлен)/i,
  /срок регистрации домена (?:истёк|истек)/i,
  /domain (?:is )?(?:for sale|parking|expired)/i,
  /купить домен|買|this domain may be for sale/i,
  /заглушка|тестовая страница|default web site page|it works!/i,
  /сайт (?:находится )?(?:в разработке|создаётся|создается)/i,
  /добро пожаловать на nginx|apache2 (?:ubuntu|debian) default page/i,
];

function fetchOnce(url, redirectsLeft) {
  return new Promise((resolve) => {
    let u;
    try { u = new URL(url); } catch { return resolve({ error: 'плохой адрес' }); }
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request(u, {
      method: 'GET',
      headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8', 'accept-language': 'ru,en;q=0.8' },
      timeout: TIMEOUT,
      /* Половина небольших российских сайтов живёт с просроченным или
         самоподписанным сертификатом. Нас интересует содержимое, а не
         доверие к нему: мы ничего туда не отправляем и ничему не верим,
         поэтому ошибку сертификата не считаем поводом объявить сайт мёртвым. */
      rejectUnauthorized: false,
    }, (res) => {
      const code = res.statusCode;
      const loc = res.headers.location;
      if (code >= 300 && code < 400 && loc && redirectsLeft > 0) {
        res.destroy();
        const next = new URL(loc, u).toString();
        return resolve(fetchOnce(next, redirectsLeft - 1));
      }
      const ct = String(res.headers['content-type'] || '');
      const chunks = [];
      let len = 0;
      res.on('data', (d) => {
        chunks.push(d);
        len += d.length;
        if (len >= MAX_BODY) res.destroy();
      });
      res.on('close', () => resolve({ status: code, url: u.toString(), ct, body: Buffer.concat(chunks) }));
      res.on('error', () => resolve({ status: code, url: u.toString(), ct, body: Buffer.concat(chunks) }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ error: 'таймаут' }); });
    req.on('error', (e) => resolve({ error: e.code || e.message }));
    req.end();
  });
}

/* Кодировка. Старые сайты отдают windows-1251, и без перекодировки
   в тексте не находится ни одного русского слова — а по русским словам мы
   ловим парковку и год в копирайте. */
function decode(buf, ct, head) {
  const m = /charset=["']?([\w-]+)/i.exec(ct) || /charset=["']?([\w-]+)/i.exec(head);
  const cs = (m ? m[1] : 'utf-8').toLowerCase();
  try {
    if (cs.includes('1251')) return new TextDecoder('windows-1251').decode(buf);
    if (cs.includes('koi8')) return new TextDecoder('koi8-r').decode(buf);
  } catch { /* кодировка неизвестна — читаем как utf-8 */ }
  return buf.toString('utf8');
}

/* «Тот же сайт или другой» решаем по двум последним меткам домена: для
   .ru, .рф и .com этого достаточно, а глубже начинается список публичных
   суффиксов, который ради одной проверки тащить не стоит. */
const registrable = (host) => host.replace(/^www\./, '').split('.').slice(-2).join('.');

export async function checkCompany(c) {
  const at = new Date().toISOString();
  if (!c.site) return { at, verdict: 'no_site' };

  try {
    await lookup(c.site);
  } catch {
    return { at, domain: c.site, dns: false, verdict: 'dns_dead' };
  }

  let r = await fetchOnce('https://' + c.site, MAX_REDIRECTS);
  let https_ok = !r.error;
  if (r.error) r = await fetchOnce('http://' + c.site, MAX_REDIRECTS);
  if (r.error) return { at, domain: c.site, dns: true, verdict: 'http_dead', error: r.error };

  const head = r.body.subarray(0, 2048).toString('latin1');
  const html = decode(r.body, r.ct, head);
  const title = (/<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(html) || [])[1]?.trim().replace(/\s+/g, ' ') || '';

  const tech = {};
  for (const [k, pats] of Object.entries(TECH)) tech[k] = pats.some((p) => p.test(html));
  tech.cms = (CMS.find(([, p]) => p.test(html)) || [])[0] || '';
  tech.viewport = /name=["']viewport["']/i.test(html);
  tech.form = /<form[\s>]/i.test(html);
  const year = [...html.matchAll(/(?:©|&copy;|&#169;)[^<]{0,40}?(20[0-2]\d)/gi)].map((m) => +m[1]);
  tech.year = year.length ? Math.max(...year) : null;

  const finalHost = new URL(r.url).hostname;
  const moved = registrable(finalHost) !== registrable(c.site);
  /* Пустая страница тоже заглушка, но только если на ней нет даже заголовка:
     бывают честные одностраничники в пару сотен байт. */
  const parked = PARKED.some((p) => p.test(html)) || (html.length < 512 && !title);

  let verdict = 'live';
  if (r.status >= 400) verdict = 'http_error';
  else if (parked) verdict = 'parked';
  else if (moved) verdict = 'moved';

  return {
    at, domain: c.site, dns: true, https: https_ok,
    status: r.status, final_url: r.url, moved, new_domain: moved ? finalHost.replace(/^www\./, '') : '',
    title, tech, verdict, size: r.body.length,
  };
}

export const VERDICTS = {
  no_site: 'Сайта нет',
  dns_dead: 'Домен не существует',
  http_dead: 'Сайт не отвечает',
  http_error: 'Ошибка сервера',
  parked: 'Заглушка или парковка',
  moved: 'Переехал на другой домен',
  live: 'Работает',
};

/* ───────────────────── очередь проверки ───────────────────── */

/* Проверка идёт фоном и может занять часы: сервис должен оставаться
   отзывчивым, а прогресс — видимым. Состояние держим в памяти, результаты
   пишем в базу пачками, чтобы не дёргать диск на каждую компанию. */
export class Checker {
  constructor(store, score) {
    this.store = store;
    this.score = score;
    this.state = { running: false, done: 0, total: 0, startedAt: null, current: '', stop: false };
  }

  status() {
    const s = this.state;
    return {
      ...s,
      eta: s.running && s.done > 1
        ? Math.round((Date.now() - s.startedAt) / s.done * (s.total - s.done) / 1000)
        : null,
    };
  }

  async run(ids, concurrency = 6) {
    if (this.state.running) throw new Error('проверка уже идёт');
    this.state = { running: true, done: 0, total: ids.length, startedAt: Date.now(), current: '', stop: false };
    const queue = ids.slice();
    const worker = async () => {
      while (queue.length && !this.state.stop) {
        const id = queue.shift();
        const c = this.store.get(id);
        if (!c) continue;
        this.state.current = c.name;
        try {
          c.check = await checkCompany(c);
        } catch (e) {
          c.check = { at: new Date().toISOString(), verdict: 'http_dead', error: String(e.message || e) };
        }
        c.score = this.score(c);
        this.store.touch();
        this.state.done++;
        if (this.state.done % 25 === 0) this.store.save();
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
    this.store.save();
    this.state.running = false;
    this.state.current = '';
    return this.state;
  }
}
