/* /skvoznaya-analitika/ — сквозная аналитика.

   Зачем страница. Услуга есть в прайсе (от 12 000 ₽/мес) и в стеке —
   владелец официальный партнёр Roistat, — но ссылка на неё со всех
   страниц вела на контекстную рекламу. По запросам «сквозная аналитика»,
   «настройка сквозной аналитики», «коллтрекинг», «Roistat настройка» сайт
   не показывал ничего.

   Центральный блок — «путь заявки»: та же цепочка показ → клик → заявка →
   продажа, но с явной подписью, где обрывается видимость у каждого
   инструмента. Именно этот разрыв и продаёт услугу: человек видит, что
   Метрика показывает клики, а деньги живут в CRM, и между ними пусто.
*/
import { SITE, breadcrumbs, faqItems } from '../layout.mjs';
import { SVC_CSS, hero, mockReport, related, cases, CASE_SETS } from '../service-kit.mjs';

export const meta = {
  path: '/skvoznaya-analitika/',
  title: 'Сквозная аналитика — настройка и ведение, Roistat и коллтрекинг | Даниил Карацапов',
  description: 'Настраиваю сквозную аналитику: связка рекламы, сайта, звонков и CRM. Видно, какая кампания принесла деньги, а не клики. Официальный партнёр Roistat. Сопровождение от 12 000 ₽ в месяц.',
  ogImage: '/assets/og/uslugi.jpg',
};

/* Путь заявки. gap — то, что теряется на этом шаге без сквозной аналитики.
   Формулировки намеренно конкретные: «непонятно, окупается ли» — это не
   боль, а вода. Боль — «в отчёте 40 заявок, в CRM 12». */
const PATH = [
  {
    n: '01', name: 'Показ и клик', src: 'Рекламный кабинет',
    has: 'Показы, клики, расход, CTR, цена клика.',
    gap: 'Кабинет знает, сколько вы потратили. Что вы за это получили — он не знает и знать не может.',
  },
  {
    n: '02', name: 'Поведение на сайте', src: 'Яндекс Метрика',
    has: 'Визиты, глубина, цели, записи Вебвизора.',
    gap: 'Цель «отправлена форма» засчитывается и боту, и человеку, который передумал через минуту. Звонок с сайта Метрика не видит вообще.',
  },
  {
    n: '03', name: 'Заявка и звонок', src: 'Формы и коллтрекинг',
    has: 'Обращение с источником: кампания, объявление, ключ.',
    gap: 'Без коллтрекинга половина заявок приходит «ниоткуда»: человек посмотрел сайт и позвонил. Источник теряется на этом шаге.',
  },
  {
    n: '04', name: 'Сделка и деньги', src: 'CRM',
    has: 'Статус, сумма, повторные покупки.',
    gap: 'Здесь лежит единственная цифра, ради которой всё затевалось, — и по умолчанию она никак не связана с кампанией, которая привела клиента.',
  },
];

const WORKS = [
  ['Аудит того, что уже стоит',
    'Смотрю Метрику, кабинеты и CRM: какие цели настроены, что из них считается корректно, какие данные уже собираются и просто не сводятся. Часто половина нужного уже есть.'],
  ['Цели и события',
    'Переразмечаю цели по реальным действиям: отправка формы с валидным телефоном, клик по номеру, открытие мессенджера. Отдельно — микроцели для обучения автостратегий: их должно быть достаточно, иначе кампании не выйдут из обучения.'],
  ['Коллтрекинг',
    'Динамическая подмена номера: за каждым посетителем на время визита закрепляется свой номер, и звонок приходит уже с источником. Без этого в услугах и медицине теряется от трети до половины обращений.'],
  ['UTM-разметка и связка с CRM',
    'Единая схема меток по всем каналам — иначе отчёты не сходятся между собой. Источник передаётся в карточку сделки, и выручка возвращается обратно в отчёт по кампаниям.'],
  ['Отчёт, который читают',
    'Один экран: расход, заявки, сделки, выручка и окупаемость по каждому каналу. Не двадцать вкладок дашборда, а таблица, по которой принимается решение «докрутить или отключить».'],
];

