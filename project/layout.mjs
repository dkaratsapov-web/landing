/* layout.mjs — общая оболочка статических страниц: <head>, навигация, футер,
   инлайновые скрипты.

   Зачем: до сих пор каждая страница была самостоятельным HTML-файлом с
   собственной копией навигации и футера. На шести страницах это ещё терпимо,
   но с блогом копий станет несколько десятков, и любая правка меню
   превращается в ручной обход всех файлов — где-нибудь обязательно забудется.

   Существующие шесть страниц намеренно не трогаем: они работают, а
   переразметка ради единообразия — это риск без выгоды. Оболочка нужна новым
   страницам (/about/, /ceny/, блог), поэтому разметка здесь скопирована с
   действующих страниц один в один: визуально новые страницы неотличимы от
   старых, отличается только способ сборки.
*/
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const SITE = 'https://xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai';

/* Коды подтверждения прав в панелях вебмастеров. Лежат в seo.config.json,
   потому что их выдают в личном кабинете и меняют они руками, а не кодом.
   Пустое значение — тег просто не выводится: пустой meta хуже отсутствующего,
   Яндекс на нём отдаёт ошибку проверки. */
export const seoConfig = (() => {
  const p = join(HERE, 'seo.config.json');
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (err) {
    throw new Error(`layout: seo.config.json не разбирается — ${err.message}`);
  }
})();

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* ── Метрика ─────────────────────────────────────────────────────────────── */
const METRIKA_ID = 109681858;
const metrika = `<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}', 'ym');
    ym(${METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/${METRIKA_ID}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->`;

/* ── Навигация ───────────────────────────────────────────────────────────── */
const PLANE = '<svg class="brand-plane" width="30" height="30" viewBox="0 0 50 50" fill="none" aria-hidden="true"><path d="M5 5L13.1505 42L27.1012 29.4506L12.6396 13.0136L34.6486 25.502L46 20.4601L5 5Z" fill="#D6FF41"/><path d="M35 29.0967L30.2839 45V29.6413L24.6612 23L35 29.0967ZM23 39.4725L27.4277 45V35.3329L23 39.4725Z" fill="#D6FF41"/></svg>';

const TG_URL = 'https://t.me/Daniil_065';
const MAX_URL = 'https://max.ru/u/f9LHodD0cOKhyIzKq01tP4W7NPCgguZmr-6XQ2vXMOaCb3gg1L1a1m4PP0c';

/* Пункты выпадающего списка «Услуги». Один источник для десктопа и мобильного
   меню — иначе они разъезжаются. */
const SERVICES = [
  ['/kontekstnaya-reklama/', 'Контекстная реклама'],
  ['/razrabotka-sajtov/', 'Разработка сайтов'],
  ['/targetirovannaya-reklama/', 'Таргетированная реклама'],
  ['/geo-servisy/', 'GEO-сервисы'],
  ['/ceny/', 'Цены'],
];

