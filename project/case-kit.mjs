/* case-kit.mjs — общий каркас развёрнутых кейсов.

   Зачем. Страница «Сферы» получилась подробной: разворот в герое, факты
   строкой, лента блоков «что сделано» с осью-нумератором, список работ,
   стек, FAQ. Второй такой кейс должен выглядеть так же, иначе портфолио
   рассыпается на разностилицу. Общая вёрстка и стили живут здесь, а в файле
   кейса остаётся только его содержание и то, что уникально именно для него
   (у «Сферы» — схема архитектуры и схема интентов).

   Экспортирует:
     CASE_CSS       — стили каркаса, вставляются в extraHead страницы
     facts(list)    — четыре цифры под заголовком
     workBlocks(bs) — лента блоков «что сделано» с осью
     worksList(l)   — нумерованный перечень работ
     stackRow(l)    — чипы стека
     caseSchema(..) — Article + FAQPage, одинаковые у всех кейсов
*/

export const CASE_CSS = `
.hero h1 { font-size: clamp(28px, 4.1vw, 52px); }

/* Четыре факта под заголовком идут строкой. Базовый .dev-stats — это узкая
   колонка на две позиции рядом с орбитой на /about/; здесь под ним вся ширина. */
.hero .dev-stats { max-width: 820px; }
@media (min-width: 760px) { .hero .dev-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

/* ── Герой: текст и первый экран сайта рядом ─────────────────────────────── */
.case-hero { display: grid; gap: 40px; align-items: center; }
@media (min-width: 1080px) {
  .case-hero { grid-template-columns: minmax(0, 1fr) minmax(0, 46%); gap: 52px; }
  .case-hero .lead { max-width: none; }
}
.case-hero-media { min-width: 0; }

/* Рамка браузера вокруг скриншота: без неё чужой светлый интерфейс на тёмной
   странице читается как сбой вёрстки, а не как «вот сайт клиента». */
.frame {
  border-radius: 14px; overflow: hidden; background: #111115;
  border: 1px solid var(--line-strong); box-shadow: 0 24px 80px rgba(0, 0, 0, .7);
}
.frame-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: #1a1a1e; border-bottom: 1px solid var(--line);
}
.frame-dots { display: flex; gap: 6px; flex: none; }
.frame-dots i { width: 10px; height: 10px; border-radius: 50%; display: block; }
.frame-dots i:nth-child(1) { background: #ff5f57; }
.frame-dots i:nth-child(2) { background: #febc2e; }
.frame-dots i:nth-child(3) { background: #28c840; }
.frame-url {
  flex: 1; min-width: 0; padding: 5px 12px; border-radius: 6px;
  background: rgba(255, 255, 255, .06); font-size: 12px; color: var(--txt-3);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.frame img { display: block; width: 100%; height: auto; }
.frame-btn { position: relative; display: block; width: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
.frame-cap { margin: 12px 2px 0; font-size: 13px; color: var(--txt-3); line-height: 1.5; }

/* ── Шесть блоков «что сделано»: разворот с осью ─────────────────────────── */
.wk-flow { display: grid; gap: 96px; margin-top: 44px; }
@media (min-width: 1000px) { .wk-flow { gap: 128px; } }

.wk { position: relative; display: grid; gap: 28px; }
@media (min-width: 1000px) {
  .wk { grid-template-columns: minmax(0, 38%) minmax(0, 1fr); gap: 56px; padding-left: 34px; }
  /* Ось слева: тонкий трек на всю высоту блока и лаймовая заливка, которая
     набегает по мере прокрутки. Шесть отдельных столбиков превращаются
     в одну непрерывную линию рассказа. */
  .wk::before {
    content: ''; position: absolute; left: 0; top: 6px; bottom: -128px;
    width: 1px; background: var(--line);
  }
  .wk:last-child::before { bottom: 6px; }
  .wk::after {
    content: ''; position: absolute; left: 0; top: 6px; bottom: -128px;
    width: 1px; background: var(--accent); transform-origin: top;
    transform: scaleY(0);
  }
  .wk:last-child::after { bottom: 6px; }
}
@supports (animation-timeline: view()) {
  @media (min-width: 1000px) {
    .js .wk::after {
      animation: wk-rail linear both;
      animation-timeline: view();
      animation-range: cover 12% cover 78%;
    }
  }
}
@keyframes wk-rail { to { transform: scaleY(1); } }

.wk-head { position: relative; }
@media (min-width: 1000px) { .wk-head { position: sticky; top: 116px; align-self: start; } }

/* Контурная цифра — не декоративный «пузырь», а узел на оси: она стоит ровно
   на линии и сообщает, какой это шаг из шести. */
.wk-num {
  font-size: clamp(52px, 6vw, 76px); font-weight: 800; line-height: .8;
  letter-spacing: -.04em; color: transparent;
  -webkit-text-stroke: 1px var(--line-strong);
  margin-bottom: 20px;
  transition: -webkit-text-stroke-color .6s cubic-bezier(.32, .72, 0, 1);
}
@media (min-width: 1000px) { .wk-num { margin-left: -34px; padding-left: 34px; } }
.wk:hover .wk-num { -webkit-text-stroke-color: var(--accent); }

.wk-tag {
  display: inline-block; margin-bottom: 16px; padding: 5px 12px;
  border-radius: 999px; border: 1px solid var(--accent-soft-bd);
  background: var(--accent-soft); color: var(--accent-bright);
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .2em;
}
/* Заголовок блока — не заголовок секции: 60px в колонке 38% ширины давал
   шесть строк и перевешивал содержание справа. */
.wk h2 { font-size: clamp(24px, 2.3vw, 32px); line-height: 1.14; }
.wk-lead { margin: 16px 0 0; font-size: 16px; line-height: 1.55; color: var(--txt-2); }

/* Лоток и строки: внешняя оболочка с волосяной рамкой, внутри — отдельные
   плашки со своим радиусом. Плоский список галочек на плоском фоне читался
   как черновик. */
.wk-tray {
  padding: 6px; border-radius: 26px;
  background: rgba(255, 255, 255, .022);
  border: 1px solid var(--line);
}
.wk-items { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.wk-item {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 18px 20px; border-radius: 20px;
  background: rgba(255, 255, 255, .012);
  font-size: 15px; line-height: 1.55; color: var(--txt-2);
  transition: background .5s cubic-bezier(.32, .72, 0, 1),
              box-shadow .5s cubic-bezier(.32, .72, 0, 1),
              transform .5s cubic-bezier(.32, .72, 0, 1);
}
.wk-item:hover {
  background: rgba(255, 255, 255, .045);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .09);
  transform: translateX(3px);
}
.wk-item p { margin: 0; }
.wk-item strong { color: var(--txt); font-weight: 700; }

.wk-check {
  flex: none; display: grid; place-items: center;
  width: 22px; height: 22px; margin-top: 1px; border-radius: 50%;
  border: 1px solid var(--accent-soft-bd); background: var(--accent-soft);
  color: var(--accent-bright);
  transition: background .5s cubic-bezier(.32, .72, 0, 1), color .5s cubic-bezier(.32, .72, 0, 1);
}
.wk-check svg { width: 11px; height: 9px; }
.wk-item:hover .wk-check { background: var(--accent); color: var(--accent-ink); }

/* Появление строк — лесенкой, с лёгким расфокусом: элементы не возникают
   разом, а «доезжают». */
.js .wk-item { opacity: 0; transform: translateY(14px); }
@supports (animation-timeline: view()) {
  .js .wk-item {
    animation: wk-in .8s var(--d, 0ms) both cubic-bezier(.32, .72, 0, 1);
    animation-timeline: view();
    animation-range: entry 6% cover 26%;
  }
}
@supports not (animation-timeline: view()) {
  .js .wk-item { opacity: 1; transform: none; }
}
@keyframes wk-in {
  from { opacity: 0; transform: translateY(14px); filter: blur(5px); }
  to   { opacity: 1; transform: none; filter: blur(0); }
}

/* ── Список работ ────────────────────────────────────────────────────────── */
.works { counter-reset: w; display: grid; gap: 0; margin-top: 26px; }
.works li {
  counter-increment: w; list-style: none; display: flex; gap: 16px; align-items: baseline;
  padding: 15px 2px; border-top: 1px solid var(--line); font-size: 16px; color: var(--txt-2);
}
.works li:last-child { border-bottom: 1px solid var(--line); }
.works li::before {
  content: counter(w, decimal-leading-zero); flex: none;
  font-variant-numeric: tabular-nums; font-size: 13px; font-weight: 700;
  color: var(--accent-bright); min-width: 26px;
}
.stack-row { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 22px; }
.stack-chip {
  border: 1px solid var(--line); border-radius: 999px; padding: 8px 15px;
  font-size: 14px; color: var(--txt-2); background: var(--surface);
}
.case-note {
  margin-top: 26px; border-left: 2px solid var(--accent); padding: 4px 0 4px 18px;
  color: var(--txt-3); font-size: 14px; line-height: 1.6;
}
`;

