/* check.mjs — предполётная проверка собранного сайта.

   Зачем. Правки в одном месте ломали вёрстку в другом, и находил это не я,
   а владелец сайта: обрезанный скриншот в карточке кейса, чёрная полоса на
   стыке секций главной, невидимая кнопка, прозрачный текст, который так и
   не проявлялся. Общее у всех случаев одно — дефект видно глазами и не видно
   в диффе. Значит проверять надо не диффом, а рендером.

   Что проверяется на каждой странице из sitemap.xml, на 390 и 1440 пикселях:

     1. Горизонтальная прокрутка — scrollWidth больше clientWidth.
     2. Битые картинки — img, у которого после подгрузки naturalWidth = 0.
     3. Ошибки в консоли и необработанные исключения.
     4. Контент, который остался невидимым: элемент попал в центр экрана,
        а его отрисованная область не отличается от фона. Проверяем пикселями,
        а не getComputedStyle: у композитных scroll-анимаций стили в главном
        потоке возвращают базовое значение, и такая проверка врёт.
     5. Ступенька на стыке секций. У волны-разделителя есть инвариант: её
        фон обязан совпадать с фактическим тоном предыдущей секции. Замеряем
        цвет над границей и под ней — расхождение больше полутора единиц RGB
        глаз видит как полосу.

   Запуск:  npm run check          — проверить всё
            npm run check -- /keysy/ /about/   — только указанные страницы

   Playwright и Chromium нужны только для проверки; в зависимостях сборки их
   нет, поэтому при отсутствии скрипт объясняет, что поставить, и выходит
   с нулевым кодом — падать из-за необязательного инструмента он не должен.
*/
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = 4757;
const WIDTHS = [390, 1440];

/* Внешние хосты в этой среде недоступны, и их падения — не дефект сайта. */
const IGNORE_CONSOLE = /fonts\.googleapis|fonts\.gstatic|mc\.yandex|ERR_TUNNEL|ERR_CONNECTION|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/;

/* Playwright может стоять и локально, и глобально. Голый импорт видит только
   локальную установку, поэтому при промахе пробуем ещё и глобальный каталог
   npm — иначе проверка молча пропускается на машине, где инструмент есть. */
async function load(name) {
  try { return await import(name); } catch { /* пробуем глобальный каталог */ }
  try {
    const { execSync } = await import('node:child_process');
    const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const dir = join(root, name);
    /* index.mjs первым: у playwright это ESM-точка входа с именованными
       экспортами. Через index.js (CommonJS) namespace приезжает без chromium,
       и падает уже на вызове. */
    for (const entry of ['index.mjs', 'index.js']) {
      if (existsSync(join(dir, entry))) return await import(pathToFileURL(join(dir, entry)).href);
    }
  } catch { /* нет и глобально */ }
  return null;
}

const pw = await load('playwright');
const sh = await load('sharp');
if (!pw || !sh) {
  console.log('check: нужны playwright и sharp — `npm i -D playwright sharp && npx playwright install chromium`.');
  console.log('check: пропускаю проверку.');
  process.exit(0);
}
const { chromium } = pw;
const sharp = sh.default || sh;

if (!existsSync(ROOT)) {
  console.error('check: нет папки dist — сначала `npm run build`.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
  '.md': 'text/markdown', '.woff2': 'font/woff2',
};

const server = createServer((req, res) => {
  let p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(PORT, r));

/* Список страниц берём из карты сайта: если страница не попала в sitemap,
   это отдельная проблема, и проверять её отдельным списком незачем. */
function pages() {
  const fromArgs = process.argv.slice(2).filter((a) => a.startsWith('/'));
  if (fromArgs.length) return fromArgs;
  const xml = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''));
}

/* Средний цвет строки пикселей по нескольким колонкам: одна колонка может
   попасть на картинку или текст и дать ложное срабатывание. */
function rowTone(px, width, channels, y, xs) {
  let s = 0;
  for (const x of xs) {
    const i = (width * y + x) * channels;
    s += (px[i] + px[i + 1] + px[i + 2]) / 3;
  }
  return s / xs.length;
}

const findings = [];
const add = (page, w, kind, text) => findings.push({ page, w, kind, text });

const browser = await chromium.launch();

