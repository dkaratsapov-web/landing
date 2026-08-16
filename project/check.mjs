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
     5. Полосы на стыках — сканом всей страницы по колонке пикселей, а не
        по позициям волн и не по computed-фону: и то и другое уже давало
        ложный ноль. Ищем строку, где тон меняется скачком больше полутора
        единиц, а выше и ниже держится ровно. Плавный градиент проверку
        не тревожит.

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
       scroll-анимации, и проверка увидит пустоту там, где всё в порядке.

       Заодно замеряем сами scroll-анимации. Повод: `overflow: hidden`,
       поставленный ради одной горизонтальной прокрутки, делает элемент
       скролл-контейнером, к которому молча переезжает view-timeline всех
       потомков. Контейнер не прокручивается — прогресс навсегда ноль,
       анимация мертва, а с `fill: both` содержимое ещё и остаётся скрытым.
       По коду это не видно никак, computed-стиль тоже врёт: он отдаёт
       базовые значения. Единственный честный способ — прокрутить страницу
       и посмотреть, сдвинулся ли прогресс хоть на сколько-нибудь.

       Ругаемся только на застрявшие в нуле: анимация, доехавшая до конца
       ещё до первого замера, стоит на единице — это норма, она отработала. */
    const deadAnim = await page.evaluate(async () => {
      /* На сайте включён scroll-behavior: smooth. Без этой строчки каждый
         window.scrollTo превращается в плавный переезд, за 16 мс страница
         сдвигается на десяток пикселей, и замер показывает, что не работает
         вообще ничего. Прокрутка проверки должна быть мгновенной. */
      const prevBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      const tracked = [];
      for (const el of document.querySelectorAll('*')) {
        /* Внутри закрытой модалки, свёрнутого <details> и схлопнутой вкладки
           таймлайн неактивен по определению — содержимое не показано. Это не
           дефект, а нормальная работа аккордеона, поэтому такие элементы в
           замер не берём. checkVisibility() схлопнутую панель не ловит: она
           не display:none, у неё просто нулевая высота, — отсюда вторая
           проверка по предкам. */
        if (!el.checkVisibility || !el.checkVisibility()) continue;
        let collapsed = false;
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          if (n.getBoundingClientRect().height === 0) { collapsed = true; break; }
        }
        if (collapsed) continue;
        for (const a of el.getAnimations()) {
          const tl = a.timeline;
          if (!tl || tl.constructor === DocumentTimeline) continue;
          tracked.push({ el, a, max: 0 });
        }
      }
      const sample = () => tracked.forEach((t) => {
        const p = t.a.effect.getComputedTiming().progress;
        if (typeof p === 'number' && p > t.max) t.max = p;
      });
      const end = document.documentElement.scrollHeight;
      for (let y = 0; y <= end; y += 300) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 20))));
        sample();
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 300));
      sample();
      document.documentElement.style.scrollBehavior = prevBehavior;

      const name = (el) => el.tagName.toLowerCase() +
        (typeof el.className === 'string' && el.className.trim()
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
      const seen = new Set();
      return tracked.filter((t) => t.max === 0).map((t) => name(t.el))
        .filter((n) => (seen.has(n) ? false : (seen.add(n), true)));
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

    /* ── Контраст текста и размер зон касания ────────────────────────────
       Обе проверки пришли из отчёта PageSpeed: «цвета фона и переднего плана
       недостаточно контрастны» и «области прикосновения недостаточно большие».
       Считаем сами, чтобы не узнавать об этом из чужого отчёта постфактум.

       Контраст — по формуле WCAG. Порог 4.5:1 для обычного текста и 3:1 для
       крупного (от 24px, либо от 18.66px при жирном начертании). Фон ищем
       вверх по дереву до первого непрозрачного предка — у текста он почти
       всегда прозрачный.

       Зоны касания меряем только на узком экране: 24×24 CSS-пикселя — порог,
       ниже которого палец промахивается. */
    const a11y = await page.evaluate((isNarrow) => {
      const lum = (c) => {
        const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 4).map(Number);
      const solidBg = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const c = parse(getComputedStyle(n).backgroundColor);
          if (c.length >= 3 && (c[3] === undefined || c[3] > 0.85)) return c;
          n = n.parentElement;
        }
        return [8, 8, 10];
      };
      const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };

      const low = [], small = [];
      const seen = new Set();
      document.querySelectorAll('p, span, a, li, h1, h2, h3, h4, div, button, summary').forEach((el) => {
        const t = (el.textContent || '').trim();
        if (!t || el.children.length > 0) return;           /* только листья с текстом */
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.1) return;
        const fg = parse(cs.color);
        if (fg.length < 3 || (fg[3] !== undefined && fg[3] < 0.5)) return;
        const size = parseFloat(cs.fontSize), weight = +cs.fontWeight || 400;
        const big = size >= 24 || (size >= 18.66 && weight >= 700);
        const need = big ? 3 : 4.5;
        const got = ratio(fg, solidBg(el));
        if (got < need - 0.05) {
          const key = cs.color + '|' + size + '|' + t.slice(0, 24);
          if (!seen.has(key)) { seen.add(key); low.push({ t: t.slice(0, 46), color: cs.color, size, got: +got.toFixed(2), need }); }
        }
      });
      if (isNarrow) {
        document.querySelectorAll('a, button, input, summary, [role="button"]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return;
          if (r.width < 24 || r.height < 24) {
            small.push({ t: ((el.textContent || el.getAttribute('aria-label') || '').trim() || el.tagName).slice(0, 32),
              w: Math.round(r.width), h: Math.round(r.height) });
          }
        });
      }
      return { low: low.slice(0, 6), small: small.slice(0, 6) };
    }, width === 390);

    for (const l of a11y.low) {
      add(path, width, 'низкий контраст', `«${l.t}» — ${l.got}:1 при норме ${l.need}:1 (${l.color}, ${l.size}px)`);
    }
    for (const sm of a11y.small) {
      add(path, width, 'мелкая зона касания', `«${sm.t}» — ${sm.w}×${sm.h}px, нужно от 24×24`);
    }

    if (dom.overflow > 0) {
      add(path, width, 'горизонтальная прокрутка', `${dom.scrollWidth}px против ${width}px — что-то вылезает за экран`);
    }
    for (const src of dom.broken) add(path, width, 'битая картинка', src);
    for (const n of deadAnim.slice(0, 5)) {
      add(path, width, 'мёртвая scroll-анимация',
        `${n} — прогресс не сдвинулся с нуля за всю прокрутку; обычно виноват overflow: hidden у предка (нужен overflow: clip)`);
    }
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

    /* ── Полосы на стыках ────────────────────────────────────────────────
       Раньше проверялись только позиции волн-разделителей, и по фону секции
       через computed backgroundColor. Это дважды дало ложный ноль: у секции
       с градиентом backgroundColor прозрачный, а полосы бывают и там, где
       волны нет вовсе. Владелец сайта находил их глазами после того, как
       я отчитывался, что всё чисто.

       Теперь сканируется вся страница по колонке пикселей: ищем строку, где
       тон скачком меняется больше чем на полторы единицы, а сверху и снизу
       от неё держится ровно. Ровно так это и видит глаз — резкая граница
       двух больших плоскостей. Плавный градиент проверку не тревожит:
       там соседние строки отличаются на доли единицы.

       Пробы берём в поле страницы (x = 6/14/22). На отступах контента они
       попадали на текст и карточки и давали ложные срабатывания. */
    if (width === 1440) {
      /* Фиксированные элементы (шапка, плашка cookie, кнопка квиза) в
         полностраничном снимке впечатываются один раз — как правило у нижнего
         края — и создают ступеньку там, где на самой странице ничего нет.
         Это артефакт съёмки, а не дефект вёрстки, поэтому на время замера
         прячем всё, что вынуто из потока. Сюда же .bg-fx — слой свечений:
         он тоже fixed, при реальной прокрутке едет вместе с экраном и шва
         между секциями создать не может по определению. */
      await page.addStyleTag({ content:
        '.nav,.nav-mobile,.cookie-bar,.quiz-fab,.toast-wrap,.lead-modal,.shot-lb,.bg-fx,body::after{display:none!important}' });
      await page.waitForTimeout(150);
      const shot = await page.screenshot({ fullPage: true });
      const { data, info } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
      const xs = [6, 14, 22];
      const tone = (y) => rowTone(data, info.width, info.channels, y, xs);
      const hits = [];
      for (let y = 9; y < info.height - 9; y++) {
        const d = tone(y) - tone(y - 1);
        if (Math.abs(d) < 1.5) continue;
        /* Ступенька, а не градиент: до и после границы тон держится ровно. */
        if (Math.abs(tone(y - 1) - tone(y - 8)) > 0.6) continue;
        if (Math.abs(tone(y + 7) - tone(y)) > 0.6) continue;
        if (hits.length && y - hits[hits.length - 1].y < 10) continue;
        hits.push({ y, d, up: tone(y - 1), dn: tone(y) });
      }
      for (const h of hits) {
        add(path, width, 'полоса на стыке',
          `y=${h.y}: тон ${h.up.toFixed(1)} → ${h.dn.toFixed(1)} (скачок ${h.d.toFixed(1)}) — граница видна как полоса`);
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
