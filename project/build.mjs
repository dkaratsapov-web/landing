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

// Custom domain for GitHub Pages. IDN «карацапов-даниил-маркетинг.рф» in
// punycode (ASCII) form. Emitting it on every build keeps the domain bound.
writeFileSync(join(outDir, 'CNAME'), 'xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai\n', 'utf8');

// Favicon (lime paper plane) — copy verbatim.
copyFileSync(join(srcDir, 'favicon.svg'), join(outDir, 'favicon.svg'));

// Editable content: ship content.json (fetched at runtime / edited via /admin)
// and regenerate content-default.js (baked fallback loaded before the app).
const contentJson = readFileSync(join(srcDir, 'content.json'), 'utf8');
writeFileSync(join(outDir, 'content.json'), contentJson, 'utf8');
writeFileSync(join(outDir, 'content-default.js'),
  '/* AUTO-GENERATED from content.json — fallback loaded before the app. */\nwindow.CONTENT = '
  + contentJson + ';\n', 'utf8');
copyFileSync(join(srcDir, 'admin.html'), join(outDir, 'admin.html'));

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
  <title>Даниил Карацапов — интернет-маркетолог | Контекст, таргет, сайты</title>
  <meta name="description" content="Частный интернет-маркетолог Даниил Карацапов. Контекстная реклама, таргет, разработка сайтов. Работаю лично, отвечаю за результат." />
  <meta property="og:title" content="Даниил Карацапов — интернет-маркетолог" />
  <meta property="og:description" content="Маркетинг, который делаю я сам — от стратегии до заявок." />
  <meta property="og:type" content="website" />

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
<!-- PRELOADER START -->
<div id="preloader" style="position:fixed;inset:0;z-index:99999;background:#0a0a0a;overflow:hidden;pointer-events:all;">
  <svg id="preloader-plane" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 50" width="60" height="60" style="position:fixed;left:0;top:0;transform-origin:center center;will-change:transform,opacity;">
    <path d="M5 5L13.1505 42L27.1012 29.4506L12.6396 13.0136L34.6486 25.502L46 20.4601L5 5Z" fill="#D6FF41"/>
    <path d="M35 29.0967L30.2839 45V29.6413L24.6612 23L35 29.0967ZM23 39.4725L27.4277 45V35.3329L23 39.4725Z" fill="#D6FF41"/>
  </svg>
</div>
<style>#preloader { transition: opacity 0.45s ease; }</style>
<script>
(function(){
  var overlay=document.getElementById('preloader');
  var plane=document.getElementById('preloader-plane');
  if(!overlay||!plane) return;
  document.body.style.overflow='hidden';
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W=innerWidth,H=innerHeight;
  window.addEventListener('resize',function(){W=innerWidth;H=innerHeight;});
  var SIZE=60, OFFSET=9.5;            // SVG nose points ~ -9.5deg, compensate
  var T_LOOP=3200, T_ZOOM=950, T_FADE=450;
  function easeIO(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function loopPos(t){
    var e=easeIO(t);
    var dx=(0.95-0.45*e)*W;           // drift from bottom-right edge to centre
    var dy=(1.10-0.62*e)*H;
    var amp=0.22*H*Math.sin(Math.PI*t);  // loop radius swells then shrinks
    var ang=2*Math.PI*2*t-Math.PI/2;     // two smooth loops
    return {x:dx+amp*Math.cos(ang)*1.1, y:dy+amp*Math.sin(ang)};
  }
  function setT(x,y,deg,sc){
    plane.style.transform='translate('+(x-SIZE/2)+'px,'+(y-SIZE/2)+'px) rotate('+deg+'deg) scale('+sc+')';
  }
  function finish(){
    overlay.style.opacity='0';
    overlay.style.pointerEvents='none';
    document.body.style.overflow='';
    setTimeout(function(){overlay.parentNode&&overlay.parentNode.removeChild(overlay);},T_FADE);
  }
  if(reduce){ finish(); return; }
  var lastHeading=0,t0=null;
  function frame(ts){
    if(t0===null)t0=ts;
    var el=ts-t0;
    if(el<=T_LOOP){
      var t=el/T_LOOP;
      var p=loopPos(t), p2=loopPos(Math.min(1,t+0.004));
      var heading=Math.atan2(p2.y-p.y,p2.x-p.x)*180/Math.PI; // nose follows velocity
      lastHeading=heading;
      var sc=1+0.08*Math.sin(2*Math.PI*2*t);
      setT(p.x,p.y,heading+OFFSET,sc);
      requestAnimationFrame(frame);
    } else if(el<=T_LOOP+T_ZOOM){
      var z=(el-T_LOOP)/T_ZOOM, ez=z*z;  // accelerate toward viewer
      var end=loopPos(1);
      var cx=end.x+(W/2-end.x)*z;
      var cy=end.y+(H/2-end.y)*z;
      setT(cx,cy,lastHeading+OFFSET,1+27*ez); // keep course, no flip
      if(z>0.7)overlay.style.opacity=String(1-(z-0.7)/0.3);
      requestAnimationFrame(frame);
    } else { finish(); }
  }
  var s=loopPos(0); setT(s.x,s.y,OFFSET,1); // place before first paint
  requestAnimationFrame(frame);
})();
</script>
<!-- PRELOADER END -->
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
