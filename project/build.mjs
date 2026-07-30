/* build.mjs — pre-compile the no-build JSX prototype into a fast production
   bundle for GitHub Pages. Transpiles each .jsx with Babel (preset-react),
   minifies with Terser (toplevel:false — the files share one global lexical
   scope across classic <script> tags, so top-level names must be preserved),
   and emits an optimized index.html that uses production React and NO Babel
   runtime. Run with the deps installed in /tmp:
     NODE_PATH=/tmp/node_modules node project/build.mjs <srcDir> <outDir>
*/
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createContext, runInContext } from 'node:vm';
import { join } from 'node:path';
import babel from '@babel/core';
import { minify } from 'terser';

const srcDir = process.argv[2] || '.';
const outDir = process.argv[3] || './dist';

// Order matters: later files reference top-level const/function from earlier ones.
// Порядок важен: поздние файлы ссылаются на top-level const/function ранних.
// tweaks-panel.jsx — панель разработчика, в продакшен-бандл не подключается
// (app.jsx рендерит её только когда TweaksPanel определён).
const JSX_FILES = [
  'icons.jsx', 'shared.jsx', 'extras.jsx',
  'nav-hero-about.jsx', 'services-process-cases.jsx',
  'audit-contacts-quiz.jsx', 'app.jsx',
];
// React самохостится из node_modules: unpkg — не продакшен-CDN, без SLA,
// и при его недоступности страница раньше оставалась белой. Локальные файлы
// убирают внешний коннект и делают загрузку предсказуемой.
const REACT = 'assets/vendor/react.production.min.js';
const REACTDOM = 'assets/vendor/react-dom.production.min.js';
const SITE = 'https://xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai';

mkdirSync(outDir, { recursive: true });

async function compile(file) {
  const code = readFileSync(join(srcDir, file), 'utf8');
  const out = babel.transformSync(code, {
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    compact: false, comments: false, babelrc: false, configFile: false,
  }).code;
  // toplevel:false keeps cross-script global names intact.
  const min = await minify(out, { compress: true, mangle: false, toplevel: false });
  const jsName = file.replace(/\.jsx$/, '.js');
  writeFileSync(join(outDir, jsName), min.code, 'utf8');
  return { jsName, raw: code.length, min: min.code.length };
}

const results = [];
for (const f of JSX_FILES) results.push(await compile(f));

// Вендоры: React и ReactDOM кладём рядом с сайтом вместо загрузки с unpkg.
mkdirSync(join(outDir, 'assets', 'vendor'), { recursive: true });
for (const [from, to] of [
  ['react/umd/react.production.min.js', 'react.production.min.js'],
  ['react-dom/umd/react-dom.production.min.js', 'react-dom.production.min.js'],
]) {
  copyFileSync(join('node_modules', from), join(outDir, 'assets', 'vendor', to));
}

// image-slot.js — dev-скаффолд для drag-and-drop картинок, вне своего
// runtime он read-only. В прод не идёт: 31 КБ и лишний 404-запрос за
// .image-slots.state.json на каждой загрузке. Фото отдаются обычным <img>.

// preloader.js не подключён ни на одной странице (index.html помечен
// «preloader disabled») — в сборку не кладём.

// Smooth-scroll engine (Lenis + GSAP ScrollTrigger glue) — verbatim.
copyFileSync(join(srcDir, 'scroll.js'), join(outDir, 'scroll.js'));

// Root-level assets shared by static pages.
copyFileSync(join(srcDir, 'lead-config.js'), join(outDir, 'lead-config.js'));
copyFileSync(join(srcDir, 'lead-modal.js'), join(outDir, 'lead-modal.js'));
copyFileSync(join(srcDir, 'dark.css'), join(outDir, 'dark.css'));
copyFileSync(join(srcDir, 'landing.css'), join(outDir, 'landing.css'));
copyFileSync(join(srcDir, 'tokens.css'), join(outDir, 'tokens.css'));

// Custom domain for GitHub Pages. IDN «карацапов-даниил-маркетинг.рф» in
// punycode (ASCII) form. Emitting it on every build keeps the domain bound.
writeFileSync(join(outDir, 'CNAME'), 'xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai\n', 'utf8');

