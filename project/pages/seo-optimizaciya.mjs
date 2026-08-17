/* /seo-optimizaciya/ — SEO-оптимизация сайтов.

   Зачем страница. SEO есть в стеке владельца и упоминается в статье
   «Директ или SEO», но своей страницы у услуги не было — запросы вида
   «сео продвижение сайта», «оптимизация сайта под поиск» уходили в никуда.

   Особая осторожность в тоне. SEO — ниша, где обещают «ТОП-1 за месяц», и
   любой текст в этом жанре звучит как ещё одно такое обещание. Поэтому
   центральный блок страницы — не список работ, а сравнение того, как
   накапливается результат у контекста и у поиска: первый даёт заявки сразу
   и перестаёт в день отключения, второй месяцами ничего не даёт, а потом
   работает без ежедневного расхода. Из этой картинки честно следует, кому
   SEO не подходит, — и это сильнее любого убеждения.

   Цены на услугу в прайсе нет, поэтому цифры здесь нет. Появится в прайсе —
   встанет и сюда.
*/
import { SITE, breadcrumbs, faqItems } from '../layout.mjs';
import { SVC_CSS, hero, mockSerp, related } from '../service-kit.mjs';

export const meta = {
  path: '/seo-optimizaciya/',
  title: 'SEO-оптимизация сайта — техническая база, структура, тексты | Даниил Карацапов',
  description: 'Готовлю сайт к поисковому продвижению: техническая база, структура под спрос, тексты и коммерческие факторы. Без обещаний «ТОП-1 за месяц» — с понятной картиной сроков и границ метода.',
  ogImage: '/assets/og/uslugi.jpg',
};

/* Накопление результата по месяцам, в условных долях. Цифры — не прогноз
   по конкретному проекту, а форма кривой: контекст ровный и обрывается на
   отключении, поиск раскачивается медленно. Подписи под графиком говорят
   об этом прямо, чтобы столбики не читались как обещание. */
const CURVE = {
  months: 12,
  ads: [70, 72, 70, 71, 70, 72, 71, 70, 72, 71, 70, 71],
  seo: [2, 4, 8, 14, 22, 32, 42, 52, 62, 70, 78, 84],
};

const BLOCKS = [
  {
    n: '01',
    name: 'Техническая база',
    lead: 'То, без чего остальное не имеет смысла: робот должен дойти до страницы, понять её и не наткнуться на дубль.',
    items: [
      'Индексация: robots.txt, карта сайта, коды ответов, мусор в поиске',
      'Дубли страниц и канонические адреса — самая частая причина, по которой сайт не растёт',
      'Скорость и Core Web Vitals: медленный сайт хуже ранжируется и хуже конвертирует',
      'Мобильная версия — поиск смотрит на неё, а не на десктопную',
      'Микроразметка: организация, товары, услуги, хлебные крошки, FAQ',
    ],
  },
  {
    n: '02',
    name: 'Структура под спрос',
    lead: 'Сайт растёт не текстами, а страницами: под каждый устойчивый кластер запросов должна быть своя.',
    items: [
      'Сбор семантики и разбивка на кластеры по смыслу, а не по частотности',
      'Карта сайта: какие страницы есть, каких не хватает, какие конкурируют между собой',
      'Посадочные под услуги, ниши и регионы — вместо одной страницы «Услуги»',
      'Внутренняя перелинковка: вес идёт туда, где деньги, а не размазывается ровным слоем',
    ],
  },
  {
    n: '03',
    name: 'Тексты и содержание',
    lead: 'Текст пишется под вопрос человека, а не под плотность ключей. Поиск давно считает поведение, а не вхождения.',
    items: [
      'Заголовки и мета-описания, по которым кликают в выдаче',
      'Материалы, которые отвечают на вопрос целиком — иначе человек возвращается в выдачу',
      'Экспертность в явном виде: автор, опыт, случаи из практики',
      'Обновление того, что уже есть: чаще выгоднее переписать старую страницу, чем добавить новую',
    ],
  },
  {
    n: '04',
    name: 'Коммерческие факторы',
    lead: 'Для коммерческих запросов поиск сравнивает не тексты, а полноту предложения — и здесь SEO смыкается с обычным маркетингом.',
    items: [
      'Цены, условия, сроки, доставка — в явном виде, а не «уточняйте у менеджера»',
      'Контакты, реквизиты, способы связи, подтверждения квалификации',
      'Карточка организации в Яндекс Бизнесе и отзывы — <a href="/geo-servisy/">GEO-сервисы</a> и поиск связаны сильнее, чем кажется',
      'Удобство заявки: чем короче путь до неё, тем лучше поведенческие',
    ],
  },
];

