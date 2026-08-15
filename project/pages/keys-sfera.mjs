/* /keysy/sfera/ — развёрнутый кейс: сайт инженерно-проектного бюро «Сфера».

   Зачем отдельная страница. На /razrabotka-sajtov/ этот проект живёт карточкой
   в ряду трёх других, и весь смысл кейса — 38 страниц, разведённых по интентам,
   — там ужат до двух списков. При этом кейс закрывает целый пласт небрендовых
   запросов: «разработка сайта для проектной организации», «корпоративный сайт
   строительной компании», «сайт под SEO с нуля». Такие запросы гуглит человек,
   который выбирает подрядчика и хочет увидеть не скриншот, а логику решений.

   Про визуал. Пять скриншотов сайта — от клиента, подписи к ним тоже его.
   Рядом со скриншотами живёт схема архитектуры: 38 плиток по группам страниц.
   Одно другое не заменяет — скриншот показывает, как сайт выглядит, схема
   показывает то, чего на скриншоте не видно и в чём весь смысл кейса: почему
   страниц тридцать восемь и как они разведены по интентам.

   Про цифры. В карточке на /razrabotka-sajtov/ висят +49% обращений и −36% CPL.
   В исходном материале клиента на этом месте стоит пустой слот («подставьте
   свои цифры по трафику и заявкам»), поэтому на этой странице их нет: кейс
   держится на том, что проверяется — количество страниц, объём текста, состав
   разметки, вес главной. Когда клиент даст динамику за период, добавляем блок
   «Динамика» сюда и приводим карточку в соответствие.
*/
import { SITE, breadcrumbs, faqItems, TG_URL } from '../layout.mjs';

export const meta = {
  path: '/razrabotka-sajtov/sfera/',
  title: 'Кейс: сайт проектного бюро «Сфера» — 38 страниц под B2B-запросы',
  description: 'Как устроен сайт инженерно-проектного бюро: 38 посадочных страниц под поисковый спрос, 113 000 знаков экспертного текста, 12 типов Schema.org, Next.js со статической генерацией, коллтрекинг и автодеплой. Кейс разработки корпоративного B2B-сайта.',
  ogImage: '/assets/og/razrabotka-sajtov.jpg',
};

/* Плитки схемы. Порядок групп повторяет логику воронки: сначала коммерческие
   кластеры, потом гео, потом информационные статьи — так же, как человек идёт
   от «что такое ГПЗУ» к «нужно разрешение в Люберцах». */
const MAP_GROUPS = [
  { key: 'dir', n: 6, label: 'Направления проектирования', hint: 'магазин, склад, производство, автосервис, админздание, отель' },
  { key: 'perm', n: 6, label: 'Получение разрешения', hint: 'те же типы объектов, но под другой интент' },
  { key: 'geo', n: 7, label: 'Гео-страницы', hint: 'Истра, Клин, Егорьевск, Колюбакино, Люберцы, Кашин, Солнечногорск' },
  { key: 'art', n: 12, label: 'Экспертные статьи', hint: 'ГПЗУ, изыскания, экспертиза, техусловия, самострой, ввод в эксплуатацию' },
  { key: 'core', n: 7, label: 'Каркас сайта', hint: 'главная, услуги, о компании, объекты, контакты, блог, лид-магнит' },
];

/* Скриншоты и подписи — от клиента. Первый идёт в герой, остальные в галерею.
   Пропорции у файлов разные, и мы их не выравниваем кропом: у скриншота
   обрезанный низ — это потерянная часть страницы, а не «аккуратная плитка». */
const HERO_SHOT = {
  src: '/assets/dev/sfera/glavnaya.webp',
  w: 1600, h: 1000,
  alt: 'Первый экран сайта проектного бюро «Сфера»: заголовок «Проектирование коммерческой недвижимости под ключ», три преимущества и форма заявки',
  cap: 'Первый экран: оффер, ключевые преимущества и форма заявки',
};