// Favicon (lime paper plane) — copy verbatim.
copyFileSync(join(srcDir, 'favicon.svg'), join(outDir, 'favicon.svg'));

// SEO: robots.txt, 404-страница и сгенерированный sitemap.xml.
copyFileSync(join(srcDir, 'robots.txt'), join(outDir, 'robots.txt'));
copyFileSync(join(srcDir, '404.html'), join(outDir, '404.html'));

// sitemap.xml собирается из списка ниже, чтобы не расходиться с реальным
// набором страниц. lastmod берём из даты последнего коммита, затронувшего
// файл: это честнее даты сборки, которая менялась бы при каждом деплое.
// В CI нужен полный клон (fetch-depth: 0), иначе git log видит один коммит.
const SITEMAP = [
  { loc: '/',                          src: 'content.json',                   changefreq: 'monthly', priority: '1.0' },
  { loc: '/kontekstnaya-reklama/',     src: 'kontekstnaya-reklama/index.html', changefreq: 'monthly', priority: '0.9' },
  { loc: '/targetirovannaya-reklama/', src: 'targetirovannaya-reklama/index.html', changefreq: 'monthly', priority: '0.9' },
  { loc: '/geo-servisy/',              src: 'geo-servisy/index.html',         changefreq: 'monthly', priority: '0.9' },
  { loc: '/razrabotka-sajtov/',        src: 'razrabotka-sajtov/index.html',   changefreq: 'monthly', priority: '0.8' },
  { loc: '/keysy/',                    src: 'keysy/index.html',               changefreq: 'monthly', priority: '0.8' },
  { loc: '/contacts/',                 src: 'contacts/index.html',            changefreq: 'yearly',  priority: '0.6' },
];