const NOT_FOR = [
  'Заявки нужны в этом месяце. SEO так не работает — на быстрый результат есть <a href="/kontekstnaya-reklama/">контекст</a>.',
  'Домен зарегистрирован недавно и на нём ничего нет. Молодому сайту нужно время просто на то, чтобы поиск начал ему доверять.',
  'Спроса в поиске нет. Если продукт не ищут, оптимизировать нечего — тут нужны <a href="/promostranicy/">промостраницы</a> или таргет.',
  'Разовая услуга с оплатой за месяц. Всё, что делается за один месяц, — это подготовка; результат считается кварталами.',
];

const FAQ = [
  ['Сколько стоит SEO?',
    'Стоимость зависит от состояния сайта и объёма работ: одно дело — привести в порядок техническую базу существующего сайта, другое — строить структуру под спрос с нуля. Называю после разбора сайта. Прайс на остальные услуги — <a href="/ceny/">на странице цен</a>.'],
  ['Через сколько будет результат?',
    'Первые сдвиги по позициям обычно видны через три-четыре месяца, ощутимый трафик — через шесть-двенадцать. Разброс большой: он зависит от возраста домена, конкуренции в нише и того, в каком состоянии сайт достался. Любой, кто называет срок точнее, не смотрел ваш сайт.'],
  ['Вы гарантируете ТОП-10?',
    'Нет, и никто не может. Позиции зависят от алгоритма, который меняется, и от конкурентов, которые тоже работают. Гарантировать можно объём и качество работ, а не место в выдаче. Гарантия «ТОП-1» обычно означает, что в договоре стоят низкочастотные запросы, по которым и так никого нет.'],
  ['Что лучше — SEO или контекст?',
    'Это не альтернатива, а разные роли. Контекст даёт заявки сразу и прекращает в день отключения; поиск месяцами ничего не даёт, а потом работает без ежедневного расхода. Обычно разумно начинать с контекста, чтобы понять, какой спрос вообще конвертируется, и параллельно строить поиск. Подробнее — в статье <a href="/blog/direkt-ili-seo/">«Директ или SEO»</a>.'],
  ['У меня сайт на конструкторе. С ним можно работать?',
    'Как правило да, но потолок ниже: часть технических правок на конструкторах недоступна. Смотрю по месту — иногда разумнее <a href="/razrabotka-sajtov/">сделать сайт заново</a>, чем годами обходить ограничения платформы, а иногда конструктора хватает с запасом.'],
  ['Вы закупаете ссылки?',
    'Массовой закупкой не занимаюсь. Ссылочный профиль имеет значение, но дешёвые ссылки пачками — это риск фильтра при сомнительной пользе. Куда больше отдачи от того, что делается на самом сайте: структуры, скорости, содержания и коммерческих факторов.'],
];