const SHOTS = [
  {
    src: '/assets/dev/sfera/tipy-obektov.webp', w: 1600, h: 1333,
    alt: 'Блок «С какими типами объектов мы работаем»: шесть карточек — магазин, склад, производство, автосервис, административное здание, отель',
    cap: 'Шесть направлений — каждое ведёт на свою посадочную страницу',
  },
  {
    src: '/assets/dev/sfera/posadochnaya-rns.webp', w: 1600, h: 1100,
    alt: 'Посадочная страница «Разрешение на строительство склада под ключ» с формой консультации и перечнем необходимых документов',
    cap: 'Отдельная страница под запрос «разрешение на строительство склада»',
  },
  {
    src: '/assets/dev/sfera/keys-obekta.webp', w: 1600, h: 1143,
    alt: 'Кейс объекта в Люберцах: назначение, площадь 751,6 м², конструктив, органы согласования и фотографии готового здания',
    cap: 'Кейсы с реальными параметрами объектов, номерами разрешений и фотографиями',
  },
  {
    src: '/assets/dev/sfera/mobilnaya-versiya.webp', w: 1600, h: 1131,
    alt: 'Три экрана мобильной версии сайта: главная, лента статей и посадочная страница по разрешению на строительство',
    cap: 'Адаптив от 320 пикселей — проверен на реальных разрешениях',
  },
];

const FACTS = [
  ['38', 'индексируемых страниц вместо одного лендинга'],
  ['113 000', 'знаков экспертного текста'],
  ['12', 'типов микроразметки Schema.org'],
  ['92 КБ', 'вес главной страницы'],
];

/* Блоки «что сделано». Каждый — отдельный H2: страница длинная, и по ней
   должны нормально бегать и человек, и парсер нейропоиска, который вытаскивает
   ответ на «как делают сайт проектной организации». */
const BLOCKS = [
  {
    tag: 'Структура',
    h: 'Структура сайта под поисковый спрос: 38 страниц вместо лендинга',
    lead: 'Вместо одностраничника — сеть посадочных страниц, разведённых по типу запроса. Каждая отвечает на свой вопрос и не конкурирует с соседней.',
    items: [
      '<strong>6 страниц по направлениям проектирования</strong> — магазин, склад, производство, автосервис, административное здание, отель. Состав документации, особенности типа объекта, цены, этапы, FAQ.',
      '<strong>6 страниц по получению разрешения</strong> — тот же набор типов, но под другой интент: комплект документов, что проверяет уполномоченный орган, из-за чего отказывают, сроки процедуры.',
      '<strong>7 гео-страниц</strong> — Истра, Клин, Егорьевск, Колюбакино, Люберцы, Кашин, Солнечногорск. На каждой реальный объект компании с фотографиями и номерами разрешений.',
      '<strong>12 экспертных статей</strong> — 113 000 знаков: ГПЗУ, инженерные изыскания, экспертиза проектной документации, технические условия, легализация самостроя, ввод в эксплуатацию.',
    ],
  },
  {
    tag: 'Техническое SEO',
    h: 'Техническое SEO: микроразметка, индексация и перелинковка',
    lead: 'База, без которой структура не работает: поисковик должен понимать, что перед ним, и узнавать об изменениях сразу.',
    items: [
      '12 типов микроразметки Schema.org: Organization, ProfessionalService, Service, Article, FAQPage, HowTo, BreadcrumbList, ItemList, CollectionPage, ContactPage, Blog, WebSite.',
      'FAQPage на 33 страницах, хлебные крошки на 37 — расширенные сниппеты в выдаче и готовые ответы для нейропоиска.',
      'Уникальные title и description на всех страницах — ноль дублей.',
      'Sitemap, robots, canonical; служебные страницы закрыты от индексации.',
      'IndexNow — мгновенное уведомление Яндекса и Bing об изменениях вместо ожидания робота.',
      'Сквозная перелинковка: с гео-страницы на тип объекта, с типа объекта на кейс в этом городе, из статей на коммерческие страницы.',
    ],
  },
  {
    tag: 'Скорость',
    h: 'Скорость загрузки и адаптивная вёрстка',
    lead: 'Статическая генерация: страницы отдаются готовым HTML, без ожидания скриптов.',
    items: [
      'Главная весит 92 КБ, все изображения в WebP.',
      'Адаптив от 320 пикселей, проверен на реальных разрешениях — от iPhone SE до 4K-мониторов.',
      'Next.js со статической генерацией — сервер не собирает страницу под каждый запрос.',
    ],
  },
  {
    tag: 'Заявки',
    h: 'Заявки и сквозная аналитика: формы, квиз, коллтрекинг',
    lead: 'В B2B с длинным циклом важно не потерять человека на любой стадии и понимать, откуда он пришёл.',
    items: [
      'Формы на каждой странице с привязкой к разделу — в заявке видно, откуда пришёл человек.',
      'Квиз-калькулятор в 3 шага для тех, кто не готов звонить.',
      'Плавающие кнопки мессенджеров: Telegram, MAX, WhatsApp.',
      'Яндекс Метрика с вебвизором и картой кликов, коллтрекинг Callibri, трекинг подписок на мессенджер-каналы.',
      'Интерактивная карта реализованных объектов на Яндекс Картах.',
    ],
  },
  {
    tag: 'Контент',
    h: 'Контент-маркетинг: лид-магнит, Дзен и VC.ru',
    lead: 'Сайт закрывает горячий спрос, контент — тех, кто ещё изучает процедуру и до заявки не дошёл.',
    items: [
      'Лид-магнит: PDF-гид по получению разрешения на строительство — чек-лист из 18 пунктов, отдаётся за подписку.',
      'Контент-планы на 15 публикаций для Дзена и 15 для VC.ru с разведением тем по датам.',
      '10 готовых статей для Дзена с обложками и инфографикой внутрь текста — каждая уникальна, не копия материалов сайта.',
      'Канал в Дзене подключён к сайту: блок на главной, ссылка в шапке, связка в микроразметке.',
    ],
  },
  {
    tag: 'Инфраструктура',
    h: 'Инфраструктура: автодеплой и правка контента без вёрстки',
    lead: 'Сайт должен жить после сдачи, а не превращаться в памятник, к которому страшно подходить.',
    items: [
      'Автодеплой: правка в репозитории → автоматическая сборка → выкладка на хостинг. Клиенту не нужно ничего загружать руками.',
      'Контент вынесен в отдельные файлы, поэтому тексты и кейсы правятся без вёрстки.',
      'Новый город или тип объекта добавляется за час по готовому шаблону.',
    ],
  },
];