function lastModified(relPath) {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', join(srcDir, relPath)],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (iso) return iso.slice(0, 10);
  } catch (e) {}
  return new Date().toISOString().slice(0, 10);
}

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + SITEMAP.map((u) =>
      `  <url><loc>${SITE}${u.loc}</loc><lastmod>${lastModified(u.src)}</lastmod>`
      + `<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
    ).join('\n')
  + '\n</urlset>\n';
writeFileSync(join(outDir, 'sitemap.xml'), sitemap, 'utf8');

// Editable content: ship content.json (fetched at runtime / edited via /admin)
// and regenerate content-default.js (baked fallback loaded before the app).
const contentJson = readFileSync(join(srcDir, 'content.json'), 'utf8');
writeFileSync(join(outDir, 'content.json'), contentJson, 'utf8');
writeFileSync(join(outDir, 'content-default.js'),
  '/* AUTO-GENERATED from content.json — fallback loaded before the app. */\nwindow.CONTENT = '
  + contentJson + ';\n', 'utf8');
// admin.html намеренно НЕ публикуется: авторизация в нём чисто клиентская,
// а записи на сервер нет — редактировать content.json безопаснее локально.

// SEO-тексты главной живут в content.json — один источник правды для сайта
// и админки. Раньше title дублировался здесь и расходился с content.json.
const CONTENT = JSON.parse(contentJson);
const SEO = CONTENT.seo || {};
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------
// Пререндер главной.
//
// Раньше index.html отдавал пустой <div id="root">: весь контент появлялся
// только после загрузки React с unpkg. Яндекс рендерит JS хуже Google, а при
// недоступности CDN страница оставалась белой. Теперь разметка собирается
// здесь через react-dom/server и попадает в HTML, а браузер её гидратирует.
//
// Компоненты обращаются к браузерным API только внутри useEffect (на сервере
// эффекты не выполняются), поэтому хватает минимальных заглушек для
// вычисления модулей на верхнем уровне.
async function prerender() {
  const React = (await import('react')).default;
  const { renderToString } = await import('react-dom/server');

  const noop = () => {};
  const stubEl = { style: {}, classList: { add: noop, remove: noop, toggle: noop }, focus: noop };
  const win = {
    CONTENT,
    React,
    ReactDOM: { createPortal: (children) => children },
    location: { pathname: '/', href: SITE + '/', search: '' },
    navigator: { userAgent: 'prerender' },
    innerWidth: 1440, innerHeight: 900, devicePixelRatio: 1,
    addEventListener: noop, removeEventListener: noop, dispatchEvent: noop,
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
    requestAnimationFrame: noop, cancelAnimationFrame: noop,
    setTimeout: noop, clearTimeout: noop, setInterval: noop, clearInterval: noop,
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    parent: { postMessage: noop },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
  };
  win.window = win;
  win.self = win;
  win.globalThis = win;

  const doc = {
    documentElement: { ...stubEl, style: { setProperty: noop } },
    body: { ...stubEl, appendChild: noop, insertAdjacentHTML: noop },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({ ...stubEl, appendChild: noop, setAttribute: noop }),
    addEventListener: noop, removeEventListener: noop,
    readyState: 'complete',
  };
  win.document = doc;

  // Классовые <script> делят одну глобальную область — воспроизводим её,
  // выполняя собранные файлы по очереди в общем контексте.
  const ctx = createContext(win);
  for (const f of JSX_FILES) {
    const js = readFileSync(join(outDir, f.replace(/\.jsx$/, '.js')), 'utf8');
    runInContext(js, ctx, { filename: f });
  }

  if (typeof win.applyContent === 'function') win.applyContent();
  if (typeof win.App !== 'function') throw new Error('prerender: window.App не определён');
  return renderToString(React.createElement(win.App));
}

let prerendered = '';
try {
  prerendered = await prerender();
  console.log('Prerendered index.html:', (prerendered.length / 1024).toFixed(1), 'KB разметки');
} catch (e) {
  // Пустой #root — прежнее поведение: страница отрисуется на клиенте.
  // Сборку не валим, но и молчать нельзя.
  console.error('WARNING: пререндер не удался, index.html останется пустым:', e.message);
}

const scriptTags = [
  '  <script defer src="lead-config.js"></script>',
  '  <script defer src="content-default.js"></script>',
  '  <script defer src="icons.js"></script>',
  '  <script defer src="shared.js"></script>',
  '  <script defer src="extras.js"></script>',
  '  <script defer src="nav-hero-about.js"></script>',
  '  <script defer src="services-process-cases.js"></script>',
  '  <script defer src="audit-contacts-quiz.js"></script>',
  '  <script defer src="app.js"></script>',
  // Smooth-scroll стек (CDN) + наш движок. defer сохраняет порядок выполнения,
  // поэтому Lenis/GSAP гарантированно готовы к моменту запуска scroll.js.
  '  <script defer src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script>',
  '  <script defer src="https://unpkg.com/gsap@3.12.5/dist/gsap.min.js"></script>',
  '  <script defer src="https://unpkg.com/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>',
  '  <script defer src="scroll.js"></script>',
].join('\n');


const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(SEO.title)}</title>
  <meta name="description" content="${esc(SEO.description)}" />
  <link rel="canonical" href="${SITE}/" />
  <meta property="og:title" content="${esc(SEO.ogTitle || SEO.title)}" />
  <meta property="og:description" content="${esc(SEO.ogDescription || SEO.description)}" />
  <meta property="og:url" content="${SITE}/" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ru_RU" />
  <meta property="og:image" content="${SITE}/assets/og-cover.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(SEO.ogTitle || SEO.title)}" />
  <meta name="twitter:description" content="${esc(SEO.ogDescription || SEO.description)}" />
  <meta name="twitter:image" content="${SITE}/assets/og-cover.jpg" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="tokens.css" />
  <link rel="stylesheet" href="landing.css" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="preload" as="image" href="assets/portrait.jpg" fetchpriority="high" />

  <script defer src="${REACT}"></script>
  <script defer src="${REACTDOM}"></script>

  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': SITE + '/#person',
        name: 'Даниил Карацапов',
        jobTitle: 'Интернет-маркетолог',
        description: 'Частный интернет-маркетолог: контекстная реклама, таргет, GEO-продвижение и разработка сайтов',
        url: SITE + '/',
        image: SITE + '/assets/portrait.jpg',
        telephone: '+7-996-347-00-65',
        email: 'd.karatsapov@gmail.com',
        knowsLanguage: 'ru',
        sameAs: ['https://t.me/Daniil_065'],
        knowsAbout: ['Яндекс Директ', 'VK Ads', 'Telegram Ads', 'Яндекс Метрика',
          'Яндекс Бизнес', '2ГИС', 'Контекстная реклама', 'Таргетированная реклама',
          'Локальное продвижение', 'Разработка сайтов'],
      },
      {
        '@type': 'ProfessionalService',
        '@id': SITE + '/#business',
        name: 'Даниил Карацапов — маркетолог',
        description: 'Контекстная реклама в Яндекс Директ, таргетированная реклама VK Ads, продвижение в гео-сервисах',
        url: SITE + '/',
        image: SITE + '/assets/og-cover.jpg',
        founder: { '@id': SITE + '/#person' },
        areaServed: { '@type': 'Country', name: 'Россия' },
        availableLanguage: 'Russian',
        priceRange: 'от 25 000 ₽',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: '+7-996-347-00-65',
          email: 'd.karatsapov@gmail.com',
          availableLanguage: 'Russian',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Услуги',
          itemListElement: (CONTENT.services || []).map((s) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.name, description: s.result, url: SITE + (s.url || '/') },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': SITE + '/#website',
        url: SITE + '/',
        name: SEO.title,
        inLanguage: 'ru-RU',
        publisher: { '@id': SITE + '/#person' },
      },
    ],
  }, null, 2).split('\n').join('\n  ')}
  </script>

  <!-- Yandex.Metrika counter -->
  <script type="text/javascript">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109681858', 'ym');

    ym(109681858, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
  </script>
  <noscript><div><img src="https://mc.yandex.ru/watch/109681858" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
  <!-- /Yandex.Metrika counter -->
</head>
<body>
  <!-- preloader disabled -->
  <div id="root">${prerendered}</div>

  <template id="__bundler_thumbnail">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#0d0d0f" />
      <circle cx="50" cy="50" r="20" fill="#0071e3" />
      <text x="50" y="58" font-family="Nunito, sans-serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">Д</text>
    </svg>
  </template>

${scriptTags}
</body>
</html>
`;
writeFileSync(join(outDir, 'index.html'), html, 'utf8');

// Static subpages — copy each folder's index.html verbatim so the deploy is
// complete (CI builds dist from scratch; without this the subpages vanish).
const SUBPAGES = ['keysy', 'kontekstnaya-reklama', 'targetirovannaya-reklama',
  'geo-servisy', 'razrabotka-sajtov', 'contacts', 'privacy'];
for (const p of SUBPAGES) {
  const srcPage = join(srcDir, p, 'index.html');
  if (existsSync(srcPage)) {
    mkdirSync(join(outDir, p), { recursive: true });
    copyFileSync(srcPage, join(outDir, p, 'index.html'));
    console.log('Copied subpage', p + '/index.html');
  }
}

// Assets (images, fonts, etc.) — copy the whole tree.
const assetsSrc = join(srcDir, 'assets');
if (existsSync(assetsSrc)) {
  cpSync(assetsSrc, join(outDir, 'assets'), { recursive: true });
  console.log('Copied assets/');
}

// Strip source files that must never ship to production. `npm run build` does
// `cp -r project dist` first, so admin.html lands here unless we remove it.
const STRIP = /\.(jsx|mjs)$/;
const STRIP_NAMES = new Set(['admin.html', 'image-slot.js', 'preloader.js', 'tweaks-panel.js']);
for (const f of readdirSync(outDir)) {
  if (STRIP.test(f) || STRIP_NAMES.has(f)) { try { rmSync(join(outDir, f)); } catch (e) {} }
}

const totalRaw = results.reduce((a, r) => a + r.raw, 0);
const totalMin = results.reduce((a, r) => a + r.min, 0);
console.log('Compiled', results.length, 'files:',
  (totalRaw / 1024).toFixed(1), 'KB JSX →', (totalMin / 1024).toFixed(1), 'KB JS');
results.forEach(r => console.log('  ', r.jsName, (r.min / 1024).toFixed(1) + 'KB'));
console.log('Wrote', join(outDir, 'index.html'));
