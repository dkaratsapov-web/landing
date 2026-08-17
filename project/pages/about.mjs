/* /about/ — личная страница специалиста.

   Зачем отдельная страница, когда блок «Обо мне» есть на главной: главная
   ранжируется по коммерческим запросам («маркетолог Яндекс Директ»), и
   размывать её биографией нельзя. Личные запросы («частный интернет-маркетолог»,
   «маркетолог фрилансер», «Даниил Карацапов») нуждаются в своей посадочной.
   Плюс это опора E-E-A-T: страница автора, на которую ссылаются все статьи
   блога, — то место, где поисковик считывает опыт и квалификацию человека.

   Биография — со слов владельца сайта. Ничего дописанного «для красоты»:
   выдуманная деталь в биографии стоит дороже, чем пустое место на странице.
*/
import { SITE, breadcrumbs, faqItems } from '../layout.mjs';

export const meta = {
  path: '/about/',
  title: 'Даниил Карацапов — частный интернет-маркетолог | Обо мне',
  description: 'В digital с 2019 года: прошёл путь от младшего специалиста до тимлида команды контекстологов в агентствах, с 2025 года работаю на себя. Яндекс Директ, VK Ads, Telegram Ads, Промостраницы, SEO, сквозная аналитика, разработка сайтов.',
  ogImage: '/assets/og/about.jpg',
};

const STATS = [
  ['с 2019', 'в digital-маркетинге'],
  ['3', 'агентства: от джуна до тимлида'],
  ['70+', 'ниш с измеримым результатом'],
  ['с 2025', 'веду проекты самостоятельно'],
];

/* Путь. Каждый пункт — факт, а не должностная инструкция. */
const TIMELINE = [
  ['Высшее образование', 'База, с которой я пришёл в профессию: умение разбираться в незнакомой предметной области и доводить работу до измеримого результата — в маркетинге это оказалось важнее любого конкретного диплома.'],
  ['2019 — старт в digital', 'Пришёл в контекстную рекламу младшим специалистом. Начинал с того, что собирал семантику и чистил минус-слова руками, — и до сих пор считаю, что без этого этапа настоящего понимания Директа не появляется.'],
  ['Агентства: от джуна до тимлида', 'Прошёл три агентства и вырос до тимлида команды контекстологов. Вёл десятки проектов одновременно, отвечал за работу команды и за результат клиентов, разбирал чужие ошибки и учил специалистов не повторять свои. Именно там набралась насмотренность по нишам: что работает в услугах, что в товарке, что в локальном бизнесе.'],
  ['2025 — своя практика', 'Ушёл из найма и работаю на себя. Причина простая: в агентстве между клиентом и специалистом всегда стоит менеджер, и часть смысла теряется по дороге. Сейчас клиент говорит напрямую с тем, кто делает работу. К этому моменту накопленного опыта хватает, чтобы брать проекты на комплексное продвижение под ключ: не отдельную услугу, а связку «трафик — посадочная — аналитика» целиком, с одной точкой ответственности.'],
];

/* Стек. Главное — показать, что это не «настройщик Директа», а специалист,
   который закрывает всю связку от трафика до аналитики. */
const STACK = [
  ['Яндекс Директ', 'Основная платформа. Поиск, РСЯ, ретаргетинг, Мастер кампаний, товарные кампании.', '/kontekstnaya-reklama/'],
  ['VK Ads и Telegram Ads', 'Таргетированная реклама там, где аудитория живёт в соцсетях и мессенджерах.', '/targetirovannaya-reklama/'],
  ['Промостраницы Яндекса', 'Формат для сложных и дорогих продуктов, где решение вызревает не за один клик.', '/promostranicy/'],
  ['SEO-оптимизация', 'Техническая и контентная оптимизация сайта под поиск — трафик, который не заканчивается вместе с бюджетом.', '/seo-optimizaciya/'],
  ['Сквозная аналитика', 'Метрика, цели, коллтрекинг, связка рекламы с CRM. Чтобы решения принимались по деньгам, а не по кликам.', '/skvoznaya-analitika/'],
  ['Сайты и приложения', 'Пишу сам: лендинги, корпоративные сайты, приложения. Не нужно искать отдельного подрядчика и сводить его с рекламой.', '/razrabotka-sajtov/'],
];