const WORKS = [
  'Проектирование структуры сайта под семантику',
  'Прототипирование и дизайн всех типов страниц',
  'Вёрстка и разработка на Next.js со статической генерацией',
  'Написание текстов: 12 статей, 25 посадочных страниц',
  'Техническое SEO: разметка, метатеги, sitemap, robots, перелинковка, IndexNow',
  'Настройка аналитики: Метрика, вебвизор, цели, коллтрекинг',
  'Формы, квиз, интеграция мессенджеров, карта объектов',
  'Лид-магнит: разработка и дизайн PDF-гида',
  'Контент-планы и статьи для Дзена и VC.ru с креативами',
  'Настройка автодеплоя и сопровождение сайта',
];

const STACK = [
  'Next.js · статическая генерация',
  '12 типов Schema.org',
  'IndexNow',
  'Яндекс Метрика · вебвизор',
  'Коллтрекинг Callibri',
  'Яндекс Карты',
  'GitHub Actions · автодеплой',
  'Генерация графики скриптами',
];

const FAQ = [
  ['Сколько стоит такой сайт?',
    'Корпоративный сайт такого масштаба — от 120 000 ₽ за разработку. Итоговая сумма зависит от количества посадочных страниц и объёма текстов: 38 страниц с уникальным содержанием — это не тот же объём, что лендинг. Точную цифру называю после разбора семантики. Ориентиры по остальным услугам — на <a href="/ceny/">странице цен</a>.'],
  ['Сколько времени заняла разработка?',
    'Корпоративный сайт с такой структурой собирается за 1–2 месяца: неделя на семантику и структуру, дальше параллельно идут дизайн, вёрстка и тексты. Дольше всего пишется контент — 113 000 знаков экспертного текста в сложной нише нельзя сгенерировать за вечер, его надо сверять с нормативкой.'],
  ['Зачем 38 страниц, если можно сделать один хороший лендинг?',
    'Лендинг ловит один запрос. Человек, который ищет «разрешение на строительство склада в Люберцах», и человек, который ищет «что такое ГПЗУ», — это две разные стадии и два разных текста. На одной странице их не совместить: либо она размывается и не отвечает никому, либо отвечает одному и теряет остальных. Сеть страниц закрывает весь путь клиента, и каждая из них может попасть в топ по своему запросу.'],
  ['Почему «проектирование склада» и «разрешение на строительство склада» — разные страницы?',
    'Это разные вопросы. В первом случае человеку нужен состав документации и цена работ, во втором — комплект документов, сроки процедуры и причины отказов. Если свести их в одну страницу, она конкурирует сама с собой в выдаче. Развёл на две с перелинковкой между ними — поисковик видит два ответа на два вопроса, а не дубли под похожие ключи.'],
  ['Смогу ли я сам менять тексты после сдачи?',
    'Да. Контент вынесен в отдельные файлы, вёрстку трогать не нужно. Правка уходит в репозиторий, дальше автодеплой сам собирает и выкладывает сайт. Новый город или новый тип объекта добавляется за час по готовому шаблону.'],
  ['Делаете такие сайты в других нишах?',
    'Да, логика переносится на любую нишу с длинным циклом сделки и разветвлённым спросом: медицина, оборудование, строительство, юруслуги, B2B-производство. Меняется семантика и фактура, а принцип «страница на интент + техбаза + перелинковка» остаётся. Что входит в работу — на странице <a href="/razrabotka-sajtov/">разработки сайтов</a>.'],
];

