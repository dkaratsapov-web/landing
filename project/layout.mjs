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

export const SITE = 'https://karatsapov.ru';

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

/* Реквизиты оператора персональных данных. Один источник для футера и
   страницы /politika/.

   status и inn намеренно пустые: юридический статус (самозанятый или ИП) и
   ИНН владелец должен подтвердить сам — выдуманные реквизиты в правовом
   документе хуже, чем их отсутствие. Как только значения появятся здесь, они
   сами подтянутся и в футер, и в раздел «Реквизиты оператора». Все места,
   которые их выводят, проверяют поле на пустоту и молча пропускают. */
export const OPERATOR = {
  name: 'Карацапов Даниил',
  status: '',
  inn: '',
  email: 'd.karatsapov@gmail.com',
  phone: '+7 (996) 347-00-65',
  phoneTel: '+79963470065',
};

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

export const TG_URL = 'https://t.me/Daniil_065';
export const MAX_URL = 'https://max.ru/u/f9LHodD0cOKhyIzKq01tP4W7NPCgguZmr-6XQ2vXMOaCb3gg1L1a1m4PP0c';
export const DZEN_URL = 'https://dzen.ru/karatsapov';

/* Пункты выпадающего списка «Услуги». Один источник для десктопа, мобильного
   меню и статических страниц — иначе они разъезжаются.

   Услуги в меню разложены по трём смыслам: чем привлекаем, что делаем с
   сайтом, чем меряем. Плоский список из десяти пунктов приходилось читать
   целиком, чтобы понять, есть ли нужное, — а по группам видно сразу.

   «Цены» отсюда вынесены наверх, отдельным пунктом. Это не услуга, и внутри
   выпадающего списка услуг они терялись ровно там, где их ищут чаще всего.

   Порядок внутри групп — от общего к частному, а не по алфавиту: первым
   идёт то, с чего чаще начинают разговор. */
export const SERVICE_GROUPS = [
  ['Маркетинг', [
    ['/kompleksnyj-marketing/', 'Маркетинг под ключ'],
    ['/kontekstnaya-reklama/', 'Контекстная реклама'],
    ['/targetirovannaya-reklama/', 'Таргетированная реклама'],
    ['/promostranicy/', 'Промостраницы Яндекса'],
    ['/geo-servisy/', 'GEO-сервисы'],
  ]],
  ['Разработка', [
    ['/razrabotka-sajtov/', 'Разработка сайтов'],
    ['/seo-optimizaciya/', 'SEO-оптимизация'],
  ]],
  ['Аналитика', [
    ['/skvoznaya-analitika/', 'Сквозная аналитика'],
    ['/audit-reklamy/', 'Аудит рекламы'],
  ]],
];

export function nav() {
  const drops = SERVICE_GROUPS.map(([title, items]) => `          <div class="nav-drop-col">
            <div class="nav-drop-title">${title}</div>
${items.map(([href, label]) => `            <a href="${href}" class="nav-drop-link">${label}</a>`).join('\n')}
          </div>`).join('\n');
  /* В мобильном меню группы тоже подписаны, но без колонок: там всё в один
     столбец, и подпись — единственное, что отделяет одну группу от другой. */
  const mobileDrops = SERVICE_GROUPS.map(([title, items]) =>
    `  <span class="nav-mobile-group">${title}</span>\n`
    + items.map(([href, label]) =>
      `  <a href="${href}" class="nav-mobile-sub">${label}</a>`).join('\n')
  ).join('\n');

  return `<nav class="nav" id="siteNav">
  <div class="wrap">
    <a class="brand" href="/">
      ${PLANE}
      Даниил Карацапов
    </a>
    <div class="nav-links">
      <div class="nav-item-drop">
        <a href="/kompleksnyj-marketing/" class="nav-drop-trigger">Услуги<svg class="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <div class="nav-dropdown">
${drops}
        </div>
      </div>
      <a href="/ceny/">Цены</a>
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
      <a class="btn btn-ghost btn-sm nav-dzen" href="${DZEN_URL}" target="_blank" rel="noopener noreferrer">
        <svg class="i" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5c0 5.8 4.7 10.5 10.5 10.5-5.8 0-10.5 4.7-10.5 10.5 0-5.8-4.7-10.5-10.5-10.5C7.3 12 12 7.3 12 1.5Z"/></svg>Я на Дзен
      </a>
      <a class="btn btn-fill btn-sm nav-cta" href="/contacts/" data-lead-modal>Обсудить задачу</a>
      <button class="nav-burger" id="navBurger" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>
<div class="nav-mobile" id="navMobile">
  <a href="/kompleksnyj-marketing/">Услуги</a>
${mobileDrops}
  <a href="/ceny/">Цены</a>
  <a href="/about/">О себе</a>
  <a href="/blog/">Блог</a>
  <a href="/keysy/">Кейсы</a>
  <a href="/contacts/">Контакты</a>
</div>`;
}