const CERTS = [
  ['Официальный партнёр Roistat', 'Roistat · сквозная аналитика', 'roistat'],
  ['Яндекс Директ — Продвинутый', 'Яндекс · сертификат специалиста', 'direct-pro'],
  ['Яндекс Директ — Базовый', 'Яндекс · сертификат специалиста', 'direct-base'],
  ['Яндекс Метрика', 'Яндекс · сертификат специалиста', 'metrika'],
  ['Медийная реклама', 'Яндекс · сертификат специалиста', 'media'],
  ['Реклама мобильных приложений', 'Яндекс · сертификация специалиста', 'mobile'],
  ['Геоперформанс и Яндекс Бизнес', 'Яндекс · сертификация специалиста', 'yandex-geo'],
  ['Google Реклама — Поиск', 'Google Ads · поисковые кампании', 'google-search'],
  ['Google Реклама — КМС', 'Google Ads · контекстно-медийная сеть', 'google-display'],
];

const PRINCIPLES = [
  ['Проект веду лично', 'Вы общаетесь не с аккаунт-менеджером, а с человеком, который своими руками собирает семантику и правит ставки. Между вашей задачей и её решением нет передаточного звена, где теряется смысл.'],
  ['Маркетинг, а не только реклама', 'Я не продаю «настройку Директа» в вакууме. Реклама без нормальной посадочной страницы и без аналитики — это слив бюджета с красивым отчётом. Поэтому беру связку целиком: трафик, сайт, замер результата.'],
  ['Без агентской наценки', 'В агентстве вы оплачиваете офис, отдел продаж и менеджера — я знаю это изнутри, потому что сам работал по ту сторону. У меня стоимость складывается из работы. При том же бюджете в рекламу уходит больше денег.'],
  ['Рекламный кабинет — ваш', 'Кампании настраиваю в вашем аккаунте, доступы остаются у вас. Если мы расстанемся, вы уносите с собой всю историю, статистику и обученные алгоритмы, а не начинаете с нуля.'],
  ['Отчёт словами, а не выгрузкой', 'Скриншот из Метрики ничего не объясняет. Я пишу, что сделал, что это дало и что делаю дальше — так, чтобы решение было понятно без специальной подготовки.'],
  ['Говорю, когда реклама не нужна', 'Если у ниши нет спроса в поиске или экономика не сходится, честнее сказать это на консультации, чем взять деньги за настройку. Отговорил — значит сэкономил вам бюджет.'],
];

const FAQ = [
  ['Чем частный маркетолог лучше агентства?',
    'Тем, что вы получаете время специалиста, а не его подпись под работой стажёра. Я работал в трёх агентствах и дорос там до тимлида команды контекстологов, поэтому говорю по опыту: клиентский проект почти всегда ведёт джуниор, а senior подключается точечно. Минус частного специалиста назову честно: я один, поэтому не возьму проект, где нужна команда из пяти человек в режиме 24/7.'],
  ['Вы только настраиваете рекламу?',
    'Нет, и это принципиально. Кроме Яндекс Директа работаю с VK Ads, Telegram Ads, Промостраницами, занимаюсь SEO-оптимизацией, настраиваю сквозную аналитику и сам пишу сайты и приложения. Поэтому могу взять маркетинг под ключ: не «привёл трафик, дальше не моя зона», а вся связка до заявки и её учёта.'],
  ['Сколько проектов вы ведёте одновременно?',
    'Ограниченное число — столько, чтобы каждому хватало внимания. Поэтому иногда я отказываю в старте и предлагаю подождать освободившийся слот. Это неудобно, но лучше, чем взять проект и вести его формально.'],
  ['Вы работаете по договору?',
    'Да. Работаю официально, с договором и закрывающими документами. Условия, объём работ и сроки фиксируются письменно до старта.'],
  ['С каким бюджетом есть смысл приходить?',
    'Рекламный бюджет от 50 000 ₽ в месяц — ниже этой отметки данных для оптимизации накапливается слишком мало, и реклама не успевает выйти на стабильный результат. Если бюджет меньше, честнее начать с гео-сервисов: в Яндекс Картах и 2ГИС заявки дешевле.'],
  ['Что если результата не будет?',
    'Гарантировать конкретное число заявок не может никто — это зависит и от спроса, и от того, как вы обрабатываете лиды. Что я гарантирую: прозрачность и разбор причин. Если после теста видно, что канал не окупается, я говорю об этом прямо и предлагаю альтернативу, а не продолжаю осваивать бюджет.'],
  ['Как с вами начать работать?',
    'Напишите в Telegram или оставьте номер — созвонимся и разберём задачу. Консультация бесплатная: на ней я говорю, есть ли смысл в рекламе для вашей ниши, и называю вилку по бюджету и срокам.'],
];