const SIGNS = [
  'В отчёте по рекламе 40 заявок, а в CRM за тот же месяц — 12. Никто не знает, где делись остальные.',
  'Половина клиентов на вопрос «откуда узнали» отвечает «из интернета».',
  'Кампании отключаются по цене клика, потому что цены сделки никто не видит.',
  'Продажи выросли, а какая часть роста от рекламы — неизвестно.',
  'Заявок много, а денег нет: каналы приносят разный по качеству трафик, но в отчёте они одинаковые.',
];

const FAQ = [
  ['Сколько стоит сквозная аналитика?',
    'Сопровождение — от 12 000 ₽ в месяц, актуальный прайс <a href="/ceny/">на странице цен</a>. Отдельно оплачиваются сервисы: коллтрекинг и Roistat тарифицируются по своим прайсам и оплачиваются напрямую им — я не перепродаю их и не беру наценку. Разовая настройка обсуждается отдельно, её объём зависит от того, что уже стоит.'],
  ['Обязательно ли Roistat?',
    'Нет. Я официальный партнёр Roistat и чаще собираю на нём, потому что там из коробки есть коллтрекинг и связка с CRM. Но если задача проще — хватит Метрики с корректными целями и ручной выгрузки из CRM раз в месяц. Дорогой сервис ради трёх заявок в неделю не окупится, и я это скажу.'],
  ['У меня нет CRM. Это тупик?',
    'Нет, но потолок ниже. Без CRM видно путь до заявки: какая кампания её принесла и сколько она стоила. Дальше цепочка обрывается — выручку связать не с чем. Часто разумный порядок такой: сначала коллтрекинг и цели, потом CRM, потом полная связка.'],
  ['Через сколько будут данные?',
    'Настройка занимает от нескольких дней до двух недель — зависит от числа каналов и от того, есть ли доступ к CRM. Осмысленная картина набирается за месяц-полтора: по одной неделе выводы делать нельзя, разброс слишком большой.'],
  ['Можно взять только аналитику, без рекламы?',
    'Да. Это отдельная услуга, и я регулярно так работаю — в том числе с проектами, где рекламу ведёт другой подрядчик. Отчёт при этом получаете вы, а не он.'],
  ['Коллтрекинг — это законно?',
    'Да. Подменный номер — обычная телефония, разговоры записываются с уведомлением в начале звонка, как в любом колл-центре. Данные посетителей обрабатываются на основаниях, описанных <a href="/politika/">в политике конфиденциальности</a>.'],
];