const SEO_CSS = `<style>
/* ── График накопления ───────────────────────────────────────────────────
   Два ряда столбиков по двенадцати месяцам: сверху контекст, снизу поиск.
   Смысл в форме, а не в цифрах: у контекста ровная полка, которая
   обрывается на отключении, у поиска — медленный разгон.

   Столбики рисуются высотой в процентах внутри общей дорожки, без единой
   картинки и без библиотеки графиков: двенадцать делений — не тот объём
   данных, ради которого стоит тянуть скрипт. */
.crv { margin-top: 40px; display: flex; flex-direction: column; gap: 30px; }
.crv-row { display: flex; flex-direction: column; gap: 12px; }
.crv-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.crv-name { font-size: 17px; font-weight: 700; color: var(--txt); }
.crv-sub { font-size: 14px; color: var(--txt-3); }
.crv-bars { display: flex; align-items: flex-end; gap: 4px; height: 132px; }
.crv-bar { flex: 1; min-width: 0; border-radius: 5px 5px 0 0; }
.crv-row.ads .crv-bar { background: linear-gradient(180deg, rgba(255, 255, 255, .22), rgba(255, 255, 255, .07)); }
.crv-row.seo .crv-bar { background: linear-gradient(180deg, var(--accent), rgba(182, 240, 30, .22)); }
.crv-axis {
  display: flex; gap: 4px; font-size: 11px; color: var(--txt-3);
  font-variant-numeric: tabular-nums;
}
.crv-axis span { flex: 1; min-width: 0; text-align: center; }
.crv-note {
  margin: 4px 0 0; padding-left: 18px; border-left: 2px solid var(--line-strong, rgba(255,255,255,.14));
  font-size: 14px; line-height: 1.6; color: var(--txt-3);
}
.crv-legend { margin: 26px 0 0; font-size: 14px; line-height: 1.65; color: var(--txt-3); }

/* ── Блоки работ ─────────────────────────────────────────────────────────
   Номер и название слева, пояснение и перечень справа. Тот же приём, что
   на соседних страницах услуг: единый ритм важнее разнообразия ради
   разнообразия. */
.blk { margin-top: 40px; display: flex; flex-direction: column; }
.blk-i { display: grid; gap: 14px 32px; padding: 32px 0; grid-template-columns: 1fr; border-top: 1px solid var(--line); }
.blk-i:last-child { border-bottom: 1px solid var(--line); }
@media (min-width: 900px) { .blk-i { grid-template-columns: minmax(0, 330px) minmax(0, 1fr); } }
.blk-head { display: flex; align-items: baseline; gap: 14px; }
.blk-n { font-size: 12px; font-weight: 700; letter-spacing: .16em; color: var(--accent-bright); font-variant-numeric: tabular-nums; }
.blk-name { font-size: clamp(21px, 2.4vw, 27px); font-weight: 700; letter-spacing: -0.02em; color: var(--txt); }
.blk-lead { margin: 12px 0 0; font-size: 15px; line-height: 1.6; color: var(--txt-3); }
.blk-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
.blk-list li { position: relative; padding-left: 26px; font-size: 15.5px; line-height: 1.6; color: var(--txt-2); }
.blk-list li::before {
  content: ''; position: absolute; left: 4px; top: .62em;
  width: 8px; height: 8px; border-radius: 2px; border: 1.5px solid var(--accent);
}
.blk-list a { color: var(--accent-bright); text-decoration: none; border-bottom: 1px solid transparent; }
.blk-list a:hover { border-bottom-color: currentColor; }

/* ── Кому не подходит ───────────────────────────────────────────────────── */
.nof { display: grid; gap: 1px; margin-top: 34px; background: var(--line);
  border: 1px solid var(--line); border-radius: 18px; overflow: clip; }
@media (min-width: 860px) { .nof { grid-template-columns: 1fr 1fr; } }
.nof-i { background: var(--surface); padding: 24px 26px; font-size: 15px; line-height: 1.6; color: var(--txt-2); }
.nof-i strong { display: block; color: var(--txt); font-weight: 600; margin-bottom: 4px; }
.nof-i a { color: var(--accent-bright); text-decoration: none; border-bottom: 1px solid transparent; }
.nof-i a:hover { border-bottom-color: currentColor; }
</style>`;