/* Орбита платформ рядом с таймлайном. Колонка справа от «Пути» пустовала на
   всю высоту раздела, а сам раздел — про накопленный опыт: кольцо из названий
   площадок читается как «вот чем за эти годы оброс».

   Почему подписи, а не логотипы: файлов логотипов в проекте нет, а рисовать
   приблизительные копии чужих товарных знаков хуже, чем набрать названия
   фирменной гарнитурой — приблизительный логотип выглядит подделкой.
   Если появятся официальные SVG, они встают на место .orbit-chip без правки
   разметки вокруг.

   Кольцо крутится от прокрутки (animation-timeline: view), а подписи
   крутятся навстречу с той же скоростью, поэтому текст всегда горизонтален.
   Раздел декоративный: тот же список есть ниже обычной сеткой, поэтому от
   скринридера кольцо скрыто. */
const PLATFORMS = [
  'Яндекс Директ', 'VK Ads', 'Telegram Ads', 'Яндекс Метрика',
  'Яндекс Бизнес', 'Google Ads', '2ГИС', 'Roistat',
];

function renderOrbit() {
  const n = PLATFORMS.length;
  const items = PLATFORMS.map((name, i) => {
    const a = Math.round((360 / n) * i);
    return `          <div class="orbit-item" style="--a:${a}deg">
            <div class="orbit-counter"><span class="orbit-chip">${name}</span></div>
          </div>`;
  }).join('\n');

  return `<div class="orbit-col" aria-hidden="true">
        <div class="orbit">
          <div class="orbit-core"><span>Стек</span></div>
          <div class="orbit-ring">
${items}
          </div>
        </div>
      </div>`;
}

