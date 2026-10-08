/* test-check.mjs — проверка чекера на поддельных сайтах.

   Внешнюю сеть в тестах не трогаем: поднимаем свой сервер на 127.0.0.1 и
   скармливаем ему те случаи, ради которых чекер и писался, — сайт без
   счётчика, конструктор, парковка, переезд, старая кодировка.

   Запуск: node test-check.mjs
   Тестовые имена вида *.test добавляются в /etc/hosts на время прогона:
   чекер ходит по имени домена, а не по пути, поэтому подменить его адресом
   нельзя — нужны разные имена, которые резолвятся в 127.0.0.1. */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { checkCompany, VERDICTS } from './check.mjs';
import { score } from './score.mjs';

const HOSTS = ['t-ads.test', 't-noads.test', 't-tilda.test', 't-old.test',
  't-parked.test', 't-cp1251.test', 't-404.test', 't-moved.test', 't-target.test'];
const MARK = '# crm-test';
const hostsBefore = readFileSync('/etc/hosts', 'utf8');
writeFileSync('/etc/hosts', hostsBefore.split('\n').filter((l) => !l.includes(MARK)).join('\n')
  + '\n' + HOSTS.map((h) => `127.0.0.1 ${h} ${MARK}`).join('\n') + '\n');
const restoreHosts = () => writeFileSync('/etc/hosts', hostsBefore);
process.on('exit', restoreHosts);

const PAGES = {
  '/live-ads': `<html><head><meta name="viewport" content="width=device-width"><title>Стоматология «Улыбка»</title></head>
    <body><form action="/send"><input type="tel"></form>
    <script>(function(m,e){m[e]=function(){};})(window,'ym');</script>
    <script src="https://mc.yandex.ru/metrika/tag.js"></script>© 2026 Улыбка</body></html>`,

  '/live-noads': `<html><head><meta name="viewport" content="width=device-width"><title>Автосервис на Волоколамском</title></head>
    <body><h1>Ремонт автомобилей</h1><form><input type="tel"></form>© 2019 Автосервис</body></html>`,

  '/tilda': `<html><head><title>Кафе «Весна»</title><meta name="viewport" content="width=device-width">
    <link href="https://static.tildacdn.com/css/tilda-grid-3.0.min.css" rel="stylesheet"></head><body>Кафе</body></html>`,

  '/old': `<html><head><title>Окна в Твери</title></head><body><h1>Пластиковые окна</h1>
    <p>Звоните</p>© 2014 Окна Плюс</body></html>`,

  '/parked': `<html><head><title>Домен продаётся</title></head><body>
    <h1>Этот домен продаётся</h1><p>Срок регистрации домена истёк.</p>
    <p>Обратитесь к регистратору, чтобы продлить или выкупить доменное имя прямо сейчас.</p></body></html>`,

  '/404': null,
};

const srv = createServer((req, res) => {
  const host = String(req.headers.host || '').split(':')[0];
  const ROUTE = { 't-ads.test': '/live-ads', 't-noads.test': '/live-noads', 't-tilda.test': '/tilda',
    't-old.test': '/old', 't-parked.test': '/parked', 't-404.test': '/404' };
  const p = ROUTE[host] || '/404';
  if (host === 't-moved.test') { res.writeHead(301, { location: 'http://t-target.test/' }); return res.end(); }
  if (host === 't-target.test') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(PAGES['/live-ads']); }
  if (host === 't-cp1251.test') {
    /* Страница в windows-1251: без перекодировки русские признаки не найдутся. */
    const html = '<html><head><meta charset="windows-1251"><title>Test</title></head>'
      + '<body><h1>Домен припаркован</h1></body></html>';
    const buf = Buffer.from([...html].map((ch) => {
      const c = ch.charCodeAt(0);
      if (c < 128) return c;
      if (c >= 0x410 && c <= 0x44f) return c - 0x410 + 0xc0;
      if (c === 0x451) return 0xb8;
      return 63;
    }));
    res.writeHead(200, { 'content-type': 'text/html; charset=windows-1251' });
    return res.end(buf);
  }
  const body = PAGES[p];
  if (body == null) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<h1>Not found</h1>'); }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(body);
});

const CASES = [
  ['сайт с Метрикой', 't-ads.test', 'live', (ch) => ch.tech.metrika && ch.tech.viewport],
  ['сайт без счётчиков', 't-noads.test', 'live', (ch) => !ch.tech.metrika && !ch.tech.ga],
  ['конструктор Tilda', 't-tilda.test', 'live', (ch) => ch.tech.cms === 'Tilda'],
  ['старый неадаптивный', 't-old.test', 'live', (ch) => !ch.tech.viewport && ch.tech.year === 2014],
  ['парковка', 't-parked.test', 'parked', () => true],
  ['парковка в cp1251', 't-cp1251.test', 'parked', () => true],
  ['страница 404', 't-404.test', 'http_error', (ch) => ch.status === 404],
  ['переезд на другой домен', 't-moved.test', 'moved', (ch) => ch.new_domain === 't-target.test'],
  ['домена не существует', 'this-domain-does-not-exist-9ab3f.invalid', 'dns_dead', () => true],
  ['сайта нет вовсе', '', 'no_site', () => true],
];

srv.listen(80, '127.0.0.1', async () => {
  let ok = 0, fail = 0;
  for (const [title, site, want, extra] of CASES) {
    const c = { name: title, site, categories: ['Автосервис / Автотовары'], mobiles: ['79101234567'], phones: [], emails: [] };
    const ch = await checkCompany(c);
    const good = ch.verdict === want && (ch.verdict === 'no_site' || ch.verdict === 'dns_dead' || extra(ch));
    console.log(`${good ? '  ok  ' : ' ПЛОХО'} ${title.padEnd(26)} → ${VERDICTS[ch.verdict]}`);
    if (!good) { console.log('        ожидали', want, 'получили', JSON.stringify(ch).slice(0, 220)); fail++; } else ok++;
  }

  /* Скоринг: сайт без счётчиков обязан получить больше баллов, чем сайт
     с Метрикой, — иначе список приоритетов бесполезен. */
  const mk = async (site) => {
    const c = { name: 'X', site, categories: ['Автосервис / Автотовары'], mobiles: ['79101234567'], phones: [], emails: ['a@b.ru'] };
    c.check = await checkCompany(c);
    return score(c);
  };
  const noads = await mk('t-noads.test');
  const ads = await mk('t-ads.test');
  const okScore = noads.priority > ads.priority && noads.needs.includes('context');
  console.log(`${okScore ? '  ok  ' : ' ПЛОХО'} скоринг: без счётчиков ${noads.priority} > с Метрикой ${ads.priority}`);
  okScore ? ok++ : fail++;
  console.log(`\n  повод для разговора: «${noads.hook}»`);
  console.log(`\nпройдено ${ok}, провалено ${fail}`);
  srv.close();
  restoreHosts();
  process.exit(fail ? 1 : 0);
});