/* Схема архитектуры. Плитки рисуем не картинкой, а разметкой: она масштабируется
   без потерь, читается на 320 пикселях и подсвечивается по группам при наведении
   на легенду — без единого килобайта растра. */
function renderMap() {
  const groups = MAP_GROUPS.map((g) => {
    const tiles = Array.from({ length: g.n }, (_, i) =>
      `<span class="sm-tile sm-${g.key}" style="--d:${i * 45}ms"></span>`).join('');
    return `      <div class="sm-group" data-g="${g.key}">
        <div class="sm-group-head"><span class="sm-dot sm-${g.key}"></span>${g.label}<span class="sm-n">${g.n}</span></div>
        <div class="sm-tiles">${tiles}</div>
        <p class="sm-hint">${g.hint}</p>
      </div>`;
  }).join('\n');

  const total = MAP_GROUPS.reduce((s, g) => s + g.n, 0);
  return `<div class="sitemap reveal" role="img" aria-label="Архитектура сайта: ${total} страниц по группам — ${MAP_GROUPS.map((g) => `${g.label} ${g.n}`).join(', ')}">
      <div class="sm-head" aria-hidden="true">
        <span class="sm-total">${total}</span>
        <span class="sm-total-l">индексируемых страниц</span>
      </div>
      <div class="sm-groups" aria-hidden="true">
${groups}
      </div>
    </div>`;
}

/* Галерея скриншотов. В сетке превью режем по 16/10: у исходников пропорции
   от 1.20 до 1.45, и без общей высоты подписи разъезжаются по вертикали на
   полтораста пикселей. Обрезка тут ничего не стоит — целиком скриншот
   открывается в лайтбоксе по клику. */
function renderGallery() {
  const zoom = '<span class="shot-zoom" aria-hidden="true">'
    + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">'
    + '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg></span>';

  const items = SHOTS.map((s, i) => `        <figure class="shot">
          <!-- +1: нулевой индекс в лайтбоксе занят скриншотом из героя -->
          <button type="button" class="shot-open" data-shot="${i + 1}" aria-label="Открыть скриншот: ${s.cap}">
            <img src="${s.src}" width="${s.w}" height="${s.h}" alt="${s.alt}" loading="lazy" decoding="async">
            ${zoom}
          </button>
          <figcaption>${s.cap}</figcaption>
        </figure>`).join('\n');

  return `<div class="shots reveal">
${items}
      </div>`;
}