/* ── Куски разметки ──────────────────────────────────────────────────────── */

export function facts(list) {
  return list.map(([v, l]) => `        <div class="dev-stat">
          <div class="dev-stat-v">${v}</div>
          <div class="dev-stat-l">${l}</div>
        </div>`).join('\n');
}

const CHECK = '<svg viewBox="0 0 12 10" fill="none" aria-hidden="true">'
  + '<path d="M1 5.2 4.3 8.5 11 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* Блоки «что сделано» — одна лента, а не набор отдельных секций: шесть
   одинаковых столбиков «заголовок во всю ширину + список галочек» читаются
   как черновик и оставляют пустой правую половину экрана. Здесь разворот:
   слева номер, тег и заголовок, справа пункты в общем лотке. */
export function workBlocks(blocks) {
  return blocks.map((b, n) => {
    const num = String(n + 1).padStart(2, '0');
    const items = b.items.map((it, i) => `          <li class="wk-item" style="--d:${i * 60}ms">
            <span class="wk-check">${CHECK}</span>
            <p>${it}</p>
          </li>`).join('\n');

    return `      <article class="wk">
        <div class="wk-head">
          <div class="wk-num" aria-hidden="true">${num}</div>
          <span class="wk-tag">${b.tag}</span>
          <h2>${b.h}</h2>
          <p class="wk-lead">${b.lead}</p>
        </div>
        <div class="wk-tray">
          <ul class="wk-items">
${items}
          </ul>
        </div>
      </article>`;
  }).join('\n');
}