/* Быстрая связь на телефоне: Telegram слева, звонок справа. Разметка одна на
   весь сайт — вставляется и в генерируемые страницы, и в статические, и в
   главную. Иконки инлайном, потому что ради двух глифов тянуть шрифт или
   спрайт незачем, а внешний запрос на телефоне стоит дороже разметки. */
export function mobileDock() {
  return `<div class="mob-dock">
  <a class="mob-dock-btn mob-dock-tg" href="${TG_URL}" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram">
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.94 4.6 18.6 20.3c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.09-.56-.62-.2L5.8 13.06l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6L20.5 2.55c.9-.33 1.7.22 1.44 2.05Z"/></svg>
  </a>
  <a class="mob-dock-btn mob-dock-call" href="tel:${OPERATOR.phoneTel}" aria-label="Позвонить ${OPERATOR.phone}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
  </a>
</div>`;
}

/* ── Футер ───────────────────────────────────────────────────────────────── */
const FOOT_LINK = 'color: var(--muted); text-decoration: none; font-size: 15px;';

/* Строка со статусом и ИНН. Пока владелец их не подтвердил, возвращает пустую
   строку — футер выглядит ровно как раньше. */
function legalLine() {
  const bits = [OPERATOR.status, OPERATOR.inn && `ИНН ${OPERATOR.inn}`].filter(Boolean);
  return bits.length ? ` ${bits.join(' · ')}.` : '';
}