const SA_CSS = `<style>
/* ── Путь заявки ─────────────────────────────────────────────────────────
   Четыре шага, у каждого — что видно и что теряется. Ключ композиции в
   том, что «теряется» набрано ярче и стоит правее: глаз идёт по правой
   колонке и читает подряд четыре разрыва. Это и есть смысл блока.

   Сплошная вертикаль слева — общая для всех шагов, рисуется на контейнере.
   Ниже последнего шага она обрывается: цепочка не замкнута, в этом суть. */
.pth { position: relative; margin-top: 40px; display: flex; flex-direction: column; }
.pth::before {
  content: ''; position: absolute; left: 21px; top: 30px; bottom: 46px; width: 1px;
  background: linear-gradient(var(--accent) 0 40%, var(--line-strong, rgba(255,255,255,.14)) 100%);
  opacity: .5;
}
.pth-step { display: grid; gap: 6px 24px; padding: 26px 0; grid-template-columns: 44px minmax(0, 1fr); }
@media (min-width: 940px) {
  .pth-step { grid-template-columns: 44px minmax(0, 300px) minmax(0, 1fr); align-items: start; }
}
.pth-step + .pth-step { border-top: 1px solid var(--line); }
.pth-dot {
  position: relative; z-index: 1;
  width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--pg, #08080a); border: 1px solid var(--accent-soft-bd, rgba(182,240,30,.3));
  font-size: 12px; font-weight: 700; color: var(--accent-bright);
  font-variant-numeric: tabular-nums;
}
.pth-name { font-size: 21px; font-weight: 700; letter-spacing: -0.01em; color: var(--txt); }
.pth-src {
  display: inline-block; margin-top: 9px; padding: 4px 11px;
  border-radius: 999px; border: 1px solid var(--line);
  font-size: 12px; color: var(--txt-3);
}
.pth-has { margin: 12px 0 0; font-size: 14px; line-height: 1.55; color: var(--txt-3); }
.pth-gap {
  margin: 0; padding-left: 20px; position: relative;
  font-size: 16px; line-height: 1.65; color: var(--txt-2);
  border-left: 2px solid var(--accent); padding-block: 2px;
}
.pth-gap b { color: var(--txt); font-weight: 600; }
@media (max-width: 939px) { .pth-gap { margin-top: 14px; } }

/* ── Признаки: список без карточек ───────────────────────────────────────
   Карточка здесь была бы лишней рамкой вокруг одной строки. Разделяем
   линиями и ведущей цифрой — плотнее и читается как перечень симптомов. */
.sgn { margin-top: 34px; display: flex; flex-direction: column; }
.sgn-i {
  display: flex; gap: 20px; align-items: baseline;
  padding: 20px 0; border-bottom: 1px solid var(--line);
  font-size: 17px; line-height: 1.6; color: var(--txt-2);
}
.sgn-i:first-child { border-top: 1px solid var(--line); }
.sgn-n {
  flex: none; width: 26px;
  font-size: 12px; font-weight: 700; color: var(--accent-bright);
  font-variant-numeric: tabular-nums;
}

/* ── Партнёрская плашка ──────────────────────────────────────────────────
   Одна строка вместо блока «наши партнёры» с логотипами: подтверждение
   нужно, но занимать им экран незачем. */
.prt {
  display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px;
  margin-top: 30px; padding: 20px 24px;
  border: 1px solid var(--accent-soft-bd, rgba(182,240,30,.3)); border-radius: 16px;
  background: linear-gradient(100deg, rgba(182, 240, 30, .05), transparent 60%);
}
.prt-badge {
  font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
  color: var(--accent-bright);
}
.prt-txt { font-size: 15px; line-height: 1.6; color: var(--txt-2); margin: 0; flex: 1 1 320px; }
</style>`;