export function render() {
  const crumbs = breadcrumbs([['/seo-optimizaciya/', 'SEO-оптимизация']]);

  const bars = (vals) => vals
    .map((v) => `<div class="crv-bar" style="height:${v}%"></div>`).join('');
  const axis = Array.from({ length: CURVE.months }, (_, i) => `<span>${i + 1}</span>`).join('');

  const blocks = BLOCKS.map((b) => `      <div class="blk-i reveal">
        <div>
          <div class="blk-head"><span class="blk-n">${b.n}</span><span class="blk-name">${b.name}</span></div>
          <p class="blk-lead">${b.lead}</p>
        </div>
        <ul class="blk-list">
${b.items.map((i) => `          <li>${i}</li>`).join('\n')}
        </ul>
      </div>`).join('\n');

  const nofit = NOT_FOR.map((n) => {
    const [head, ...rest] = n.split('. ');
    return `        <div class="nof-i"><strong>${head}.</strong>${rest.join('. ')}</div>`;
  }).join('\n');

  /* Макет выдачи, а не абстрактная картинка: страница про поиск, и первое,
     что стоит показать, — как выглядит результат работы. Рекламное место
     сверху здесь не случайно: оно показывает, что органика и контекст стоят
     на одной странице, а это ровно тот выбор, который разбирается ниже. */
  const serp = mockSerp({
    query: 'производство мебели на заказ москва',
    items: [
      { ad: true, title: 'Мебель на заказ — от 7 дней', url: 'mebel-primer.ru', desc: 'Замер бесплатно. Рассрочка. Гарантия 3 года.' },
      { on: true, pos: '1', title: 'Производство мебели на заказ в Москве — цены и сроки',
        url: 'vash-sajt.ru › proizvodstvo', desc: 'Собственный цех, замер за 1 день, договор с фиксированной ценой. Более 400 проектов за 6 лет.' },
      { title: 'Мебель на заказ в Москве — каталог', url: 'katalog-primer.ru › mebel', desc: 'Кухни, шкафы, гардеробные. Фото работ, отзывы клиентов.' },
    ],
    cap: 'Место в органической выдаче не оплачивается за переход: расход не растёт вместе с трафиком.',
  });

  const body = `${hero({
    label: 'SEO-оптимизация',
    crumbs: crumbs.visible,
    eyebrow: 'SEO-оптимизация · Яндекс и Google',
    h1: 'SEO-оптимизация сайта <span class="accent">под поисковый спрос</span>',
    utp: 'Готовлю сайт так, чтобы поиск начал его показывать: техническая база, структура под спрос, тексты и коммерческие факторы. <b>Без обещаний «ТОП-1 за месяц»</b> — со сроками, которые можно проверить.',
    lead: 'Работаю сам, без перепродажи подряда. Ниже — что именно делается, за какие сроки видно первое движение и в каких четырёх случаях за SEO не стоит браться вовсе.',
    ctas: `          <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Разобрать мой сайт</a>
          <a class="btn btn-ghost btn-lg" href="/blog/direkt-ili-seo/">Статья: Директ или SEO</a>`,
    /* Цифры — то, что человек хочет знать до разговора: когда будет видно
       результат и чем это отличается от рекламы по расходу. */
    factList: [
      ['3–4 <span>мес</span>', 'до первых сдвигов по позициям'],
      ['6–12 <span>мес</span>', 'до ощутимого поискового трафика'],
      ['<span>0 ₽</span> за клик', 'переход из органики ничего не стоит'],
    ],
    visual: serp,
  })}

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Как копится результат</div>
      <h2>Контекст и поиск ведут себя по-разному</h2>
      <p class="lead">Это не спор «что лучше»: у инструментов разная форма отдачи. Контекст выходит на свой уровень за недели и держится ровно, пока оплачивается. Поиск месяцами почти ничего не даёт, а потом продолжает работать без ежедневного расхода.</p>
    </div>
    <div class="crv reveal">
      <div class="crv-row ads">
        <div class="crv-head"><span class="crv-name">Контекстная реклама</span><span class="crv-sub">ровная полка, обрывается в день отключения</span></div>
        <div class="crv-bars">${bars(CURVE.ads)}</div>
      </div>
      <div class="crv-row seo">
        <div class="crv-head"><span class="crv-name">Поисковая оптимизация</span><span class="crv-sub">медленный разгон, накопленный эффект остаётся</span></div>
        <div class="crv-bars">${bars(CURVE.seo)}</div>
        <div class="crv-axis">${axis}</div>
      </div>
      <p class="crv-note">Месяцы по горизонтали. Высота столбиков — форма кривой, а не прогноз по вашему проекту: реальные цифры зависят от возраста домена, конкуренции и состояния сайта.</p>
    </div>
    <p class="crv-legend">Отсюда и вывод, который я обычно предлагаю: начинать с контекста, чтобы быстро понять, какой спрос вообще превращается в деньги, и параллельно строить поиск на тех же кластерах. Тогда к моменту, когда SEO разгонится, уже известно, за что имеет смысл бороться.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Что входит</div>
      <h2>Четыре блока работ</h2>
      <p class="lead">Порядок не произвольный: без технической базы бессмысленна структура, без структуры — тексты. Ссылки в этом списке отсутствуют намеренно, про них есть отдельный вопрос ниже.</p>
    </div>
    <div class="blk">
${blocks}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Честно о границах</div>
      <h2>Когда SEO брать не нужно</h2>
    </div>
    <div class="nof reveal">
${nofit}
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

${related('/seo-optimizaciya/', ['/kontekstnaya-reklama/', '/razrabotka-sajtov/', '/geo-servisy/'])}

<section class="section">
  <div class="wrap">
    <div class="cta-final reveal">
      <h2>Посмотрю сайт и скажу, есть ли смысл</h2>
      <p class="lead">Разберу техническое состояние, структуру и спрос в нише. Если по цифрам выйдет, что поиск вам сейчас не по срокам, — скажу прямо и предложу то, что сработает быстрее.</p>
      <div class="btn-row">
        <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Написать мне</a>
        <a class="btn btn-ghost btn-lg" href="/audit-reklamy/">Аудит рекламы</a>
      </div>
    </div>
  </div>
</section>`;

  const schema = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'SEO-оптимизация сайта',
      serviceType: 'Поисковая оптимизация',
      description: 'Техническая база, структура под поисковый спрос, тексты и коммерческие факторы: подготовка сайта к продвижению в Яндексе и Google.',
      url: SITE + meta.path,
      areaServed: { '@type': 'Country', name: 'Россия' },
      provider: { '@type': 'Person', name: 'Даниил Карацапов', url: SITE },
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

  return { body, schema, extraHead: `<style>${SVC_CSS}</style>` + SEO_CSS };
}