const ABOUT_CSS = `<style>
/* ── Инструменты: одна матрица вместо шести одинаковых карточек ─────────── */
.tools {
  display: grid; gap: 1px; margin-top: 34px;
  background: var(--line);              /* фон проступает в зазорах — это и есть линии */
  border: 1px solid var(--line); border-radius: 22px; overflow: clip;
}
@media (min-width: 820px) { .tools { grid-template-columns: 1fr 1fr; } }

.tool {
  position: relative; display: block; padding: 26px 28px 28px;
  background: var(--surface); color: inherit; text-decoration: none;
  transition: background .5s cubic-bezier(.32, .72, 0, 1);
}
/* Первая ячейка — основная платформа, поэтому во всю ширину и с акцентом. */
@media (min-width: 820px) {
  .tool-lead { grid-column: 1 / -1; padding: 32px 28px 34px; }
  /* Ведущая ячейка занимает всю строку, поэтому остальных остаётся нечётное
     число и последняя висела рядом с пустотой. Растягиваем и её. */
  .tool:last-child:nth-child(even) { grid-column: 1 / -1; }
}

/* Акцентная полоса слева: у ведущего инструмента она есть всегда,
   у остальных вырастает при наведении. Ширина, а не цвет — движение
   считает композитор, перерисовки нет. */
.tool::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
  background: var(--accent); transform: scaleY(0); transform-origin: top;
  transition: transform .55s cubic-bezier(.32, .72, 0, 1);
}
.tool-lead::before { transform: scaleY(1); }
.tool:hover { background: rgba(255, 255, 255, .035); }
.tool:hover::before { transform: scaleY(1); }
.tool-link:focus-visible { outline: 2px solid var(--accent-bright); outline-offset: -3px; }

.tool-n {
  display: block; margin-bottom: 12px;
  font-size: 11px; font-weight: 700; letter-spacing: .18em;
  color: var(--txt-3); font-variant-numeric: tabular-nums;
  transition: color .4s ease;
}
.tool:hover .tool-n { color: var(--accent-bright); }

.tool-name {
  display: flex; align-items: center; gap: 10px;
  font-size: 18px; font-weight: 700; color: var(--txt); line-height: 1.25;
}
.tool-lead .tool-name { font-size: clamp(21px, 2.2vw, 26px); }
.tool-arr {
  flex: none; color: var(--accent-bright); opacity: .55;
  transition: transform .5s cubic-bezier(.32, .72, 0, 1), opacity .4s ease;
}
.tool:hover .tool-arr { transform: translateX(5px); opacity: 1; }
.tool-text { margin: 10px 0 0; font-size: 15px; line-height: 1.55; color: var(--txt-2); max-width: 62ch; }

/* ── Принципы: нумерованный список вместо карточек ──────────────────────── */
.prs { list-style: none; margin: 34px 0 0; padding: 0; counter-reset: pr; }
.pr {
  display: grid; gap: 6px 26px; padding: 26px 0;
  border-top: 1px solid var(--line);
  align-items: start;
}
.pr:last-child { border-bottom: 1px solid var(--line); }
@media (min-width: 880px) { .pr { grid-template-columns: 78px minmax(0, 300px) minmax(0, 1fr); gap: 0 34px; } }

/* На широком контейнере (1800px) третья колонка упирается в предел читаемой
   строки — 62 символа, — и справа простаивала треть экрана. Снимать предел
   нельзя: строка в 90+ символов читается тяжело. Поэтому на больших ширинах
   ставим принципы по два в ряд: пустота уходит, высота блока падает вдвое,
   а мера строки остаётся прежней. */
@media (min-width: 1400px) {
  .prs { display: grid; grid-template-columns: 1fr 1fr; column-gap: 72px; }
  .pr { grid-template-columns: 66px minmax(0, 1fr); gap: 0 22px; }
  /* Верхняя линия нужна каждой строке, нижняя — только последней паре. */
  .pr:nth-last-child(-n+2) { border-bottom: 1px solid var(--line); }
  .pr:last-child { border-bottom: 1px solid var(--line); }
  .pr-body { display: block; }
  .pr-t { margin-top: 10px; }
}

.pr-n {
  font-size: clamp(30px, 3.4vw, 42px); font-weight: 800; line-height: .9;
  letter-spacing: -.04em; color: transparent;
  -webkit-text-stroke: 1px var(--line-strong);
  font-variant-numeric: tabular-nums;
  transition: -webkit-text-stroke-color .5s cubic-bezier(.32, .72, 0, 1);
}
.pr:hover .pr-n { -webkit-text-stroke-color: var(--accent); }
.pr-h { font-size: 18px; font-weight: 700; line-height: 1.3; color: var(--txt); margin: 0; }
.pr-t { margin: 0; font-size: 15px; line-height: 1.6; color: var(--txt-2); max-width: 62ch; }
@media (max-width: 879px) { .pr-t { margin-top: 8px; } }
@media (min-width: 880px) and (max-width: 1399px) { .pr-body { display: contents; } }

/* Появление строк лесенкой при прокрутке. */
.js .pr { opacity: 0; transform: translateY(12px); }
@supports (animation-timeline: view()) {
  .js .pr {
    animation: pr-in .7s var(--d, 0ms) both cubic-bezier(.32, .72, 0, 1);
    animation-timeline: view(); animation-range: entry 8% cover 30%;
  }
}
@supports not (animation-timeline: view()) { .js .pr { opacity: 1; transform: none; } }
@keyframes pr-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .js .pr { animation: none !important; opacity: 1; transform: none; }
  .tool, .tool::before, .tool-arr, .tool-n, .pr-n { transition: none; }
}
</style>`;