export function worksList(list) {
  return list.map((w) => `      <li>${w}</li>`).join('\n');
}

export function stackRow(list) {
  return list.map((s) => `      <span class="stack-chip">${s}</span>`).join('\n');
}

/* Галерея скриншотов и лайтбокс — тоже часть каркаса: у обоих объёмных
   кейсов снимки показываются одинаково. (В keys-sfera.mjs пока живёт своя
   копия этих стилей — она появилась раньше каркаса; при следующей правке
   той страницы копию убрать и подключить отсюда.) */
export const GALLERY_CSS = `/* ── Галерея скриншотов ──────────────────────────────────────────────────── */
.shots { display: grid; gap: 28px; align-items: start; margin-top: 30px; }
@media (min-width: 860px) { .shots { grid-template-columns: 1fr 1fr; gap: 32px; } }
.shot { margin: 0; }
.shot-open {
  position: relative; display: block; width: 100%; padding: 0; cursor: zoom-in;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--line-strong); border-radius: 14px; overflow: hidden;
  background: #111115; transition: border-color .2s ease, transform .2s ease;
}
.shot-open:hover { border-color: var(--accent-soft-bd); transform: translateY(-2px); }
.shot-open:focus-visible { outline: 2px solid var(--accent-bright); outline-offset: 3px; }
/* object-position: top — у скриншота смысл в верхней части экрана,
   центрированный кроп срезал бы заголовок вместе с подвалом. */
.shot-open img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }

/* Метка «увеличить». Без неё скриншот читается как картинка, а не как кнопка:
   курсор zoom-in виден только на десктопе и только при наведении. */
.shot-zoom, .frame-zoom {
  position: absolute; right: 12px; bottom: 12px; display: grid; place-items: center;
  width: 30px; height: 30px; border-radius: 50%; color: #fff;
  background: rgba(12, 12, 14, .72); border: 1px solid rgba(255, 255, 255, .22);
  backdrop-filter: blur(4px); transition: background .2s ease;
}
.shot-open:hover .shot-zoom, .frame-btn:hover .frame-zoom { background: var(--accent); color: var(--accent-ink); border-color: transparent; }
.shot figcaption { margin-top: 12px; font-size: 14px; color: var(--txt-2); line-height: 1.5; }

.shot-lb {
  position: fixed; inset: 0; z-index: 90; display: grid; place-items: center;
  padding: 4vh 5vw; background: rgba(6, 6, 8, .93); backdrop-filter: blur(6px);
}
.shot-lb[hidden] { display: none; }
.shot-lb-stage { margin: 0; max-width: 1200px; width: 100%; }
.shot-lb-stage img {
  display: block; width: 100%; height: auto; max-height: 78vh; object-fit: contain;
  border-radius: 12px; border: 1px solid var(--line-strong); background: #111115;
}
.shot-lb-stage figcaption {
  margin-top: 14px; text-align: center; font-size: 15px; color: var(--txt-2);
}
.shot-lb-close, .shot-lb-nav {
  position: absolute; display: grid; place-items: center; cursor: pointer;
  border: 1px solid var(--line-strong); background: rgba(255, 255, 255, .06);
  color: var(--txt); border-radius: 50%; line-height: 1;
}
.shot-lb-close { top: 18px; right: 18px; width: 42px; height: 42px; font-size: 26px; }
.shot-lb-nav { top: 50%; transform: translateY(-50%); width: 46px; height: 46px; font-size: 30px; }
.shot-lb-nav.prev { left: 12px; }
.shot-lb-nav.next { right: 12px; }
.shot-lb-close:hover, .shot-lb-nav:hover { background: rgba(255, 255, 255, .14); }

`;

