/* build.mjs — pre-compile the no-build JSX prototype into a fast production
   bundle for GitHub Pages. Transpiles each .jsx with Babel (preset-react),
   minifies with Terser (toplevel:false — the files share one global lexical
   scope across classic <script> tags, so top-level names must be preserved),
   and emits an optimized index.html that uses production React and NO Babel
   runtime. Run with the deps installed in /tmp:
     NODE_PATH=/tmp/node_modules node project/build.mjs <srcDir> <outDir>
*/
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import babel from '@babel/core';
import { minify } from 'terser';

const srcDir = process.argv[2] || '.';
const outDir = process.argv[3] || './dist';

// Order matters: later files reference top-level const/function from earlier ones.
const JSX_FILES = [
  'tweaks-panel.jsx', 'icons.jsx', 'shared.jsx', 'extras.jsx',
  'nav-hero-about.jsx', 'services-process-cases.jsx',
  'audit-contacts-quiz.jsx', 'app.jsx',
];
const REACT = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
const REACTDOM = 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js';

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

// image-slot.js is already plain JS — copy verbatim.
copyFileSync(join(srcDir, 'image-slot.js'), join(outDir, 'image-slot.js'));

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

// SEO: robots.txt and sitemap.xml.
copyFileSync(join(srcDir, 'robots.txt'), join(outDir, 'robots.txt'));
copyFileSync(join(srcDir, 'sitemap.xml'), join(outDir, 'sitemap.xml'));

// Editable content: ship content.json (fetched at runtime / edited via /admin)
// and regenerate content-default.js (baked fallback loaded before the app).
const contentJson = readFileSync(join(srcDir, 'content.json'), 'utf8');
writeFileSync(join(outDir, 'content.json'), contentJson, 'utf8');
writeFileSync(join(outDir, 'content-default.js'),
  '/* AUTO-GENERATED from content.json — fallback loaded before the app. */\nwindow.CONTENT = '
  + contentJson + ';\n', 'utf8');
copyFileSync(join(srcDir, 'admin.html'), join(outDir, 'admin.html'));

// Static sub-pages (plain HTML, not processed) — copy verbatim so their
// edits always reach dist. build.mjs does not transform these.
const STATIC_PAGES = ['kontekstnaya-reklama', 'targetirovannaya-reklama',
  'geo-servisy', 'keysy', 'razrabotka-sajtov', 'contacts'];
for (const page of STATIC_PAGES) {
  const src = join(srcDir, page, 'index.html');
  if (existsSync(src)) {
    mkdirSync(join(outDir, page), { recursive: true });
    copyFileSync(src, join(outDir, page, 'index.html'));
  }
}

// Static assets (images, icons) — mirror the whole assets/ tree to dist.
import { cpSync } from 'node:fs';
const assetsSrc = join(srcDir, 'assets');
if (existsSync(assetsSrc)) cpSync(assetsSrc, join(outDir, 'assets'), { recursive: true });

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
].join('\n');

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Даниил Карацапов — маркетолог | Контекстная реклама, таргет, GEO-продвижение</title>
  <meta name="description" content="Маркетолог с 9+ лет опыта. Контекстная реклама в Яндекс Директ, таргет VK Ads, продвижение в Яндекс Картах. Работаю лично — без посредников. Заявки с первой недели." />
  <link rel="canonical" href="https://xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai/" />
  <meta property="og:title" content="Даниил Карацапов — маркетолог" />
  <meta property="og:description" content="Контекстная реклама, таргет VK Ads, GEO-продвижение. 9+ лет, 70+ ниш. Без посредников, результат с первой недели." />
  <meta property="og:url" content="https://xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai/" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ru_RU" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Даниил Карацапов — маркетолог" />
  <meta name="twitter:description" content="Контекстная реклама, таргет, GEO. 9+ лет, без посредников." />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://unpkg.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="tokens.css" />
  <link rel="stylesheet" href="landing.css" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="preload" as="image" href="assets/portrait.jpg" fetchpriority="high" />

  <script defer src="${REACT}" crossorigin="anonymous"></script>
  <script defer src="${REACTDOM}" crossorigin="anonymous"></script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Даниил Карацапов — маркетолог",
    "description": "Контекстная реклама в Яндекс Директ, таргетированная реклама VK Ads, продвижение в гео-сервисах",
    "url": "https://xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai/",
    "founder": {"@type": "Person", "name": "Даниил Карацапов"},
    "areaServed": "RU",
    "availableLanguage": "Russian",
    "contactPoint": {"@type": "ContactPoint", "contactType": "customer service", "availableLanguage": "Russian"}
  }
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
  <div id="root"></div>

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

const totalRaw = results.reduce((a, r) => a + r.raw, 0);
const totalMin = results.reduce((a, r) => a + r.min, 0);
console.log('Compiled', results.length, 'files:',
  (totalRaw / 1024).toFixed(1), 'KB JSX →', (totalMin / 1024).toFixed(1), 'KB JS');
results.forEach(r => console.log('  ', r.jsName, (r.min / 1024).toFixed(1) + 'KB'));
console.log('Wrote', join(outDir, 'index.html'));