/* Лайтбокс. Тот же принцип, что у сертификатов на /about/: скриншот
   открывается здесь же, а не в новой вкладке — уход на голый файл посреди
   кейса выбрасывает человека со страницы. */
function galleryScript() {
  const data = JSON.stringify([HERO_SHOT, ...SHOTS].map((s) => ({ src: s.src, alt: s.alt, cap: s.cap })));
  return `<script>
(function () {
  var shots = ${data};
  var box, img, cap, idx = 0;

  function build() {
    box = document.createElement('div');
    box.className = 'shot-lb';
    box.hidden = true;
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
    img = box.querySelector('img');
    cap = box.querySelector('figcaption');
    box.querySelector('.shot-lb-close').addEventListener('click', close);
    box.querySelector('.prev').addEventListener('click', function () { go(idx - 1); });
    box.querySelector('.next').addEventListener('click', function () { go(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
  }

  function go(n) {
    idx = (n + shots.length) % shots.length;
    img.src = shots[idx].src;
    img.alt = shots[idx].alt;
    cap.textContent = shots[idx].cap;
  }

  function open(n) {
    if (!box) build();
    go(n);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    box.querySelector('.shot-lb-close').focus();
  }

  function close() {
    box.hidden = true;
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-shot]');
    if (b) { e.preventDefault(); open(+b.getAttribute('data-shot')); }
  });

  document.addEventListener('keydown', function (e) {
    if (!box || box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(idx - 1);
    if (e.key === 'ArrowRight') go(idx + 1);
  });
}());
</script>`;
}

/* Диаграмма «два интента — две страницы». Главное решение кейса, и словами оно
   объясняется хуже, чем схемой: слева один запрос, справа другой, между ними
   связь, а не дубль. */
function renderIntents() {
  return `<div class="intents reveal" role="img" aria-label="Схема: запрос «проектирование склада» и запрос «разрешение на строительство склада» ведут на две разные страницы, которые ссылаются друг на друга">
      <div class="in-col" aria-hidden="true">
        <div class="in-q">«проектирование склада»</div>
        <div class="in-arr"></div>
        <div class="in-page">
          <div class="in-page-t">Проектирование склада</div>
          <div class="in-page-b">состав документации · цены · этапы · FAQ</div>
        </div>
      </div>
      <div class="in-link" aria-hidden="true"><span>перелинковка</span></div>
      <div class="in-col" aria-hidden="true">
        <div class="in-q">«разрешение на строительство склада»</div>
        <div class="in-arr"></div>
        <div class="in-page">
          <div class="in-page-t">Разрешение на склад</div>
          <div class="in-page-b">документы · сроки · причины отказов</div>
        </div>
      </div>
    </div>`;
}

