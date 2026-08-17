/* build.mjs — pre-compile the no-build JSX prototype into a fast production
   bundle for GitHub Pages. Transpiles each .jsx with Babel (preset-react),
   minifies with Terser (toplevel:false — the files share one global lexical
   scope across classic <script> tags, so top-level names must be preserved),
   and emits an optimized index.html that uses production React and NO Babel
   runtime. Run with the deps installed in /tmp:
     NODE_PATH=/tmp/node_modules node project/build.mjs <srcDir> <outDir>
*/
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import babel from '@babel/core';
import { minify } from 'terser';
import { prerenderApp } from './prerender.mjs';
import { renderPage, seoConfig, decorate } from './layout.mjs';
import { loadPosts, renderPost, renderIndex, renderRss } from './blog.mjs';
import * as aboutPage from './pages/about.mjs';
import * as cenyPage from './pages/ceny.mjs';
import * as politikaPage from './pages/politika.mjs';
import * as keysSferaPage from './pages/keys-sfera.mjs';
import * as keysDiautoPage from './pages/keys-diauto.mjs';
import * as kompleksPage from './pages/kompleksnyj-marketing.mjs';
import * as analitikaPage from './pages/skvoznaya-analitika.mjs';
import * as auditPage from './pages/audit-reklamy.mjs';
import * as promoPage from './pages/promostranicy.mjs';
import * as seoPage from './pages/seo-optimizaciya.mjs';

const SITE = 'https://karatsapov.ru';

/* Страницы, собираемые из общего шаблона (в отличие от шести исторических,
   которые лежат готовым HTML). Каждый модуль отдаёт meta + render(). */
const GENERATED_PAGES = [aboutPage, cenyPage, politikaPage, keysSferaPage, keysDiautoPage,
  kompleksPage, analitikaPage, auditPage, promoPage, seoPage];

const srcDir = process.argv[2] || '.';
const outDir = process.argv[3] || './dist';

// Order matters: later files reference top-level const/function from earlier ones.
const JSX_FILES = [
  'tweaks-panel.jsx', 'icons.jsx', 'shared.jsx', 'extras.jsx',
  'nav-hero-about.jsx', 'services-process-cases.jsx',
  'audit-contacts-quiz.jsx', 'app.jsx',
];
const REACT = '/assets/react.min.js';
const REACTDOM = '/assets/react-dom.min.js';

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
  // out (без минификации) уходит в пререндер: в vm-контексте важнее читаемые
  // имена в стектрейсах, чем размер.
  return { jsName, raw: code.length, min: min.code.length, compiled: out };
}

const results = [];
for (const f of JSX_FILES) results.push(await compile(f));

// image-slot.js is already plain JS — copy verbatim.
copyFileSync(join(srcDir, 'image-slot.js'), join(outDir, 'image-slot.js'));

// Preloader — copy verbatim.
copyFileSync(join(srcDir, 'preloader.js'), join(outDir, 'preloader.js'));

// Smooth-scroll engine (Lenis + GSAP ScrollTrigger glue) — verbatim.

// Root-level assets shared by static pages.
copyFileSync(join(srcDir, 'lead-config.js'), join(outDir, 'lead-config.js'));
copyFileSync(join(srcDir, 'lead-modal.js'), join(outDir, 'lead-modal.js'));
copyFileSync(join(srcDir, 'dark.css'), join(outDir, 'dark.css'));
copyFileSync(join(srcDir, 'landing.css'), join(outDir, 'landing.css'));
// Общий слой движения — нужен и главной, и статическим, и генерируемым.
copyFileSync(join(srcDir, 'motion.css'), join(outDir, 'motion.css'));
copyFileSync(join(srcDir, 'motion.js'), join(outDir, 'motion.js'));
copyFileSync(join(srcDir, 'tokens.css'), join(outDir, 'tokens.css'));
// Компоненты страниц из layout.mjs (/about/, /ceny/, блог).
copyFileSync(join(srcDir, 'pages.css'), join(outDir, 'pages.css'));
/* Декор секций и разделители — общие для главной и внутренних страниц. */
copyFileSync(join(srcDir, 'section-fx.css'), join(outDir, 'section-fx.css'));
copyFileSync(join(srcDir, 'section-fx.js'), join(outDir, 'section-fx.js'));