function footer() {
  /* Колонка услуг берётся из SERVICE_GROUPS, а не переписывается руками:
     список услуг вырос до девяти пунктов, и вторая его копия разъехалась бы
     с меню на первой же новой странице. Группы здесь разворачиваются в
     плоский перечень: в подвале подписи групп были бы третьим уровнем
     заголовков подряд — «Услуги», потом «Маркетинг», потом сами ссылки, —
     и колонка стала бы выше остальных вдвое. «Цены» стоят во второй
     колонке, к остальным разделам сайта. */
  const cols = [
    ['Услуги', SERVICE_GROUPS.flatMap(([, items]) => items)],
    ['Разделы', [
      ['/', 'Главная'],
      ['/keysy/', 'Кейсы'],
      ['/about/', 'О себе'],
      ['/blog/', 'Блог'],
      ['/ceny/', 'Цены'],
      ['/contacts/', 'Контакты'],
    ]],
  ];
  /* Колонка услуг раскладывается в два столбца: девять пунктов в один
     столбец растягивали футер вдвое выше остальных колонок. */
  const navCol = cols.map(([head, links]) => `      <div>
        <div style="color: var(--muted-2); font-size: 13px; margin-bottom: 11px;">${head}</div>
        <div style="display: grid; grid-template-columns: ${links.length > 5 ? 'repeat(2, minmax(0, 1fr))' : '1fr'}; gap: 7px 24px;">
${links.map(([h, l]) => `          <a href="${h}" style="${FOOT_LINK}">${l}</a>`).join('\n')}
        </div>
      </div>`).join('\n');

  return `<footer class="footer">
  <div class="wrap" style="padding-top:38px; padding-bottom:24px;">
    <div class="footer-grid" style="display: grid; grid-template-columns: 1.1fr 1.5fr 0.8fr 0.9fr; gap: 26px 36px; padding-bottom: 26px; border-bottom: 1px solid var(--line);">
      <div>
        <a class="brand" href="/" style="font-size: 20px;">${PLANE}Даниил Карацапов</a>
        <p style="color: var(--muted); margin: 12px 0 0; font-size: 14px; line-height: 1.5; max-width: 300px;">Частный интернет-маркетолог. Контекст, таргет, сайты и аналитика — лично, от аудита до заявок.</p>
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
    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding-top: 18px;">
      <span style="color: var(--muted); font-size: 13px; line-height: 1.5;">© 2026 ${OPERATOR.name}. Интернет-маркетинг.${legalLine()}</span>
      <a href="/politika/" style="color: var(--muted); font-size: 13px; text-decoration: none;">Политика конфиденциальности</a>
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

// FAQ: раскрытие обеспечивает нативный <details>, скрипт нужен только чтобы
// открытым оставался один пункт — как на остальных страницах сайта.
(function () {
  const items = document.querySelectorAll('details.faq-item');
  items.forEach(d => d.addEventListener('toggle', () => {
    if (!d.open) return;
    items.forEach(o => { if (o !== d) o.open = false; });
  }));
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
<script defer src="/lead-modal.js"></script>
<script defer src="/motion.js"></script>`;

/* ── FAQ ─────────────────────────────────────────────────────────────────── */
/* items — [[вопрос, ответ], ...]. Возвращает только элементы списка: обёртку
   <div class="faq-list"> ставит вызывающая страница, ей же принадлежит класс
   reveal.

   Разметка на <details>/<summary> — ровно та, которую dark.css уже стилизует
   для шести исторических страниц. Раньше /about/ и /ceny/ рендерили
   собственный div-аккордеон с классами .faq-q/.faq-a, которых нет ни в одном
   подключённом стиле: все ответы стояли раскрытыми одновременно, а текст
   вылезал за границы карточки. Общий помощник закрывает и причину — две копии
   одной разметки, которые разъехались со стилями. Плюс details работает без
   JS и доступен с клавиатуры из коробки. */
export function faqItems(items) {
  return items
    .map(([q, a]) => `      <details class="faq-item"><summary>${q}<span class="sign"></span></summary><div class="answer">${a}</div></details>`)
    .join('\n');
}

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
/* ── Декор секций ────────────────────────────────────────────────────────
   Раздаётся автоматически, а не расставляется руками по страницам. Причин
   две. Страниц два с лишним десятка, и вручную их не удержать в
   согласованном виде: где-то забудешь слой, где-то поставишь два подряд
   одинаковых. И вторая: набор вариантов должен чередоваться, а это условие
   на последовательность — его удобно выразить счётчиком, а не разметкой.

   Условие безопасности то же, что на главной, и оно уже выполнено: под всей
   страницей идёт непрерывный .bg-fx, закреплённый во вьюпорте, а у секций
   своего непрозрачного фона нет. Значит стыка «фон к фону» не существует, и
   полосе между блоками взяться неоткуда.

   Простые замены по строке, без разбора HTML: разметка здесь своя, её
   формируют соседние модули этого же проекта, и структура предсказуема. */
const FX_ORDER = ['mesh', 'strings', 'weave', 'rings', 'beams', 'spark', 'aurora'];
const EDGE_ORDER = ['dashes', 'node', 'hairline', 'chevron'];

let edgeSeq = 0;
function sectionEdge(variant) {
  /* Уникальный id градиента на весь сайт. Дубли id — невалидный документ, а
     браузер вдобавок связывает stroke="url(#id)" с первым найденным узлом,
     так что второй разделитель подхватывал бы чужой градиент. */
  const gid = 'edg' + (++edgeSeq);
  const inner = variant === 'chevron'
    ? `<svg viewBox="0 0 1200 84" preserveAspectRatio="none"><defs>`
      + `<linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="0%">`
      + `<stop offset="0%" stop-color="var(--accent-bright)" stop-opacity="0"/>`
      + `<stop offset="50%" stop-color="var(--accent-bright)" stop-opacity="0.5"/>`
      + `<stop offset="100%" stop-color="var(--accent-bright)" stop-opacity="0"/>`
      + `</linearGradient></defs><path d="M0 30 L600 58 L1200 30" stroke="url(#${gid})"/></svg>`
    : '<span class="rule"></span>'
      + (variant === 'hairline' ? '<span class="glint"></span>' : '')
      + (variant === 'node' ? '<span class="node"></span>' : '');
  return `<div class="sec-edge edge-${variant}" aria-hidden="true">${inner}</div>`;
}

export function decorate(body) {
  let n = 0;
  /* Слой не в каждую секцию, а через одну. Причин две, и обе весомые.

     Ритм: страница, где фактура есть везде, читается так же ровно, как
     страница, где её нет нигде. Чередование «блок с фактурой — блок чистый»
     как раз и даёт разницу между блоками, ради которой всё затевалось.

     Цена: замер прокрутки страницы контекста, где секций дюжина, показал
     57мс со слоями против 34мс без них. Половина слоёв — половина расхода,
     а на глаз потери нет. */
  let out = body.replace(
    /(<(?:section|header)\b[^>]*\bclass="[^"]*\b(?:section|section-sm|sec|hero)\b[^"]*"[^>]*>)/g,
    (tag) => {
      const i = n++;
      if (i % 2) return tag;
      return `${tag}\n  <div class="sec-fx fx-${FX_ORDER[(i >> 1) % FX_ORDER.length]}" aria-hidden="true"></div>`;
    }
  );
  /* Разделитель — только там, где секция действительно граничит с секцией.
     Заглядывание вперёд, а не просто замена </section>: закрывающий тег
     последней секции перед подвалом разделителя не требует. */
  let e = 0;
  /* Между закрывающим и следующим открывающим тегом на статических страницах
     стоят комментарии-разделители («ЦИТАТА 1», «ПРЕИМУЩЕСТВА» и такие же).
     Первая версия требовала, чтобы секции шли встык, и на этих страницах не
     нашла ни одного стыка вовсе. */
  out = out.replace(/<\/section>(\s*(?:<!--[^]*?-->\s*)*)(?=<section\b)/g,
    (m, gap) => `</section>\n${sectionEdge(EDGE_ORDER[e++ % EDGE_ORDER.length])}${gap}`);
  return out;
}

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
    seoConfig.zenVerification
      && `<meta name="zen-verification" content="${esc(seoConfig.zenVerification)}" />`,
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
<meta name="twitter:image" content="${ogAbs}"><noscript></noscript>
<link rel="preload" href="/assets/fonts/nunito-cyrillic-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/nunito-cyrillic-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/nunito-cyrillic-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/dark.css">
<link rel="stylesheet" href="/pages.css">
<link rel="stylesheet" href="/section-fx.css">
<link rel="stylesheet" href="/nav.css">
<link rel="stylesheet" href="/motion.css">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="120x120" href="/favicon-120.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="Блог Даниила Карацапова" href="/rss.xml">
<script defer src="/section-fx.js"></script>
<script defer src="/lead-config.js"></script>
${metrika}
${ld}
${extraHead}
</head>
<body class="mo-grain${bodyClass ? ` ${bodyClass}` : ''}">

<div class="bg-fx">
  <div class="glow g1"></div>
  <div class="glow g2"></div>
  <div class="grid"></div>
</div>

<div class="page">

${nav()}

<!-- <main> обязателен: без него в дереве доступности нет области основного
     содержимого, и краулер (как и скринридер) не может отделить контент от
     шапки и подвала. Проверка агентного просмотра Яндекса помечала это как
     «дерево доступности имеет неверный формат». -->
<main id="main">

${decorate(body)}

</main>

${footer()}

</div>

${mobileDock()}

${PAGE_SCRIPTS}
</body>
</html>
`;
}