const CSS = `<style>
/* Заголовок кейса — десять слов вместо обычных трёх-пяти. На базовом кегле он
   вставал в шесть строк на телефоне и в три на десктопе; здесь кегль ниже. */
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

/* ── Галерея скриншотов ──────────────────────────────────────────────────── */
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

/* ── Схема архитектуры сайта ─────────────────────────────────────────────── */
.sitemap {
  border: 1px solid var(--line); border-radius: var(--r-lg, 20px);
  background: var(--surface); padding: 26px 24px 22px; margin-top: 32px;
}
.sm-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 22px; }
.sm-total {
  font-size: clamp(38px, 6vw, 56px); font-weight: 800; line-height: 1;
  color: var(--accent-bright); letter-spacing: -.03em;
}
.sm-total-l { font-size: 15px; color: var(--txt-2); }
.sm-groups { display: grid; gap: 20px; }
@media (min-width: 780px) { .sm-groups { grid-template-columns: 1fr 1fr; gap: 22px 34px; } }
.sm-group-head {
  display: flex; align-items: center; gap: 9px;
  font-size: 14px; font-weight: 600; color: var(--txt); margin-bottom: 10px;
}
.sm-n {
  margin-left: auto; font-variant-numeric: tabular-nums; font-size: 13px;
  color: var(--txt-3); border: 1px solid var(--line); border-radius: 999px; padding: 1px 9px;
}
.sm-dot { width: 9px; height: 9px; border-radius: 3px; flex: none; }
.sm-tiles { display: flex; flex-wrap: wrap; gap: 6px; }
.sm-tile {
  width: 26px; height: 34px; border-radius: 5px; flex: none;
  border: 1px solid var(--line-strong); background: var(--card);
  position: relative; overflow: hidden;
}
/* Строчки «текста» внутри плитки: страница читается как страница, а не как
   абстрактный прямоугольник. */
.sm-tile::before {
  content: ''; position: absolute; inset: 5px 5px auto 5px; height: 3px; border-radius: 2px;
  background: currentColor; opacity: .55;
}
.sm-tile::after {
  content: ''; position: absolute; inset: auto 5px 6px 5px; height: 12px; border-radius: 2px;
  background: repeating-linear-gradient(currentColor 0 2px, transparent 2px 5px);
  opacity: .22;
}
.sm-dir  { color: var(--accent-bright); border-color: var(--accent-soft-bd); background: var(--accent-soft); }
.sm-perm { color: var(--accent); border-color: var(--accent-soft-bd); }
.sm-geo  { color: var(--txt-2); }
.sm-art  { color: var(--txt-3); }
.sm-core { color: var(--txt-3); }
span.sm-dot.sm-dir  { background: var(--accent-bright); }
span.sm-dot.sm-perm { background: var(--accent); opacity: .7; }
span.sm-dot.sm-geo  { background: var(--txt-2); }
span.sm-dot.sm-art  { background: var(--txt-3); }
span.sm-dot.sm-core { background: var(--line-strong); }
.sm-hint { font-size: 13px; color: var(--txt-3); margin: 10px 0 0; line-height: 1.5; }

/* Плитки набираются по мере прокрутки: 38 — это число, которое надо
   почувствовать, а не прочитать. */
.js .sm-tile { opacity: 0; transform: translateY(6px) scale(.94); }
@supports (animation-timeline: view()) {
  .js .sm-tile {
    animation: sm-pop .5s var(--d, 0ms) both ease-out;
    animation-timeline: view();
    animation-range: entry 10% cover 32%;
  }
}
@supports not (animation-timeline: view()) {
  .js .sm-tile { opacity: 1; transform: none; }
}
@keyframes sm-pop { to { opacity: 1; transform: none; } }
.sm-group:hover .sm-tile { border-color: currentColor; transition: border-color .2s ease; }

/* ── Два интента ─────────────────────────────────────────────────────────── */
.intents {
  display: grid; gap: 14px; align-items: center; margin-top: 28px;
}
@media (min-width: 860px) { .intents { grid-template-columns: 1fr auto 1fr; gap: 20px; } }
.in-col { display: grid; gap: 10px; justify-items: center; text-align: center; }
.in-q {
  font-size: 14px; color: var(--txt-2); background: var(--card);
  border: 1px dashed var(--line-strong); border-radius: 999px; padding: 8px 16px;
}
.in-arr { width: 1px; height: 24px; background: linear-gradient(var(--line-strong), var(--accent)); }
.in-page {
  width: 100%; border: 1px solid var(--accent-soft-bd); background: var(--accent-soft);
  border-radius: 14px; padding: 16px 18px;
}
.in-page-t { font-size: 16px; font-weight: 700; color: var(--txt); }
.in-page-b { font-size: 13px; color: var(--txt-2); margin-top: 6px; }
.in-link {
  display: grid; place-items: center; font-size: 12px; color: var(--txt-3);
  text-transform: uppercase; letter-spacing: .08em;
}
.in-link span {
  border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; background: var(--surface);
}
.in-link::before, .in-link::after {
  content: ''; display: block; width: 26px; height: 1px; background: var(--line-strong); margin: 8px 0;
}
@media (min-width: 860px) {
  .in-link::before, .in-link::after { width: 1px; height: 26px; margin: 8px auto; }
}

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

@media (prefers-reduced-motion: reduce) {
  .js .sm-tile, .js .wk-item { animation: none !important; opacity: 1; transform: none; filter: none; }
  .wk::after { animation: none !important; transform: scaleY(1); }
  .wk-item, .wk-check, .wk-num { transition: none; }
}
</style>`;