function nav() {
  const drops = SERVICES
    .map(([href, label]) => `          <a href="${href}" class="nav-drop-link">${label}</a>`)
    .join('\n');
  const mobileDrops = SERVICES
    .map(([href, label]) => `  <a href="${href}" style="padding-left:18px; font-size:16px; color:var(--lime-bright);">${label}</a>`)
    .join('\n');

  return `<nav class="nav" id="siteNav">
  <div class="wrap">
    <a class="brand" href="/">
      ${PLANE}
      Даниил Карацапов
    </a>
    <div class="nav-links">
      <div class="nav-item-drop">
        <a href="/kontekstnaya-reklama/" class="nav-drop-trigger">Услуги<svg class="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <div class="nav-dropdown">
${drops}
        </div>
      </div>
      <a href="/about/">О себе</a>
      <a href="/blog/">Блог</a>
      <a href="/keysy/">Кейсы</a>
      <a href="/contacts/">Контакты</a>
    </div>
    <div class="nav-actions">
      <a class="nav-ic nav-ic-tg" href="${TG_URL}" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.94 4.6 18.6 20.3c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.09-.56-.62-.2L5.8 13.06l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6L20.5 2.55c.9-.33 1.7.22 1.44 2.05Z"/></svg>
      </a>
      <a class="nav-ic nav-ic-max" href="${MAX_URL}" target="_blank" rel="noopener noreferrer" aria-label="MAX">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12.4 3.5C16.9 3.5 20.5 6.9 20.5 11C20.5 15.1 16.9 18.5 12.4 18.5C11.3 18.5 10.2 18.3 9.3 17.9L5.6 19.8C5.2 20 4.8 19.6 4.9 19.2L5.7 15.9C4.8 14.6 4.3 12.9 4.3 11C4.3 6.9 7.9 3.5 12.4 3.5ZM13 7.5A3.1 3.1 0 1 0 13 13.7A3.1 3.1 0 1 0 13 7.5Z"/></svg>
      </a>
      <a class="btn btn-lime btn-sm nav-cta" href="/contacts/">Обсудить задачу</a>
      <button class="nav-burger" id="navBurger" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>
<div class="nav-mobile" id="navMobile">
  <a href="/kontekstnaya-reklama/">Услуги</a>
${mobileDrops}
  <a href="/about/">О себе</a>
  <a href="/blog/">Блог</a>
  <a href="/keysy/">Кейсы</a>
  <a href="/contacts/">Контакты</a>
</div>`;
}

/* ── Футер ───────────────────────────────────────────────────────────────── */
const FOOT_LINK = 'color: var(--muted); text-decoration: none; font-size: 15px;';

function footer() {
  const cols = [
    ['Навигация', [
      ['/', 'Главная'],
      ['/kontekstnaya-reklama/', 'Контекстная реклама'],
      ['/razrabotka-sajtov/', 'Разработка сайтов'],
      ['/keysy/', 'Кейсы'],
      ['/about/', 'О себе'],
      ['/blog/', 'Блог'],
      ['/ceny/', 'Цены'],
      ['/contacts/', 'Контакты'],
    ]],
  ];
  const navCol = cols.map(([head, links]) => `      <div>
        <div style="color: var(--muted-2); font-size: 13px; margin-bottom: 16px;">${head}</div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
${links.map(([h, l]) => `          <a href="${h}" style="${FOOT_LINK}">${l}</a>`).join('\n')}
        </div>
      </div>`).join('\n');

  return `<footer class="footer">
  <div class="wrap" style="padding-top:64px; padding-bottom:40px;">
    <div class="footer-grid" style="display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 40px; padding-bottom: 40px; border-bottom: 1px solid var(--line);">
      <div>
        <a class="brand" href="/" style="font-size: 20px;">${PLANE}Даниил Карацапов</a>
        <p style="color: var(--muted); margin: 18px 0 0; font-size: 15px; line-height: 1.55; max-width: 300px;">Частный интернет-маркетолог. Контекст, таргет, сайты и аналитика — лично, от аудита до заявок.</p>
      </div>
${navCol}
      <div>
        <div style="color: var(--muted-2); font-size: 13px; margin-bottom: 16px;">Связь</div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="tel:+79963470065" style="${FOOT_LINK}">+7 (996) 347-00-65</a>
          <a href="${TG_URL}" target="_blank" rel="noopener noreferrer" style="${FOOT_LINK}">Telegram @Daniil_065</a>
          <a href="mailto:d.karatsapov@gmail.com" style="color: var(--lime); text-decoration: none; font-size: 15px;">d.karatsapov@gmail.com</a>
        </div>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding-top: 28px;">
      <span style="color: var(--muted-2); font-size: 13px; line-height: 1.5;">© 2026 Даниил Карацапов. Интернет-маркетинг.</span>
      <a href="#" style="color: var(--muted-2); font-size: 13px; text-decoration: none;">Политика конфиденциальности</a>
    </div>
  </div>
</footer>`;
}