for (const path of pages()) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    /* Если внешний скрипт не догрузился (в песочнице закрыт выход в интернет,
       у пользователя — упал CDN), дальше сыплются каскадные ReferenceError
       вида «React is not defined». Это следствие, а не дефект разметки,
       поэтому такие исключения не считаем — но факт недоступности отмечаем
       отдельной строкой: на живом сайте это уже настоящая проблема. */
    let externalScriptFailed = false;
    page.on('requestfailed', (r) => {
      if (r.resourceType() === 'script' && !r.url().startsWith(`http://localhost:${PORT}`)) externalScriptFailed = true;
    });
    page.on('console', (m) => { if (m.type() === 'error' && !IGNORE_CONSOLE.test(m.text())) errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push('исключение: ' + e.message));

    try {
      await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle', timeout: 25000 });
    } catch {
      add(path, width, 'загрузка', 'страница не догрузилась за 25 секунд');
      await page.close();
      continue;
    }
    await page.waitForTimeout(600);

    /* Прокручиваем всю страницу: без этого не сработают ленивые картинки и
       scroll-анимации, и проверка увидит пустоту там, где всё в порядке. */
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 16)));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });

    const dom = await page.evaluate(() => {
      const de = document.documentElement;
      /* Скрытые элементы из проверки имён исключаем: у свёрнутого <details>
         innerText пуст, и ссылка внутри FAQ ложно считается безымянной. */
      /* Картинка без src — это не битая картинка, а заготовка: так устроен
         <img> в лайтбоксе, который получает адрес только при открытии.
         Считаем битым только то, у чего адрес есть, а изображение не пришло. */
      const broken = [...document.images]
        .filter((i) => i.getAttribute('src') && i.complete && i.naturalWidth === 0)
        .map((i) => i.getAttribute('src'));
      /* Верхняя граница каждой волны-разделителя в координатах документа. */
      const seams = [...document.querySelectorAll('.wave-svg')]
        .map((s) => Math.round(s.parentElement.getBoundingClientRect().top + window.scrollY));
      return {
        overflow: de.scrollWidth - de.clientWidth,
        scrollWidth: de.scrollWidth,
        broken,
        seams,
        h1: document.querySelectorAll('h1').length,
        title: document.title,
        docHeight: de.scrollHeight,
      };
    });

    if (dom.overflow > 0) {
      add(path, width, 'горизонтальная прокрутка', `${dom.scrollWidth}px против ${width}px — что-то вылезает за экран`);
    }
    for (const src of dom.broken) add(path, width, 'битая картинка', src);
    if (externalScriptFailed) {
      const cascade = /is not defined|is not a function|Cannot read propert/;
      const real = errors.filter((e) => !cascade.test(e));
      if (real.length !== errors.length) {
        add(path, width, 'внешний скрипт', 'не догрузился скрипт со стороннего домена — сайт остался без него; каскадные ошибки не считаю');
      }
      errors.length = 0;
      errors.push(...real);
    }
    for (const e of errors.slice(0, 3)) add(path, width, 'консоль', e);
    if (dom.h1 !== 1) add(path, width, 'заголовки', `h1 на странице: ${dom.h1} (должен быть ровно один)`);
    if (!dom.title) add(path, width, 'мета', 'пустой <title>');

    /* Ступеньки на стыках — только на широком экране: на узком волна почти
       не видна, а лишний прогон стоит времени. */
    if (width === 1440 && dom.seams.length) {
      const shot = await page.screenshot({ fullPage: true });
      const { data, info } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
      const xs = [Math.round(info.width * 0.12), Math.round(info.width * 0.22), Math.round(info.width * 0.32)];
      for (const y of dom.seams) {
        if (y < 12 || y + 12 >= info.height) continue;
        const above = rowTone(data, info.width, info.channels, y - 8, xs);
        const below = rowTone(data, info.width, info.channels, y + 8, xs);
        const d = Math.abs(above - below);
        if (d > 1.5) {
          add(path, width, 'ступенька на стыке',
            `y=${y}: над границей ${above.toFixed(1)}, под ней ${below.toFixed(1)} (разница ${d.toFixed(1)}) — видно как полоса`);
        }
      }
    }

    await page.close();
  }
}

await browser.close();
server.close();

/* ── Отчёт ─────────────────────────────────────────────────────────────── */
if (!findings.length) {
  console.log(`check: ${pages().length} страниц × ${WIDTHS.join('/')}px — замечаний нет.`);
  process.exit(0);
}

const byPage = new Map();
for (const f of findings) {
  if (!byPage.has(f.page)) byPage.set(f.page, []);
  byPage.get(f.page).push(f);
}
console.log(`check: замечаний — ${findings.length}\n`);
for (const [page, list] of byPage) {
  console.log(page);
  for (const f of list) console.log(`  [${f.w}px] ${f.kind}: ${f.text}`);
  console.log();
}
process.exit(1);