export function render() {
  const crumbs = breadcrumbs([['/about/', 'О себе']]);
  const orbit = renderOrbit();

  const stats = STATS.map(([v, l]) => `        <div class="dev-stat">
          <div class="dev-stat-v">${v}</div>
          <div class="dev-stat-l">${l}</div>
        </div>`).join('\n');

  const timeline = TIMELINE.map(([h, t], i) => `      <div class="tl-item">
        <div class="tl-num">${i + 1}</div>
        <div class="tl-body">
          <h3 class="tl-title">${h}</h3>
          <p class="tl-text">${t}</p>
        </div>
      </div>`).join('\n');

  /* Матрица, а не шесть плавающих карточек. Шесть одинаковых прямоугольников
     с заголовком и абзацем — самая узнаваемая заготовка: взгляду не за что
     зацепиться, все инструменты выглядят равнозначными, хотя Директ здесь
     основная платформа, а остальное — вокруг него.

     Здесь один объект с волосяными разделителями внутри: первая ячейка во всю
     ширину и с акцентной полосой, дальше сетка два в ряд. Ссылки помечены
     стрелкой, которая уезжает при наведении, — понятно, куда можно перейти,
     а куда нет. */
  const stack = STACK.map(([name, text, url], i) => {
    const n = String(i + 1).padStart(2, '0');
    const inner = `        <span class="tool-n" aria-hidden="true">${n}</span>
        <div class="tool-name">${name}${url ? '<svg class="tool-arr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' : ''}</div>
        <p class="tool-text">${text}</p>`;
    const cls = 'tool' + (i === 0 ? ' tool-lead' : '') + (url ? ' tool-link' : '');
    return url
      ? `      <a class="${cls}" href="${url}">\n${inner}\n      </a>`
      : `      <div class="${cls}">\n${inner}\n      </div>`;
  }).join('\n');

  /* Принципы — не карточки. Карточка означает «самостоятельный объект,
     который можно взять отдельно», а это связный свод правил, который читают
     подряд. Поэтому список: крупный контурный номер, заголовок и текст
     в двух колонках, волосяная линия вместо рамки. */
  const principles = PRINCIPLES.map(([h, t], i) => `      <li class="pr" style="--d:${i * 70}ms">
        <span class="pr-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <div class="pr-body">
          <h3 class="pr-h">${h}</h3>
          <p class="pr-t">${t}</p>
        </div>
      </li>`).join('\n');

  /* Список строками, без превью. Галерея сертификатов с миниатюрами и
     лайтбоксом живёт на главной — там она работает как доказательство по ходу
     чтения. Дублировать её здесь картинка в картинку значило повторять
     полстраницы; на странице специалиста уместнее сухой перечень
     квалификаций со ссылками на оригиналы. */
  /* href на PDF остаётся настоящим: без JS ссылка просто открывает оригинал,
     как раньше. Скрипт перехватывает клик и показывает разворот в лайтбоксе
     прямо на странице — уводить человека в новую вкладку с середины страницы
     значит терять его. data-* несут то, что нужно лайтбоксу. */
  const certs = CERTS.map(([title, issuer, slug], i) => `        <a class="cert-row" href="/assets/certs/${slug}.pdf" target="_blank" rel="noopener noreferrer"
           data-cert="${i}" data-cert-img="/assets/certs/${slug}.jpg" data-cert-title="${title}" data-cert-issuer="${issuer}">
          <span class="cert-row-title">${title}</span>
          <span class="cert-row-issuer">${issuer}</span>
          <span class="cert-row-open">Смотреть</span>
        </a>`).join('\n');

  const faq = faqItems(FAQ);

  const body = `<header class="hero" data-screen-label="О себе">
  <div class="wrap">
    ${crumbs.visible}
    <div class="dev-hero-grid">
      <div>
        <div class="eyebrow">Обо мне</div>
        <h1>Даниил Карацапов — <span class="accent">частный интернет-маркетолог</span></h1>
        <p class="lead">В digital с 2019 года. Прошёл три агентства — от младшего специалиста до тимлида команды контекстологов, — а с 2025 года веду проекты самостоятельно.</p>
        <p style="color:var(--txt-2); font-size:16px; line-height:1.65; max-width:620px;">Основная платформа — Яндекс Директ. Кроме неё работаю с VK Ads, Telegram Ads, Промостраницами, занимаюсь SEO-оптимизацией, настраиваю сквозную аналитику и сам пишу сайты и приложения. Поэтому предлагаю не «настройку рекламы», а маркетинг под ключ: от первого касания до заявки, которую видно в отчёте.</p>
        <div class="btn-row">
          <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Обсудить задачу</a>
          <a class="btn btn-ghost btn-lg" href="/keysy/">Смотреть кейсы</a>
        </div>
        <div class="dev-stats">
${stats}
        </div>
      </div>
      <div>
        <img src="/assets/portrait.jpg" alt="Даниил Карацапов, частный интернет-маркетолог" width="520" height="640" style="width:100%; height:auto; border-radius:18px; display:block;">
      </div>
    </div>
  </div>
</header>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Путь</div>
    <h2 class="reveal">Опыт в интернет-маркетинге с 2019 года</h2>
    <div class="path-grid">
      <div class="tl reveal">
${timeline}
      </div>
      ${orbit}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Инструменты</div>
    <h2 class="reveal">Инструменты: Яндекс Директ, VK Ads, аналитика</h2>
    <p class="lead reveal">Не «полный спектр услуг», а инструменты, которыми владею лично и за результат которых отвечаю.</p>
    <div class="tools reveal">
${stack}
    </div>
    <p style="color:var(--txt-2); font-size:15px; margin-top:22px;">Стоимость по каждому направлению — на странице <a href="/ceny/" style="color:var(--accent-bright);">цен</a>.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Как я работаю</div>
    <h2 class="reveal">Принципы работы с клиентами</h2>
    <p class="lead reveal">Это не декларация о намерениях, а то, из чего складывается разница между работой с человеком и работой с подрядчиком.</p>
    <ol class="prs reveal">
${principles}
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Подтверждённая экспертиза</div>
    <h2 class="reveal">Сертификаты Яндекса, Google и Roistat</h2>
    <p class="lead reveal">Девять официальных сертификаций Яндекса и Google и партнёрский статус Roistat. Каждая строка открывает оригинал в PDF.</p>
    <div class="cert-list reveal">
${certs}
    </div>
  </div>
</section>

<script>
/* Лайтбокс сертификатов. Разворот показывается прямо на странице: раньше
   каждая строка уводила в новую вкладку с PDF, и человек уходил с середины
   раздела, чтобы посмотреть картинку.

   Прогрессивное улучшение: href на PDF в разметке настоящий, и без JS всё
   работает как прежде. Скрипт только перехватывает клик.

   Оригинал остаётся доступен — ссылка «Открыть оригинал (PDF)» внутри
   лайтбокса ведёт на тот же файл. */
(function () {
  var rows = [].slice.call(document.querySelectorAll('.cert-row[data-cert]'));
  if (!rows.length) return;

  var lb = document.createElement('div');
  lb.className = 'cert-lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.hidden = true;
  lb.innerHTML =
    '<button type="button" class="cert-lb-close" aria-label="Закрыть">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
    '</button>' +
    '<button type="button" class="cert-lb-nav prev" aria-label="Предыдущий">' +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>' +
    '</button>' +
    '<div class="cert-lb-stage">' +
      '<img alt="">' +
      '<div class="cert-lb-bar">' +
        '<div><div class="cert-lb-title"></div><div class="cert-lb-sub"></div></div>' +
        '<a class="cert-lb-pdf" target="_blank" rel="noopener noreferrer">Открыть оригинал (PDF)</a>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="cert-lb-nav next" aria-label="Следующий">' +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>' +
    '</button>';
  document.body.appendChild(lb);

  var img = lb.querySelector('img');
  var title = lb.querySelector('.cert-lb-title');
  var sub = lb.querySelector('.cert-lb-sub');
  var pdf = lb.querySelector('.cert-lb-pdf');
  var cur = 0, lastFocused = null;

  function show(i) {
    cur = (i + rows.length) % rows.length;
    var r = rows[cur];
    img.src = r.getAttribute('data-cert-img');
    img.alt = r.getAttribute('data-cert-title') + ' — сертификат Даниила Карацапова';
    title.textContent = r.getAttribute('data-cert-title');
    sub.textContent = r.getAttribute('data-cert-issuer');
    pdf.href = r.getAttribute('href');
  }
  function open(i) {
    lastFocused = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lb.querySelector('.cert-lb-close').focus();
  }
  function close() {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) { try { lastFocused.focus(); } catch (e) {} }
  }

  rows.forEach(function (r, i) {
    r.addEventListener('click', function (e) {
      // Ctrl/Cmd+клик и средняя кнопка — пусть открывают PDF в новой вкладке.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(i);
    });
  });

  lb.querySelector('.cert-lb-close').addEventListener('click', close);
  lb.querySelector('.prev').addEventListener('click', function () { show(cur - 1); });
  lb.querySelector('.next').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
})();
</script>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Вопросы</div>
    <h2 class="reveal">Вопросы о работе с частным маркетологом</h2>
    <div class="faq-list reveal">
${faq}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="cta-final reveal">
      <h2>Заказать консультацию интернет-маркетолога</h2>
      <p>Консультация бесплатная. Скажу честно, есть ли смысл в рекламе для вашей ниши, и назову вилку по бюджету и срокам.</p>
      <div class="btn-row" style="justify-content:center;">
        <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Оставить заявку</a>
        <a class="btn btn-ghost btn-lg" href="https://t.me/Daniil_065" target="_blank" rel="noopener noreferrer">Написать в Telegram</a>
      </div>
    </div>
  </div>
</section>`;

  /* ProfilePage + Person: страница-визитка человека. mainEntity ссылается на
     тот же @id, что и Person на главной, — для поисковика это одна сущность,
     описанная в двух местах, а не два разных Даниила. */
  const schema = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url: SITE + meta.path,
      name: meta.title,
      description: meta.description,
      mainEntity: {
        '@type': 'Person',
        '@id': SITE + '/#person',
        name: 'Даниил Карацапов',
        givenName: 'Даниил',
        familyName: 'Карацапов',
        jobTitle: 'Частный интернет-маркетолог',
        description: 'Частный интернет-маркетолог. В digital с 2019 года, прошёл путь от младшего специалиста до тимлида команды контекстологов в агентствах, с 2025 года ведёт проекты самостоятельно. Яндекс Директ, VK Ads, Telegram Ads, Промостраницы, SEO, сквозная аналитика, разработка сайтов и приложений.',
        url: SITE + meta.path,
        image: SITE + '/assets/portrait.jpg',
        telephone: '+7 996 347-00-65',
        email: 'd.karatsapov@gmail.com',
        knowsLanguage: 'ru',
        knowsAbout: ['Контекстная реклама', 'Яндекс Директ', 'Таргетированная реклама',
          'VK Ads', 'Telegram Ads', 'Промостраницы Яндекса', 'SEO', 'Веб-аналитика',
          'Сквозная аналитика', 'Разработка сайтов', 'Разработка приложений'],
        hasCredential: CERTS.map(([name, issuer]) => ({
          '@type': 'EducationalOccupationalCredential',
          name,
          credentialCategory: 'certificate',
          recognizedBy: { '@type': 'Organization', name: issuer.split(' · ')[0] },
        })),
        sameAs: ['https://t.me/Daniil_065',
          'https://max.ru/u/f9LHodD0cOKhyIzKq01tP4W7NPCgguZmr-6XQ2vXMOaCb3gg1L1a1m4PP0c'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({
        '@type': 'Question', name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ];

  return { body, schema, extraHead: ABOUT_CSS };
}