/* ── Инлайновые скрипты (меню, reveal, FAQ, дропдаун) ────────────────────── */
const PAGE_SCRIPTS = `<script>
(function () {
  const nav = document.getElementById('siteNav');
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');
  const onScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  if (burger && mobile) {
    const toggle = (open) => {
      const o = open ?? !mobile.classList.contains('open');
      mobile.classList.toggle('open', o);
      burger.classList.toggle('open', o);
    };
    burger.addEventListener('click', () => toggle());
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  }
})();

// reveal on scroll
(function () {
  const targets = document.querySelectorAll('.reveal');
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.06 }) : null;
  if (io) targets.forEach(t => io.observe(t)); else targets.forEach(t => t.classList.add('in'));
  setTimeout(() => targets.forEach(t => t.classList.add('in')), 1500);
})();

// FAQ accordion
(function () {
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
})();

// nav dropdown
(function () {
  document.querySelectorAll('.nav-item-drop').forEach(drop => {
    const trigger = drop.querySelector('.nav-drop-trigger');
    if (!trigger) return;
    drop.addEventListener('mouseenter', () => drop.classList.add('open'));
    drop.addEventListener('mouseleave', () => drop.classList.remove('open'));
    trigger.addEventListener('click', e => { e.preventDefault(); drop.classList.toggle('open'); });
  });
})();
</script>
<script defer src="/lead-modal.js"></script>`;

/* ── Хлебные крошки ──────────────────────────────────────────────────────── */
/* trail — [[url, название], ...] без «Главной»: её добавляем сами.
   Возвращает и разметку, и schema-объект: видимые крошки и микроразметка
   обязаны совпадать, иначе это расхождение для поисковика. */
export function breadcrumbs(trail) {
  const full = [['/', 'Главная'], ...trail];
  const visible = `<nav class="crumbs" aria-label="Хлебные крошки">`
    + full.map(([href, name], i) => (i === full.length - 1
      ? `<span aria-current="page">${esc(name)}</span>`
      : `<a href="${href}">${esc(name)}</a>`
    )).join('<span style="margin:0 8px; opacity:.5;">/</span>')
    + `</nav>`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: full.map(([href, name], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: SITE + href,
    })),
  };
  return { visible, schema };
}

/* ── Страница целиком ────────────────────────────────────────────────────── */
/* Обязательное: title, description, path (со слэшами по краям), body.
   schema — массив объектов JSON-LD. ogImage — путь от корня сайта. */
export function renderPage({
  title, description, path, body,
  ogImage = '/assets/og-cover.jpg', ogType = 'website',
  schema = [], extraHead = '', bodyClass = '',
}) {
  if (!path.startsWith('/') || !path.endsWith('/')) {
    throw new Error(`layout: path должен быть вида "/about/", получено "${path}"`);
  }
  const canonical = SITE + path;
  const ogAbs = SITE + ogImage;

  /* Подтверждение прав в вебмастерах. Проверяется по главной, но лишним на
     внутренних не будет: если главную когда-нибудь переверстают, права не
     слетят. */
  const verify = [
    seoConfig.yandexVerification
      && `<meta name="yandex-verification" content="${esc(seoConfig.yandexVerification)}" />`,
    seoConfig.googleVerification
      && `<meta name="google-site-verification" content="${esc(seoConfig.googleVerification)}" />`,
    seoConfig.mailruVerification
      && `<meta name="mailru-verification" content="${esc(seoConfig.mailruVerification)}" />`,
  ].filter(Boolean).join('\n');

  const ld = schema
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>document.documentElement.className+=" js"</script><!-- .js включает reveal-анимации. Без JS (робот, упавший скрипт) контент виден сразу, а не прозрачным. -->
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${verify}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="ru_RU">
<meta property="og:image" content="${ogAbs}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogAbs}">
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/dark.css">
<link rel="stylesheet" href="/pages.css">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate" type="application/rss+xml" title="Блог Даниила Карацапова" href="/rss.xml">
<script defer src="/lead-config.js"></script>
${metrika}
${ld}
${extraHead}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>

<div class="bg-fx">
  <div class="glow g1"></div>
  <div class="glow g2"></div>
  <div class="grid"></div>
</div>

<div class="page">

${nav()}

${body}

${footer()}

</div>

${PAGE_SCRIPTS}
</body>
</html>
`;
}