export function render() {
  /* Крошки ведут через /razrabotka-sajtov/, а не через /keysy/: там лежит
     карточка этого проекта и оттуда стоит ссылка сюда. Крошка на раздел,
     который на страницу не ссылается, — расхождение для поисковика. */
  const crumbs = breadcrumbs([['/razrabotka-sajtov/', 'Разработка сайтов'], [meta.path, 'Сайт бюро «Сфера»']]);

  const facts = FACTS.map(([v, l]) => `        <div class="dev-stat">
          <div class="dev-stat-v">${v}</div>
          <div class="dev-stat-l">${l}</div>
        </div>`).join('\n');

  /* Шесть блоков «что сделано» — одна лента, а не шесть отдельных секций.
     Раньше каждый был «заголовок во всю ширину + список галочек под ним»:
     правая половина экрана пустая, между блоками провал в две секции, и шесть
     одинаковых вертикальных столбиков не читаются как один рассказ.

     Теперь разворот: слева порядковый номер, тег и заголовок, справа пункты
     в общем лотке. Заголовок ушёл с 60px на 32px — в колонке 38% ширины
     шестидесятый кегль ставил его в шесть строк, из-за чего заголовок весил
     больше содержания. */
  const check = '<svg viewBox="0 0 12 10" fill="none" aria-hidden="true">'
    + '<path d="M1 5.2 4.3 8.5 11 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const blocks = BLOCKS.map((b, n) => {
    const num = String(n + 1).padStart(2, '0');
    const items = b.items.map((it, i) => `          <li class="wk-item" style="--d:${i * 60}ms">
            <span class="wk-check">${check}</span>
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

  const works = WORKS.map((w) => `      <li>${w}</li>`).join('\n');
  const stack = STACK.map((s) => `      <span class="stack-chip">${s}</span>`).join('\n');

  const body = `<header class="hero" data-screen-label="Кейс «Сфера»">
  <div class="wrap">
    ${crumbs.visible}
    <div class="case-hero">
      <div>
        <div class="eyebrow">Кейс · разработка сайта · B2B, строительство</div>
        <h1>Сайт проектного бюро <span class="accent">«Сфера»</span>: 38 посадочных страниц под B2B-запросы</h1>
        <p class="lead">Инженерно-проектное бюро: проектирование коммерческой недвижимости и разрешения на строительство по Москве, Московской и Тверской областям. Разработал и веду сайт — структуру под поисковый спрос, тексты, техническую SEO-базу, аналитику и контент-производство.</p>
        <div class="btn-row">
          <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Обсудить свой сайт</a>
          <a class="btn btn-ghost btn-lg" href="/razrabotka-sajtov/">Все проекты</a>
        </div>
      </div>
      <div class="case-hero-media reveal">
        <div class="frame">
          <div class="frame-bar" aria-hidden="true">
            <span class="frame-dots"><i></i><i></i><i></i></span>
            <span class="frame-url">проектирование-под-ключ.рф</span>
          </div>
          <button type="button" class="frame-btn" data-shot="0" aria-label="Открыть скриншот: ${HERO_SHOT.cap}">
            <img src="${HERO_SHOT.src}" width="${HERO_SHOT.w}" height="${HERO_SHOT.h}" alt="${HERO_SHOT.alt}" fetchpriority="high" decoding="async">
            <span class="frame-zoom" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg></span>
          </button>
        </div>
        <p class="frame-cap">${HERO_SHOT.cap}</p>
      </div>
    </div>
    <div class="dev-stats" style="margin-top:38px;">
${facts}
    </div>
  </div>
</header>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Задача</div>
    <h2 class="reveal">Сложная B2B-ниша с длинным циклом сделки</h2>
    <p class="lead reveal">Клиент принимает решение месяцами и до обращения сам изучает процедуру: читает про ГПЗУ, изыскания, экспертизу. Лид дорогой, конкуренция в выдаче плотная.</p>
    <p class="lead reveal">Задача была не «сделать красиво», а построить структуру, которая ловит спрос на всех стадиях — от «что вообще такое ГПЗУ» до «нужно разрешение на строительство склада в Люберцах». На старте у компании был один лендинг.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Как выглядит</div>
    <h2 class="reveal">Скриншоты сайта проектного бюро</h2>
    <p class="lead reveal">Четыре разворота из тридцати восьми страниц: витрина направлений, посадочная под конкретный запрос, кейс реального объекта и мобильная версия.</p>
    ${renderGallery()}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Архитектура</div>
    <h2 class="reveal">Как устроен сайт: 38 страниц по группам спроса</h2>
    <p class="lead reveal">Каждая группа закрывает свою стадию пути клиента. Страницы ссылаются друг на друга, поэтому вес не распыляется, а собирается внутри тематических кластеров.</p>
    ${renderMap()}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Ключевое решение</div>
    <h2 class="reveal">Два интента — две страницы, а не дубли под похожие ключи</h2>
    <p class="lead reveal">«Проектирование склада» и «разрешение на строительство склада» выглядят как один запрос, но это два разных вопроса и два разных текста. Свести их в одну страницу — значит заставить сайт конкурировать с самим собой.</p>
    ${renderIntents()}
  </div>
</section>

<section class="section works-section">
  <div class="wrap">
    <div class="eyebrow reveal">Что сделано</div>
    <div class="wk-flow">
${blocks}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Результат</div>
    <h2 class="reveal">Что получил клиент</h2>
    <ul class="check-list reveal" style="margin-top:22px;">
      <li>38 индексируемых страниц против одного лендинга на старте</li>
      <li>113 000 знаков экспертного контента, закрывающего весь путь клиента</li>
      <li>Полная техническая база под SEO: разметка, скорость, перелинковка, индексация</li>
      <li>Готовая система контент-маркетинга: планы, статьи, лид-магнит, внешние площадки</li>
      <li>Сайт масштабируется: новый город или тип объекта добавляется за час по готовому шаблону</li>
    </ul>
    <p class="case-note reveal">Динамику по трафику, позициям и заявкам добавлю сюда, когда наберётся показательный период: в нише с многомесячным циклом сделки цифры за первые недели говорят о сезоне, а не о работе сайта.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Объём работ</div>
    <h2 class="reveal">Что входит в разработку корпоративного сайта под ключ</h2>
    <ol class="works reveal">
${works}
    </ol>
    <h3 style="font-size:17px; font-weight:600; margin:34px 0 0; color:var(--txt);">Стек и инструменты</h3>
    <div class="stack-row reveal">
${stack}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow reveal">Вопросы</div>
    <h2 class="reveal">Частые вопросы о разработке B2B-сайтов</h2>
    <div class="faq-list reveal">
${faqItems(FAQ)}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="cta-final reveal">
      <h2>Нужен сайт, который приводит заявки, а не просто существует</h2>
      <p>Разберу вашу нишу, посмотрю спрос и структуру конкурентов, скажу, сколько страниц нужно на самом деле и что из этого окупится первым. Бесплатно.</p>
      <div class="btn-row">
        <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Оставить заявку</a>
        <a class="btn btn-ghost btn-lg" href="${TG_URL}" target="_blank" rel="noopener noreferrer">Написать в Telegram</a>
      </div>
    </div>
  </div>
</section>

${galleryScript()}`;

  const schema = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Кейс: сайт инженерно-проектного бюро «Сфера» — 38 посадочных страниц под B2B-запросы',
      description: meta.description,
      author: { '@id': SITE + '/#person' },
      publisher: { '@id': SITE + '/#person' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + meta.path },
      /* Первым — скриншот сайта: он показывает предмет кейса. OG-обложка
         второй, она нужна соцсетям, а не для иллюстрации статьи. */
      image: [SITE + HERO_SHOT.src, SITE + meta.ogImage],
      articleSection: 'Кейсы',
      inLanguage: 'ru-RU',
      about: {
        '@type': 'Service',
        name: 'Разработка корпоративных сайтов',
        url: SITE + '/razrabotka-sajtov/',
        provider: { '@id': SITE + '/#person' },
        areaServed: 'RU',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') },
      })),
    },
  ];

  return { body, schema, extraHead: CSS };
}