export function render() {
  const crumbs = breadcrumbs([['/skvoznaya-analitika/', 'Сквозная аналитика']]);

  const path = PATH.map((p) => `      <div class="pth-step reveal">
        <div class="pth-dot">${p.n}</div>
        <div>
          <div class="pth-name">${p.name}</div>
          <span class="pth-src">${p.src}</span>
          <p class="pth-has">Что видно: ${p.has}</p>
        </div>
        <p class="pth-gap"><b>Что теряется.</b> ${p.gap}</p>
      </div>`).join('\n');

  const signs = SIGNS.map((s, i) => `        <div class="sgn-i reveal"><span class="sgn-n">0${i + 1}</span><span>${s}</span></div>`).join('\n');

  const works = WORKS.map(([t, d], i) => `        <div class="tl-item reveal">
          <div class="tl-num">${i + 1}</div>
          <div class="tl-body">
            <div class="tl-title">${t}</div>
            <p class="tl-text">${d}</p>
          </div>
        </div>`).join('\n');

  const body = `${hero({
    label: 'Сквозная аналитика',
    crumbs: crumbs.visible,
    eyebrow: 'Сквозная аналитика · Roistat, Метрика, коллтрекинг',
    h1: 'Настройка сквозной аналитики <span class="accent">для рекламы и CRM</span>',
    utp: 'Показываю, какая кампания принесла деньги, а какая только клики. <b>Официальный партнёр Roistat</b> — сервисы вы оплачиваете напрямую им, наценки на них у меня нет.',
    lead: 'Рекламный кабинет знает про расход, Метрика — про визиты, CRM — про выручку. Между ними разрыв, и в нём теряется главный ответ: что окупилось. Связываю цепочку от показа до сделки и учу читать отчёт без аналитика.',
    ctas: `          <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Обсудить задачу</a>
          <a class="btn btn-ghost btn-lg" href="/ceny/">Посмотреть цены</a>`,
    factList: [
      ['5–10 <span>дней</span>', 'на настройку и проверку связок'],
      ['от 12 000 <span>₽</span>', 'в месяц за сопровождение'],
      ['<span>1</span> отчёт', 'вместо трёх систем, которые спорят между собой'],
    ],
    visual: mockReport({
      url: 'roistat.com / отчёт по источникам',
      head: ['Источник', 'Расход', 'Сделки', 'Прибыль'],
      rows: [
        ['Директ · Поиск', '84 200 ₽', '19', '+312 000 ₽', 'win'],
        ['Директ · РСЯ', '61 500 ₽', '4', '−12 400 ₽', 'lose'],
        ['VK Ads', '38 000 ₽', '9', '+96 500 ₽', ''],
        ['Яндекс Карты', '20 000 ₽', '14', '+188 000 ₽', 'win'],
      ],
      /* Подпись не ссылается на столбец с расходом: на телефоне он скрыт,
         иначе четыре колонки сжимаются до шестидесяти пикселей и числа
         рвутся посередине. Текст должен быть верен в обоих случаях. */
      cap: 'РСЯ приносит клики и почти не приносит сделок. В рекламном кабинете этой строки нет — там видно только расход и переходы, и канал выглядит нормальным.',
    }),
  })}

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Где рвётся</div>
      <h2>Путь заявки и четыре разрыва</h2>
      <p class="lead">Каждый инструмент честно показывает свой участок и обрывается на границе следующего. Проблема не в инструментах — в том, что между ними никто не проложил связь.</p>
    </div>
    <div class="pth">
${path}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Симптомы</div>
      <h2>Когда аналитика уже нужна</h2>
      <p class="lead">Пять признаков из практики. Достаточно двух совпадений, чтобы разрыв стоил вам заметных денег.</p>
    </div>
    <div class="sgn">
${signs}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap wrap-narrow">
    <div class="section-head reveal">
      <div class="eyebrow">Что я делаю</div>
      <h2>Порядок работ</h2>
    </div>
    <div class="tl">
${works}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap wrap-narrow">
    <div class="section-head reveal">
      <div class="eyebrow">Вопросы</div>
      <h2>Что обычно спрашивают</h2>
    </div>
    <div class="faq-list reveal">
${faqItems(FAQ)}
    </div>
  </div>
</section>

${cases(CASE_SETS.analytics)}

${related('/skvoznaya-analitika/', ['/kontekstnaya-reklama/', '/audit-reklamy/', '/kompleksnyj-marketing/'])}

<section class="section">
  <div class="wrap">
    <div class="cta-final reveal">
      <h2>Посмотрю, что у вас уже считается</h2>
      <p class="lead">Дайте доступ к Метрике и кабинету — скажу, какие цифры сейчас врут и что нужно доделать в первую очередь. Часто половина нужного уже настроена.</p>
      <div class="btn-row">
        <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Написать мне</a>
        <a class="btn btn-ghost btn-lg" href="/kompleksnyj-marketing/">Маркетинг под ключ</a>
      </div>
    </div>
  </div>
</section>`;

  const schema = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Настройка и ведение сквозной аналитики',
      serviceType: 'Веб-аналитика',
      description: 'Связка рекламных кабинетов, Яндекс Метрики, коллтрекинга и CRM: выручка по каждому источнику вместо кликов.',
      url: SITE + meta.path,
      areaServed: { '@type': 'Country', name: 'Россия' },
      provider: { '@type': 'Person', name: 'Даниил Карацапов', url: SITE },
      offers: {
        '@type': 'Offer',
        price: '12000',
        priceCurrency: 'RUB',
        url: SITE + '/ceny/',
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '12000',
          priceCurrency: 'RUB',
          unitText: 'месяц',
          valueAddedTaxIncluded: true,
        },
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

  return { body, schema, extraHead: `<style>${SVC_CSS}</style>` + SA_CSS };
}