// Домен для GitHub Pages. Пишется на каждой сборке: этим файлом Pages и
// определяет, по какому адресу отдавать сайт, и без него привязка слетает.
// До августа 2026 здесь был кириллический карацапов-даниил-маркетинг.рф
// в punycode-виде.
writeFileSync(join(outDir, 'CNAME'), 'karatsapov.ru\n', 'utf8');

/* Иконки сайта. Кроме SVG нужны растры: Яндекс.Вебмастер требует favicon
   размером 120×120 и отдельно ходит за /favicon.ico по корню, не разбирая
   <link>. Генерируются из favicon.svg скриптом gen-favicons.mjs. */
for (const f of ['favicon.svg', 'favicon.ico', 'favicon-120.png', 'apple-touch-icon.png']) {
  const src = join(srcDir, f);
  if (existsSync(src)) copyFileSync(src, join(outDir, f));
  else console.warn('build: нет иконки', f, '— запустите node project/gen-favicons.mjs');
}

// SEO: robots.txt. sitemap.xml генерируется ниже, из фактического списка страниц.
copyFileSync(join(srcDir, 'robots.txt'), join(outDir, 'robots.txt'));

// Editable content: ship content.json (fetched at runtime / edited via /admin)
// and regenerate content-default.js (baked fallback loaded before the app).
const contentJson = readFileSync(join(srcDir, 'content.json'), 'utf8');
writeFileSync(join(outDir, 'content.json'), contentJson, 'utf8');
writeFileSync(join(outDir, 'content-default.js'),
  '/* AUTO-GENERATED from content.json — fallback loaded before the app. */\nwindow.CONTENT = '
  + contentJson + ';\n', 'utf8');
copyFileSync(join(srcDir, 'admin.html'), join(outDir, 'admin.html'));

// SEO: рендерим лендинг в статический HTML, чтобы робот видел текст без JS.
// Падение здесь валит сборку намеренно — молча выложить пустую главную хуже,
// чем не выложить ничего.
const content = JSON.parse(contentJson);
const rootHtml = prerenderApp(
  results.map((r, i) => [JSX_FILES[i], r.compiled]),
  content,
);

/* Мета главной берём из content.json → блок seo. Раньше они были захардкожены
   здесь, а блок seo в content.json никто не читал: владелец правил его через
   /admin и не понимал, почему в выдаче ничего не меняется. Теперь источник
   один. Отсутствие блока валит сборку — выложить главную без title хуже, чем
   не выложить. */
if (!content.seo || !content.seo.title || !content.seo.description) {
  throw new Error('build: в content.json нет блока seo с title и description');
}
const META = {
  title: content.seo.title,
  description: content.seo.description,
  ogTitle: content.seo.ogTitle || content.seo.title,
  ogDescription: content.seo.ogDescription || content.seo.description,
};
const escAttr = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── Микроразметка услуг и сертификатов ─────────────────────────────────────
   Собирается из content.json, а не пишется руками: услуги и цены там уже
   есть, и второй список неизбежно разъехался бы с первым — ровно так уже
   случилось с ценами в мета-описаниях страниц услуг.

   minPrice, а не price: в карточках стоит «от 30 000 ₽», и точная цена в
   разметке противоречила бы тексту страницы. */