const ZOOM = '<span class="shot-zoom" aria-hidden="true">'
  + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">'
  + '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg></span>';

/* Превью режем по 16/10: у исходников пропорции разные, и без общей высоты
   подписи разъезжаются по вертикали. Целиком снимок открывается по клику. */
export function gallery(shots, offset = 1) {
  return shots.map((s, i) => `        <figure class="shot">
          <button type="button" class="shot-open" data-shot="${i + offset}" aria-label="Открыть скриншот: ${s.cap}">
            <img src="${s.src}" width="${s.w}" height="${s.h}" alt="${s.alt}" loading="lazy" decoding="async">
            ${ZOOM}
          </button>
          <figcaption>${s.cap}</figcaption>
        </figure>`).join('\n');
}

export function heroFrame(shot, url) {
  return `<div class="case-hero-media reveal">
        <div class="frame">
          <div class="frame-bar" aria-hidden="true">
            <span class="frame-dots"><i></i><i></i><i></i></span>
            <span class="frame-url">${url}</span>
          </div>
          <button type="button" class="frame-btn" data-shot="0" aria-label="Открыть скриншот: ${shot.cap}">
            <img src="${shot.src}" width="${shot.w}" height="${shot.h}" alt="${shot.alt}" fetchpriority="high" decoding="async">
            <span class="frame-zoom" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg></span>
          </button>
        </div>
        <p class="frame-cap">${shot.cap}</p>
      </div>`;
}

/* Лайтбокс: снимок открывается на месте, а не в новой вкладке — уход на
   голый файл посреди кейса выбрасывает человека со страницы. */
export function lightboxScript(all) {
  const data = JSON.stringify(all.map((s) => ({ src: s.src, alt: s.alt, cap: s.cap })));
  return `<script>
(function () {
  var shots = ${data};
  var box, img, cap, idx = 0;
  function build() {
    box = document.createElement('div');
    box.className = 'shot-lb'; box.hidden = true;
    /* Модальному окну нужно доступное название, иначе программа чтения
       с экрана объявляет его как «диалог» без пояснения. */
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Просмотр скриншота');
    box.innerHTML = '<button type="button" class="shot-lb-close" aria-label="Закрыть">&times;</button>'
      + '<button type="button" class="shot-lb-nav prev" aria-label="Предыдущий">&#8249;</button>'
      + '<button type="button" class="shot-lb-nav next" aria-label="Следующий">&#8250;</button>'
      + '<figure class="shot-lb-stage"><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(box);
    img = box.querySelector('img'); cap = box.querySelector('figcaption');
    box.querySelector('.shot-lb-close').addEventListener('click', close);
    box.querySelector('.prev').addEventListener('click', function () { go(idx - 1); });
    box.querySelector('.next').addEventListener('click', function () { go(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
  }
  function go(n) { idx = (n + shots.length) % shots.length; img.src = shots[idx].src; img.alt = shots[idx].alt; cap.textContent = shots[idx].cap; }
  function open(n) { if (!box) build(); go(n); box.hidden = false; document.body.style.overflow = 'hidden'; box.querySelector('.shot-lb-close').focus(); }
  function close() { box.hidden = true; document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-shot]'); if (b) { e.preventDefault(); open(+b.getAttribute('data-shot')); } });
  document.addEventListener('keydown', function (e) {
    if (!box || box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(idx - 1);
    if (e.key === 'ArrowRight') go(idx + 1);
  });
}());
</script>`;
}