const offerCatalog = {
  '@type': 'OfferCatalog',
  name: 'Услуги интернет-маркетинга',
  itemListElement: (content.services || []).map((s, i) => {
    const digits = String(s.price || '').replace(/[^\d]/g, '');
    return {
      '@type': 'Offer',
      position: i + 1,
      itemOffered: {
        '@type': 'Service',
        name: s.name,
        description: s.result,
        ...(s.url ? { url: SITE + s.url } : {}),
        provider: { '@id': SITE + '/#person' },
        areaServed: 'RU',
        ...(s.works && s.works.length ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Что входит',
            itemListElement: s.works.map((w) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: w } })),
          },
        } : {}),
      },
      ...(digits ? {
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: Number(digits),
          priceCurrency: 'RUB',
        },
      } : {}),
    };
  }),
};

/* Сертификаты как hasCredential. Для личного бренда это прямое подтверждение
   квалификации: девять официальных сертификаций — самая сильная и при этом
   единственная полностью проверяемая точка доверия на сайте, а в разметке её
   до сих пор не было вовсе. */
const credentials = (content.certs || []).map((c) => ({
  '@type': 'EducationalOccupationalCredential',
  name: c.title,
  credentialCategory: 'certificate',
  ...(c.issuer ? { recognizedBy: { '@type': 'Organization', name: c.issuer.split('·')[0].trim() } } : {}),
  ...(c.file ? { url: SITE + '/' + c.file.replace(/^\//, '') } : {}),
}));
console.log('Prerendered #root:', (rootHtml.length / 1024).toFixed(1), 'KB of HTML');

/* Подтверждение прав в вебмастерах. Проверка идёт по главной, поэтому теги
   обязаны попасть именно сюда; на генерируемых страницах их ставит layout.mjs.
   Пустой код тега не даёт — Яндекс на пустом content отдаёт ошибку проверки. */
const verifyTags = [
  ['yandex-verification', seoConfig.yandexVerification],
  ['google-site-verification', seoConfig.googleVerification],
  ['mailru-verification', seoConfig.mailruVerification],
  /* Дзен подтверждает права на сайт, чтобы связать канал с доменом: ссылки
     из статей перестают считаться внешними и в карточке канала появляется
     сайт. Проверяется только главная. */
  ['zen-verification', seoConfig.zenVerification],
].filter(([, v]) => v)
  .map(([name, v]) => `  <meta name="${name}" content="${v}" />`)
  .join('\n');
console.log('Подтверждение прав:',
  verifyTags ? verifyTags.split('\n').length + ' мета-тег(а)' : 'коды не заданы (seo.config.json)');

const scriptTags = [
  '  <script defer src="lead-config.js"></script>',
  '  <script defer src="content-default.js"></script>',
  '  <script defer src="tweaks-panel.js"></script>',
  '  <script defer src="image-slot.js"></script>',
  '  <script defer src="icons.js"></script>',
  '  <script defer src="shared.js"></script>',
  '  <script defer src="extras.js"></script>',
  '  <script defer src="nav-hero-about.js"></script>',
  '  <script defer src="services-process-cases.js"></script>',
  '  <script defer src="audit-contacts-quiz.js"></script>',
  '  <script defer src="app.js"></script>',
  /* Lenis и GSAP убраны. Три внешних скрипта на 120 КБ обслуживали ровно один
     параллакс в герое — его теперь делает CSS через .mo-parallax, без единого
     килобайта JS. Сам Lenis при этом перехватывал прокрутку у всего сайта:
     он приезжал с CDN уже после первой отрисовки и на ходу подменял поведение
     скролла — отсюда и рывок при перезагрузке, и тяжёлые кадры на длинных
     страницах. Нативная прокрутка ровнее и ничего не стоит. */
  // Микровзаимодействия по указателю: работает всегда и сам по себе.
  '  <script defer src="motion.js"></script>',
].join('\n');

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escAttr(META.title)}</title>
  <meta name="description" content="${escAttr(META.description)}" />
  <link rel="canonical" href="https://karatsapov.ru/" />
${verifyTags}
  <meta property="og:title" content="${escAttr(META.ogTitle)}" />
  <meta property="og:description" content="${escAttr(META.ogDescription)}" />
  <meta property="og:url" content="${SITE}/" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ru_RU" />
  <meta property="og:image" content="${SITE}/assets/og/index.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Даниил Карацапов — частный интернет-маркетолог" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escAttr(META.ogTitle)}" />
  <meta name="twitter:description" content="${escAttr(META.ogDescription)}" />
  <meta name="twitter:image" content="${SITE}/assets/og/index.jpg" />

  <!-- .js включает reveal-анимации. Без JS (робот, упавший скрипт) контент
       виден сразу, а не прозрачным — иначе пререндеренный текст считался бы
       скрытым. Скрипт стоит до стилей, чтобы не мигало. -->
  <script>document.documentElement.className+=" js"</script>
  <link rel="stylesheet" href="tokens.css" />
  <link rel="stylesheet" href="landing.css" />
  <link rel="stylesheet" href="section-fx.css" />
  <script defer src="section-fx.js"></script>
  <link rel="stylesheet" href="motion.css" />
  <link rel="icon" href="favicon.ico" sizes="32x32">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="icon" type="image/png" sizes="120x120" href="favicon-120.png">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="alternate" type="application/rss+xml" title="Блог Даниила Карацапова" href="/rss.xml">
  <link rel="preload" as="image" href="assets/portrait.jpg" fetchpriority="high" />

  <script defer src="${REACT}" crossorigin="anonymous"></script>
  <script defer src="${REACTDOM}" crossorigin="anonymous"></script>

  <!-- Person + sameAs: связывает сайт, имя и внешние профили в одну сущность.
       Для личного бренда это основа E-E-A-T — поисковик должен понимать, что
       автор статей, владелец сайта и человек в профилях это один специалист.
       Новые профили (Дзен, VK) дописывать в sameAs. -->
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': SITE + '/#person',
        name: 'Даниил Карацапов',
        givenName: 'Даниил',
        familyName: 'Карацапов',
        jobTitle: 'Частный интернет-маркетолог',
        description: 'Частный интернет-маркетолог. Настройка и ведение контекстной рекламы в Яндекс Директ, таргетированной рекламы VK Ads, продвижение в Яндекс Картах и 2ГИС, разработка сайтов.',
        url: SITE + '/',
        image: SITE + '/assets/portrait.jpg',
        telephone: '+7 996 347-00-65',
        knowsAbout: ['Контекстная реклама', 'Яндекс Директ', 'Таргетированная реклама',
          'VK Ads', 'Яндекс Бизнес', 'Локальное продвижение', 'Веб-аналитика', 'Разработка сайтов'],
        knowsLanguage: 'ru',
        email: 'd.karatsapov@gmail.com',
        /* Опыт в digital начинается с 2019 года. Раньше сайт заявлял «с 2017»
           и «9+ лет», что расходилось со страницей /about/ на том же сайте. */
        hasOccupation: {
          '@type': 'Occupation',
          name: 'Интернет-маркетолог',
          occupationalCategory: 'Marketing',
        },
        hasCredential: credentials,
        sameAs: ['https://t.me/Daniil_065',
          'https://dzen.ru/karatsapov',
          'https://max.ru/u/f9LHodD0cOKhyIzKq01tP4W7NPCgguZmr-6XQ2vXMOaCb3gg1L1a1m4PP0c'],
      },
      {
        '@type': 'ProfessionalService',
        '@id': SITE + '/#business',
        name: 'Даниил Карацапов — маркетолог',
        description: 'Контекстная реклама в Яндекс Директ, таргетированная реклама VK Ads, продвижение в гео-сервисах',
        url: SITE + '/',
        image: SITE + '/assets/og/index.jpg',
        founder: { '@id': SITE + '/#person' },
        provider: { '@id': SITE + '/#person' },
        areaServed: { '@type': 'Country', name: 'Россия' },
        availableLanguage: 'Russian',
        priceRange: 'от 12 000 ₽ до 65 000 ₽ в месяц',
        telephone: '+7 996 347-00-65',
        email: 'd.karatsapov@gmail.com',
        hasOfferCatalog: offerCatalog,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: '+7 996 347-00-65',
          email: 'd.karatsapov@gmail.com',
          availableLanguage: 'Russian',
          areaServed: 'RU',
        },
      },
      {
        '@type': 'WebSite',
        '@id': SITE + '/#website',
        url: SITE + '/',
        name: 'Даниил Карацапов — маркетолог',
        inLanguage: 'ru-RU',
        publisher: { '@id': SITE + '/#person' },
      },
      /* WebPage связывает саму страницу с сущностями выше. Без неё главная
         остаётся набором несвязанных объектов: поисковик видит человека,
         услугу и сайт, но не то, что эта страница — про них. */
      {
        '@type': 'WebPage',
        '@id': SITE + '/#webpage',
        url: SITE + '/',
        name: META.title,
        description: META.description,
        inLanguage: 'ru-RU',
        isPartOf: { '@id': SITE + '/#website' },
        about: { '@id': SITE + '/#person' },
        primaryImageOfPage: SITE + '/assets/og/index.jpg',
      },
    ],
  }, null, 2)}
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
<body class="mo-grain">
  <!-- preloader disabled -->
  <div id="root">${rootHtml}</div>

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
  'geo-servisy', 'razrabotka-sajtov', 'contacts'];
for (const p of SUBPAGES) {
  const srcPage = join(srcDir, p, 'index.html');
  if (existsSync(srcPage)) {
    mkdirSync(join(outDir, p), { recursive: true });
    /* Не побайтовое копирование: этим страницам, как и генерируемым, нужен
       декор секций. Вставляем его на сборке, а не в исходниках, — иначе
       разметку пришлось бы править вручную в шести файлах и держать
       чередование вариантов в голове.

       Стили и скрипт декора подключаются здесь же, если их ещё нет: у этих
       страниц свои <head>, они не проходят через общий шаблон. */
    let page = readFileSync(srcPage, 'utf8');
    if (!page.includes('section-fx.css')) {
      page = page.replace('</head>',
        '  <link rel="stylesheet" href="/section-fx.css">\n'
        + '  <script defer src="/section-fx.js"></script>\n</head>');
    }
    writeFileSync(join(outDir, p, 'index.html'), decorate(page), 'utf8');
    console.log('Copied subpage', p + '/index.html');
  }
}

// Страницы из общего шаблона (/about/, /ceny/, …). Ошибка рендера валит
// сборку: пустая или битая страница в проде хуже несобранного деплоя.
for (const page of GENERATED_PAGES) {
  const { meta, render } = page;
  /* extraHead — необязательный: страницы со своей вёрсткой (кейсы) отдают
     собственный <style> вместо того, чтобы копить одноразовые классы в
     общем pages.css. */
  const { body, schema, extraHead = '' } = render();
  const html = renderPage({ ...meta, body, schema, extraHead });
  const dir = join(outDir, meta.path.replace(/^\/|\/$/g, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
  console.log('Generated page', meta.path, (html.length / 1024).toFixed(1) + 'KB');
}

// ── Блог ────────────────────────────────────────────────────────────────────
// Статьи (Markdown) → страницы + лента + RSS. Ошибка в фронтматтере валит
// сборку: статья без даты или заголовка сломала бы и ленту, и микроразметку.
const posts = loadPosts(srcDir);
for (const post of posts) {
  const dir = join(outDir, 'blog', post.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), renderPost(post, posts), 'utf8');
}
mkdirSync(join(outDir, 'blog'), { recursive: true });
writeFileSync(join(outDir, 'blog', 'index.html'), renderIndex(posts), 'utf8');
writeFileSync(join(outDir, 'rss.xml'), renderRss(posts), 'utf8');
// Исходные .md остаются рядом (их приносит `cp -r project dist` из npm-скрипта);
// их убирает общая зачистка исходников ниже.
console.log('Блог:', posts.length, 'статей + лента + RSS');

// Файлы подтверждения прав (yandex_*.html, google*.html) — в корень как есть.
// README из папки не публикуем: он инструкция для нас, а не часть сайта.
const verifyDir = join(srcDir, 'verification');
if (existsSync(verifyDir)) {
  const files = readdirSync(verifyDir).filter((f) => f !== 'README.md');
  for (const f of files) copyFileSync(join(verifyDir, f), join(outDir, f));
  console.log('Файлы подтверждения:', files.length ? files.join(', ') : 'нет');
}

// Assets (images, fonts, etc.) — copy the whole tree.
const assetsSrc = join(srcDir, 'assets');
if (existsSync(assetsSrc)) {
  cpSync(assetsSrc, join(outDir, 'assets'), { recursive: true });
  console.log('Copied assets/');
}

// 404-страница — статична, просто копируем.
if (existsSync(join(srcDir, '404.html'))) {
  copyFileSync(join(srcDir, '404.html'), join(outDir, '404.html'));
  console.log('Copied 404.html');
}

// ── Машиночитаемые файлы для ИИ-систем ──────────────────────────────────────
// llms.txt и pricing.md. Их читают ChatGPT, Perplexity и Claude, когда
// собирают ответ о специалисте или сравнивают подрядчиков: обычную страницу
// нужно рендерить и разбирать, а эти файлы разбираются как есть.
//
// Генерируются из content.json и списка статей, а не пишутся руками —
// третий по счёту список услуг с ценами разъехался бы с первыми двумя так же,
// как это уже случилось с ценами в мета-описаниях страниц услуг.
//
// Для Google это ничего не даёт: он прямо пишет, что для AI Overviews не
// нужны ни особая разметка, ни отдельные файлы. Но и не вредит.
{
  const svc = content.services || [];
  const priceLines = svc.map((s) => {
    const works = (s.works || []).map((w) => `  - ${w}`).join('\n');
    return `## ${s.name}\n`
      + `- Стоимость: ${s.price}\n`
      + `- Срок запуска: ${s.term}\n`
      + `- Площадки: ${s.tag}\n`
      + (works ? `- Что входит:\n${works}\n` : '');
  }).join('\n');

  writeFileSync(join(outDir, 'pricing.md'),
`# Цены — Даниил Карацапов, частный интернет-маркетолог

Все суммы — оплата работы специалиста. Рекламный бюджет оплачивается
отдельно и напрямую площадке: агентской наценки в нём нет.

Минимальный рекламный бюджет для контекстной рекламы — от 50 000 ₽ в месяц.
Ниже этой суммы алгоритмы Яндекс Директа не набирают данных для обучения.

Валюта: RUB. Регион работы: Россия, онлайн.
Подробная страница: ${SITE}/ceny/

${priceLines}
## Условия

- Работа по договору с закрывающими документами.
- Ведение оплачивается помесячно, настройка — до старта работ.
- Стоимость настройки не публикуется: зависит от объёма и называется после
  разбора ниши.
- Консультация и первичный разбор задачи — бесплатно.

Контакты: ${SITE}/contacts/ · Telegram @Daniil_065 · +7 996 347-00-65
`, 'utf8');

  const svcList = svc.filter((s) => s.url)
    .map((s) => `- [${s.name}](${SITE}${s.url}): ${s.result}`).join('\n');
  const postList = posts.slice(0, 13)
    .map((p) => `- [${p.title}](${SITE}${p.path}): ${p.description}`).join('\n');

  writeFileSync(join(outDir, 'llms.txt'),
`# Даниил Карацапов — частный интернет-маркетолог

> Частный специалист по интернет-маркетингу из России. Настраивает и ведёт
> контекстную рекламу в Яндекс Директе, таргетированную рекламу в VK Ads и
> Telegram Ads, продвижение в Яндекс Картах и 2ГИС, разрабатывает сайты и
> настраивает сквозную аналитику. Работает лично, без агентства и
> субподрядчиков.

В digital-маркетинге с 2019 года: прошёл три агентства от младшего
специалиста до тимлида команды контекстологов, с 2025 года ведёт проекты
самостоятельно. Девять официальных сертификаций Яндекса и Google,
партнёрский статус Roistat. 22 опубликованных кейса с измеримыми
результатами, ROI по ним 264–520%.

Ведение контекстной рекламы — от 30 000 ₽ в месяц, таргетированной — от
20 000 ₽, лендинг — от 60 000 ₽. Полный прайс: ${SITE}/pricing.md

## Услуги
${svcList}

## Ключевые страницы
- [Цены на все услуги](${SITE}/ceny/): прайс одной таблицей и ответы о том, из чего складывается стоимость
- [Кейсы](${SITE}/keysy/): 22 проекта с цифрами по заявкам, ROI и стоимости лида
- [Об авторе](${SITE}/about/): опыт, принципы работы, сертификаты
- [Контакты](${SITE}/contacts/): телефон, Telegram, форма связи

## Статьи блога
${postList}

## Контакты
- Telegram: https://t.me/Daniil_065
- Дзен: https://dzen.ru/karatsapov
- Телефон: +7 996 347-00-65
- Почта: d.karatsapov@gmail.com
`, 'utf8');
  console.log('Машиночитаемые файлы: llms.txt, pricing.md');
}

// ── sitemap.xml ─────────────────────────────────────────────────────────────
// Собираем из фактического списка страниц, а не из руками поддерживаемого
// файла: с блогом ручная карта разъедется на первой же забытой правке.
// lastmod берём из даты последнего коммита исходника — требует полной истории
// (в CI: actions/checkout с fetch-depth: 0). Если истории нет, дату опускаем:
// отсутствующий lastmod лучше, чем сегодняшняя дата на всех URL разом.
function gitLastMod(file) {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', file],
      { cwd: srcDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return iso ? iso.slice(0, 10) : null;
  } catch (e) {
    return null;
  }
}

const SITEMAP_PAGES = [
  { loc: '/', src: 'content.json', priority: '1.0', changefreq: 'monthly' },
  { loc: '/kontekstnaya-reklama/', src: 'kontekstnaya-reklama/index.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/targetirovannaya-reklama/', src: 'targetirovannaya-reklama/index.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/geo-servisy/', src: 'geo-servisy/index.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/razrabotka-sajtov/', src: 'razrabotka-sajtov/index.html', priority: '0.8', changefreq: 'monthly' },
  { loc: '/kompleksnyj-marketing/', src: 'pages/kompleksnyj-marketing.mjs', priority: '0.9', changefreq: 'monthly' },
  { loc: '/skvoznaya-analitika/', src: 'pages/skvoznaya-analitika.mjs', priority: '0.8', changefreq: 'monthly' },
  { loc: '/audit-reklamy/', src: 'pages/audit-reklamy.mjs', priority: '0.8', changefreq: 'monthly' },
  { loc: '/promostranicy/', src: 'pages/promostranicy.mjs', priority: '0.7', changefreq: 'monthly' },
  { loc: '/seo-optimizaciya/', src: 'pages/seo-optimizaciya.mjs', priority: '0.8', changefreq: 'monthly' },
  { loc: '/keysy/', src: 'keysy/index.html', priority: '0.8', changefreq: 'monthly' },
  { loc: '/razrabotka-sajtov/sfera/', src: 'pages/keys-sfera.mjs', priority: '0.7', changefreq: 'monthly' },
  { loc: '/keysy/diauto69/', src: 'pages/keys-diauto.mjs', priority: '0.7', changefreq: 'monthly' },
  { loc: '/about/', src: 'pages/about.mjs', priority: '0.8', changefreq: 'monthly' },
  { loc: '/ceny/', src: 'pages/ceny.mjs', priority: '0.8', changefreq: 'monthly' },
  { loc: '/contacts/', src: 'contacts/index.html', priority: '0.6', changefreq: 'yearly' },
  /* Политика в карте сайта нужна: на неё ведут ссылки из каждой формы, и
     поисковик всё равно её найдёт. Явное низкое priority показывает, что это
     служебный документ, а не посадочная. */
  { loc: '/politika/', src: 'pages/politika.mjs', priority: '0.2', changefreq: 'yearly' },
];

/* Статьи в карту сайта. lastmod у статьи берём из фронтматтера (updated или
   date), а не из даты коммита: правка опечатки не должна выглядеть для
   поисковика обновлением материала. Лента блога — по коммиту, как остальные. */
const SITEMAP_ALL = [
  ...SITEMAP_PAGES,
  { loc: '/blog/', src: 'blog.mjs', priority: '0.7', changefreq: 'weekly' },
  ...posts.map((p) => ({
    loc: p.path, src: p.file, priority: '0.7', changefreq: 'yearly',
    lastmod: p.updated || p.date,
  })),
];

const urls = SITEMAP_ALL.map(({ loc, src, priority, changefreq, lastmod: fixed }) => {
  const lastmod = fixed || gitLastMod(src);
  return '  <url>'
    + `<loc>${SITE}${loc}</loc>`
    + (lastmod ? `<lastmod>${lastmod}</lastmod>` : '')
    + `<changefreq>${changefreq}</changefreq>`
    + `<priority>${priority}</priority>`
    + '</url>';
}).join('\n');

writeFileSync(join(outDir, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls + '\n</urlset>\n', 'utf8');
console.log('Generated sitemap.xml:', SITEMAP_ALL.length, 'URL',
  urls.includes('<lastmod>') ? '(с lastmod)' : '(без lastmod — нет истории git)');

// Strip source files that must never ship to production.
//
// Обход рекурсивный, и это принципиально: `npm run build` начинается с
// `cp -r project dist`, поэтому в dist попадает всё дерево исходников —
// включая вложенные pages/*.mjs, seo.config.json и служебные README. Плоская
// зачистка по корню их не видела, и они уезжали на боевой сайт.
const STRIP_FILE = /\.(jsx|mjs|md)$/;
const STRIP_EXACT = new Set(['seo.config.json']);
/* pricing.md — не исходник, а часть сайта: машиночитаемый прайс для ИИ-систем.
   Под маску .md он попадает случайно, поэтому выносим в исключения явно.
   Без этого файл молча исчезал из сборки, а llms.txt ссылался в пустоту. */
const KEEP_EXACT = new Set(['pricing.md']);

function stripSources(dir) {
  let removed = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      removed += stripSources(full);
      // Каталог, опустевший после зачистки (project/pages, project/verification),
      // в сборке не нужен — иначе на сайте останется пустая директория.
      try {
        if (readdirSync(full).length === 0) rmSync(full, { recursive: true });
      } catch (e) { /* уже удалён или занят — не критично */ }
      continue;
    }
    if (KEEP_EXACT.has(entry.name)) continue;
    if (STRIP_FILE.test(entry.name) || STRIP_EXACT.has(entry.name)) {
      try { rmSync(full); removed++; } catch (e) { /* уже удалён */ }
    }
  }
  return removed;
}
console.log('Вычищено исходников из сборки:', stripSources(outDir));

const totalRaw = results.reduce((a, r) => a + r.raw, 0);
const totalMin = results.reduce((a, r) => a + r.min, 0);
console.log('Compiled', results.length, 'files:',
  (totalRaw / 1024).toFixed(1), 'KB JSX →', (totalMin / 1024).toFixed(1), 'KB JS');
results.forEach(r => console.log('  ', r.jsName, (r.min / 1024).toFixed(1) + 'KB'));
console.log('Wrote', join(outDir, 'index.html'));
