/* case-page.mjs — страница одного кейса из cases-data.mjs.

   Зачем отдельный шаблон, когда есть case-kit.mjs. Каркас в case-kit
   рассчитан на развёрнутый кейс со скриншотами интерфейса: галерея,
   лайтбокс, лента блоков «что сделано» с осью. У «Сферы» и «ДиАвто» такие
   материалы есть, потому что клиенты сами их передали. У остальных
   двадцати одного кейса материалов нет — есть задача, действия и цифры.
   Гнать их через тяжёлый каркас значит получить страницу с пустыми
   рамками там, где должны быть снимки.

   Про фотографии. Снимки остаются — обезличиваются только названия. На
   части фотографий видна вывеска, и владелец сайта решил это оставить:
   живой снимок объекта убеждает сильнее, чем пустая плашка. У трёх кейсов
   снимка нет вовсе, поэтому вёрстка обязана выглядеть прилично и без
   картинки — вместо неё выводится плашка с нишей, а не битый <img>.

   Про заголовки. h1 — это поисковый запрос («Яндекс Директ для
   строительной компании»), а не название проекта. По названию бренда никто
   не ищет, а по услуге с нишей ищут постоянно, и такой заголовок сразу
   говорит читателю, его это случай или чужой.
*/
import { SITE, breadcrumbs } from './layout.mjs';
import { CASES } from './cases-data.mjs';

/* «Сфера» живёт по своему адресу в разделе разработки: у неё есть
   развёрнутая страница со скриншотами, снятая раньше этой генерации.
   Дубль по /keysy/ создал бы две страницы про один проект — для поисковика
   это конкуренция страниц между собой, а не удвоенный охват. */
const OWN_URL = { sfera: '/razrabotka-sajtov/sfera/' };

export function caseUrl(slug) {
  return OWN_URL[slug] || `/keysy/${slug}/`;
}

/* Кейсы, для которых страницы генерируются здесь. */
export const GENERATED_CASES = CASES.filter((c) => !OWN_URL[c.slug]);

const CASE_PAGE_CSS = `
/* ── Страница кейса ──────────────────────────────────────────────────────
   Плотная вёрстка вместо ленты секций. Первая версия шла привычными
   .section с отступами по сто с лишним пикселей: заголовок, потом экран
   пустоты, потом абзац на четыре строки. Кейс — короткий документ, и
   воздух между его частями должен быть меньше, чем между разделами
   посадочной, иначе страница выглядит недописанной.

   Отсюда: снимок и текст в первом экране рядом, «Задача» и «Что я сделал»
   двумя колонками, «Кейсы рядом» и призыв — в одном ряду. */
.kp-hero { padding: 104px 0 0; }
@media (max-width: 900px) { .kp-hero { padding-top: 88px; } }

/* Верх колонок выровнен по верхней границе снимка, низ — по нижней: цифры
   прижаты к низу текстовой колонки, снимок растянут на её высоту. При
   выравнивании по центру заголовок висел ниже верха картинки, а лента цифр
   уезжала под неё — оба края расходились, и первый экран выглядел
   несобранным. */
.kp-top { display: grid; gap: 26px; align-items: stretch; margin-top: 18px; }
@media (min-width: 900px) {
  /* Снимок уже текста: он иллюстрация, а не главное на экране. */
  .kp-top { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 44px; }
}
.kp-intro { display: flex; flex-direction: column; min-width: 0; }
/* Без снимка колонка одна, и самого блока со снимком нет: пустая плашка
   в первом экране читается как незагрузившаяся картинка, а не как «снимка
   не было». В карточке витрины плашка нужна — там она держит высоту ряда. */
.kp-top:not(:has(.kp-img)) { grid-template-columns: minmax(0, 1fr); }

.kp-eyebrow { display: inline-block; margin: 0 0 14px; padding: 5px 12px;
  border-radius: var(--r-pill); background: rgba(255,255,255,.06); color: var(--muted);
  font-size: 11.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
.kp-hero h1 { margin: 0 0 14px; font-size: clamp(28px, 3.4vw, 44px); line-height: 1.08;
  letter-spacing: -0.03em; }
.kp-lead { margin: 0; font-size: clamp(15.5px, 1.4vw, 17.5px); line-height: 1.6;
  color: var(--muted); max-width: 54ch; }

.kp-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; margin-top: 18px; }
.kp-meta-i { font-size: 13.5px; color: var(--muted); }
.kp-meta .kase-chips { display: flex; flex-wrap: wrap; gap: 6px; }

/* Снимок 4:3 и без внешних полей: в первом экране он работает как обложка
   кейса, поэтому занимает свою колонку целиком. */
.kp-shot { margin: 0; display: flex; }
.kp-img { position: relative; aspect-ratio: 4 / 3; border-radius: 20px; overflow: hidden;
  border: 1px solid var(--line); width: 100%; }
/* На широком экране снимок тянется по высоте текстовой колонки, а не задаёт
   её сам: иначе при длинном заголовке текст вылезал бы за нижний край. */
@media (min-width: 900px) { .kp-img { aspect-ratio: auto; min-height: 340px; } }
.kp-img img { position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block; }
@media (max-width: 900px) { .kp-img { aspect-ratio: 16 / 10; } }

.kp-img-ph, .kg-img-ph {
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #16241c, #0b120e);
}
.kp-img-ph > span, .kg-img-ph > span {
  padding: 0 24px; text-align: center;
  font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  color: rgba(255,255,255,.34);
}

/* Цифры — сплошной лентой, без карточек: четыре рамки в ряд под первым
   экраном давали четыре одинаковых прямоугольника и много воздуха внутри
   каждого. Разделители справляются с той же задачей тише. */
.kp-nums { display: grid; gap: 1px; margin-top: 30px;
  border: 1px solid var(--line); border-radius: 18px; overflow: hidden;
  background: var(--line); }
/* margin-top: auto прижимает ленту к низу колонки — к той же линии, где
   заканчивается снимок. */
@media (min-width: 900px) { .kp-nums { margin-top: auto; } }
@media (min-width: 560px)  { .kp-nums { grid-template-columns: repeat(2, 1fr); } }
.kp-num { padding: 18px 20px; background: var(--surface); }
.kp-num-v { font-size: clamp(22px, 2.2vw, 27px); font-weight: 800; letter-spacing: -0.03em;
  color: var(--lime-bright); font-variant-numeric: tabular-nums; }
.kp-num-l { margin-top: 5px; font-size: 13px; line-height: 1.4; color: var(--muted); }

/* Вся содержательная часть — одна секция. Разбив её на две, я получил между
   ними декоративный разделитель, который сборка ставит между соседними
   <section>, и полтораста пикселей пустоты ровно посреди короткого текста.

   Секции кейса вдвое теснее обычных: у .section отступ около ста двадцати
   пикселей сверху и снизу, между четырьмя короткими блоками это давало
   почти экран пустоты. */
.kp-sec { padding: 54px 0 0; }
.kp-sec-last { padding-bottom: 54px; }
.kp-h { margin: 0 0 14px; font-size: clamp(20px, 2vw, 26px); letter-spacing: -0.02em; }
.kp-p { margin: 0; font-size: 16px; line-height: 1.65; color: var(--muted); }

.kp-two { display: grid; gap: 34px; }
@media (min-width: 900px) { .kp-two { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: 56px; } }
.kp-col { min-width: 0; }

.kp-steps { list-style: none; margin: 0; padding: 0; counter-reset: kp; }
.kp-steps li { position: relative; counter-increment: kp;
  padding: 0 0 18px 42px; font-size: 15.5px; line-height: 1.6; color: var(--ink); }
.kp-steps li::before { content: counter(kp, decimal-leading-zero);
  position: absolute; left: 0; top: 0;
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
  color: var(--lime-ink); background: var(--lime); }
.kp-steps li:not(:last-child)::after { content: ''; position: absolute;
  left: 13px; top: 30px; bottom: 4px; width: 1px; background: var(--line-2); }
.kp-steps li:last-child { padding-bottom: 0; }

/* ── Списки «с чем пришли» и «что предложил» ────────────────────────────
   Маркеры разного смысла: минус там, где перечислены симптомы, галочка —
   где решения. Цвет несёт ту же информацию, что и знак, поэтому в
   чёрно-белой печати и при дальтонизме список остаётся читаемым. */
.kp-list-b { margin-top: 22px; }
/* Первый блок в колонке отступа сверху не требует — он и так первый. */
.kp-first { margin-top: 0; }
.kp-h-after { margin-top: 26px; }
.kp-sub { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--muted); }
.kp-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
.kp-list li { position: relative; padding-left: 24px; font-size: 15px; line-height: 1.55;
  color: var(--muted); }
.kp-list li::before { position: absolute; left: 0; top: 0; font-weight: 700; }
.kp-neg .kp-list li::before { content: '—'; color: #ff8a80; }
.kp-pos .kp-list li::before { content: '✓'; color: var(--lime-bright); }

/* ── Состав работ ────────────────────────────────────────────────────────
   Направления в колонки, внутри каждого — перечень. У кейсов от двух до
   пяти направлений, поэтому auto-fit: при двух они займут половину ширины
   каждое, при пяти сложатся в две строки, и подпирать раскладку числом
   колонок под каждый кейс не нужно. */
.kp-works { margin-top: 44px; }
.kp-works-grid { display: grid; gap: 22px 34px; margin-top: 20px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }
.kp-work { min-width: 0; padding-top: 16px; border-top: 2px solid var(--line-2); }
.kp-work-n { font-size: 12px; font-weight: 800; letter-spacing: .06em; color: var(--lime-bright);
  font-variant-numeric: tabular-nums; margin-bottom: 6px; }
.kp-work-t { margin: 0 0 10px; font-size: 17px; letter-spacing: -0.01em; }
.kp-work-l { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.kp-work-l li { position: relative; padding-left: 16px; font-size: 14.5px; line-height: 1.5;
  color: var(--muted); }
.kp-work-l li::before { content: ''; position: absolute; left: 0; top: 9px;
  width: 5px; height: 5px; border-radius: 50%; background: var(--line-2); }

/* Итог и выводы рядом: это две половины одного ответа на вопрос «и что». */
.kp-res { display: grid; gap: 24px; align-items: start; }
@media (min-width: 900px) { .kp-res { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 40px; } }
.kp-res .kp-list-b { margin-top: 34px; }

.kp-out { margin-top: 34px; padding: 22px 24px; border-radius: 18px;
  border: 1px solid rgba(182,240,30,0.28);
  background: linear-gradient(165deg, rgba(182,240,30,0.07), var(--surface));
  font-size: 16px; line-height: 1.6; }
.kp-out b { display: block; margin-bottom: 7px; font-size: 12px; letter-spacing: .08em;
  text-transform: uppercase; color: var(--lime-bright); }

/* Смежные кейсы и призыв — в одном ряду. Раньше это были две полноразмерные
   секции подряд, обе с заголовком и подзаголовком, и хвост страницы выходил
   длиннее её содержательной части. */
.kp-foot { display: grid; gap: 30px; margin-top: 44px; }
@media (min-width: 980px) { .kp-foot { grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 40px; } }
.kp-rel { display: grid; gap: 12px; }
@media (min-width: 620px) { .kp-rel { grid-template-columns: 1fr 1fr; } }
.kp-rel-i { display: block; padding: 18px 20px; border: 1px solid var(--line); border-radius: 16px;
  background: var(--surface); text-decoration: none; color: inherit;
  transition: border-color .2s cubic-bezier(.32,.72,0,1), transform .2s cubic-bezier(.32,.72,0,1); }
.kp-rel-i:hover { border-color: var(--line-2); transform: translateY(-2px); }
.kp-rel-f { font-size: 10.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
  color: var(--lime-bright); margin-bottom: 7px; }
.kp-rel-t { font-size: 16.5px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.3; }
.kp-rel-m { margin-top: 10px; font-size: 13px; color: var(--muted); }
.kp-rel-m b { color: var(--ink); }
.kp-all { margin: 16px 0 0; font-size: 14.5px; }
.kp-all a { color: var(--lime-bright); text-decoration: none; }

.kp-cta { padding: 26px 26px 28px; border-radius: 20px;
  border: 1px solid var(--line-2); background: linear-gradient(165deg, var(--surface-2), var(--surface)); }
.kp-cta p { margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: var(--muted); }
`;


/* Снимок кейса. У трёх кейсов из двадцати двух фотографии нет, и это не
   исключение «на потом»: половина клиентов материалов не передаёт. Пустой
   src даёт в браузере иконку битой картинки, поэтому вместо него — плашка с
   нишей. onerror дополнительно страхует от пропавшего файла: картинка
   убирается, плашка под ней остаётся видна. */
function shot(c, cls) {
  if (!c.img) {
    return `<div class="${cls} ${cls}-ph"><span>${c.field}</span></div>`;
  }
  return `<div class="${cls} ${cls}-ph"><span>${c.field}</span>`
    + `<img src="/${c.img}" alt="${c.field}, ${c.geo}" loading="lazy" decoding="async"`
    + ` onerror="this.remove()"></div>`;
}

const chips = (list) => `<div class="kase-chips">${list
  .map((s) => `<span class="kase-chip">${s}</span>`).join('')}</div>`;

function relCard(slug) {
  const r = CASES.find((c) => c.slug === slug);
  if (!r) throw new Error(`case-page: нет кейса со слагом ${slug}`);
  const [v, l] = r.metrics[0];
  return `      <a class="kp-rel-i" href="${caseUrl(r.slug)}">
        <div class="kp-rel-f">${r.field}</div>
        <div class="kp-rel-t">${r.h1}</div>
        <div class="kp-rel-m"><b>${v}</b> ${l}</div>
      </a>`;
}

export function casePage(c) {
  const path = caseUrl(c.slug);

  const meta = {
    path,
    title: c.seo.title,
    description: c.seo.description,
    ogImage: '/assets/og/keysy.jpg',
  };

  function render() {
    const { visible: crumbs, schema: crumbSchema } = breadcrumbs([
      ['/keysy/', 'Кейсы'], [path, c.h1],
    ]);

    const nums = c.metrics.map(([v, l]) => `      <div class="kp-num">
        <div class="kp-num-v">${v}</div>
        <div class="kp-num-l">${l}</div>
      </div>`).join('\n');

    const steps = c.steps.map((s) => `      <li>${s}</li>`).join('\n');

    /* Боли, решение, состав работ и выводы — то, что раньше лежало в карточке
       витрины под раскрытием. При переезде на отдельные страницы я оставил
       только выжимку, и содержание кейса обеднело: пропали и симптомы, с
       которыми пришёл клиент, и перечень работ по каждому направлению.
       Теперь на странице всё, что было в карточке. */
    const list = (title, items, mod = '') => (items && items.length
      ? `      <div class="kp-list-b${mod}">
        <h3 class="kp-sub">${title}</h3>
        <ul class="kp-list">
${items.map((i) => `          <li>${i}</li>`).join('\n')}
        </ul>
      </div>`
      : '');

    const pains = list('С чем пришли', c.pains, ' kp-neg');
    /* «Что предложил» идёт перед шагами: сначала решение в трёх строках,
       потом как оно выполнялось. В обратном порядке читатель дважды узнаёт
       одно и то же, только второй раз короче. */
    const solution = list('Что предложил', c.solution, ' kp-pos kp-first');
    const conclusions = list('Выводы', c.conclusions, ' kp-pos');

    /* Состав работ — по направлениям, с подпунктами. Это самая длинная часть
       кейса, поэтому она идёт после короткого «что я сделал»: сначала суть в
       пять строк, потом подробности для тех, кому нужно. */
    const works = (c.works && c.works.length) ? `    <div class="kp-works">
      <h2 class="kp-h">Состав работ</h2>
      <div class="kp-works-grid">
${c.works.map((w, i) => `        <div class="kp-work">
          <div class="kp-work-n">${String(i + 1).padStart(2, '0')}</div>
          <h3 class="kp-work-t">${w.t}</h3>
          <ul class="kp-work-l">
${w.items.map((it) => `            <li>${it}</li>`).join('\n')}
          </ul>
        </div>`).join('\n')}
      </div>
    </div>
` : '';

    const body = `<header class="kp-hero">
  <div class="wrap">
    ${crumbs}
    <div class="kp-top">
      <div class="kp-intro">
        <div class="kp-eyebrow">Кейс · ${c.field}</div>
        <h1>${c.h1}</h1>
        <p class="kp-lead">${c.lead}</p>
        <div class="kp-meta">
          <span class="kp-meta-i">${c.geo}</span>
          ${chips(c.services)}
        </div>
        <div class="kp-nums">
${nums}
        </div>
      </div>
      ${c.img ? `<figure class="kp-shot">${shot(c, 'kp-img')}</figure>` : ''}
    </div>
  </div>
</header>

<section class="kp-sec kp-sec-last">
  <div class="wrap kp-two">
    <div class="kp-col">
      <h2 class="kp-h">Задача</h2>
      <p class="kp-p">${c.task}</p>
${pains}
    </div>
    <div class="kp-col">
${solution}
      <h2 class="kp-h kp-h-after">Что я сделал</h2>
      <ol class="kp-steps">
${steps}
      </ol>
    </div>
  </div>

  <div class="wrap">
${works}

    <div class="kp-res">
      <div class="kp-out">
        <b>Что это дало</b>
        ${c.outcome}
      </div>
${conclusions}
    </div>

    <div class="kp-foot">
      <div class="kp-foot-col">
        <h2 class="kp-h">Кейсы рядом</h2>
        <div class="kp-rel">
${c.related.map(relCard).join('\n')}
        </div>
        <p class="kp-all"><a href="/keysy/">Все 22 кейса <span class="arr" aria-hidden="true">→</span></a></p>
      </div>
      <aside class="kp-cta">
        <h2 class="kp-h">Похожая задача?</h2>
        <p>Посмотрю, что у вас сейчас в рекламе и аналитике, и скажу, где теряются деньги. Разбор бесплатный, дальше решаете сами.</p>
        <a class="btn btn-lime" href="/contacts/" data-lead-modal>Обсудить задачу <span class="arr">→</span></a>
      </aside>
    </div>
  </div>
</section>`;

    /* Article, а не CreativeWork: страница — авторский разбор работы с датой и
       автором, поисковики понимают её именно так. Цифры из metrics в
       микроразметку не выносятся: подходящего типа под «ROI 298%» в schema.org
       нет, а натягивать их на offers или aggregateRating значит соврать
       разметкой ради красивого сниппета. */
    const schema = [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: c.h1,
        description: c.seo.description,
        author: { '@type': 'Person', name: 'Даниил Карацапов', url: `${SITE}/about/` },
        publisher: { '@type': 'Person', name: 'Даниил Карацапов' },
        mainEntityOfPage: `${SITE}${path}`,
        about: c.field,
        articleSection: 'Кейсы',
      },
      crumbSchema,
    ];

    return { body, schema, extraHead: `<style>${CASE_PAGE_CSS}</style>` };
  }

  return { meta, render };
}

/* Модули страниц для build.mjs — в том же виде, что и написанные руками. */
export const CASE_PAGES = GENERATED_CASES.map(casePage);

/* ── Витрина /keysy/ ──────────────────────────────────────────────────────

   Раньше на витрине лежали двадцать две карточки с полным текстом кейса под
   раскрытием, а счётчики в фильтрах были проставлены руками и уже разошлись
   с фактами: «GEO — 12» при тринадцати кейсах, «таргет — 4» при пяти.
   Теперь и карточки, и счётчики считаются из данных.

   Полного текста здесь больше нет намеренно: у каждого кейса своя страница,
   и держать тот же текст ещё и в витрине значит показать поисковику два
   одинаковых документа и заставить его выбирать между ними.

   Фотографий нет по той же причине, что и на страницах кейсов: на части
   снимков вывеска с названием заведения, а названия мы убрали. */
const SERVICE_LABELS = [
  ['context', 'Контекстная реклама'],
  ['geo', 'GEO-сервисы'],
  ['analytics', 'Сквозная аналитика'],
  ['site', 'Разработка сайтов'],
  ['target', 'Таргетированная реклама'],
];

const NICHE_LABELS = [
  ['horeca', 'Рестораны и досуг'],
  ['stroy', 'Строительство'],
  ['proizvod', 'Производство и мебель'],
  ['torg', 'Торговля и e-commerce'],
  ['med', 'Медицина и красота'],
  ['eda', 'Еда и доставка'],
  ['edu', 'Образование'],
  ['turizm', 'Туризм и услуги'],
];

function tabs(group, aria, pairs) {
  const items = pairs.map(([key, name]) => {
    const n = CASES.filter((c) => c.tags.includes(key)).length;
    if (!n) throw new Error(`case-page: фильтр «${name}» не находит ни одного кейса`);
    return `          <button type="button" class="kase-tab" data-filter="${key}" aria-pressed="false">`
      + `${name}<span class="kase-tab-n">${n}</span></button>`;
  }).join('\n');
  return `        <div class="kase-tabs" data-group="${group}" role="group" aria-label="${aria}">
          <button type="button" class="kase-tab on" data-filter="all" aria-pressed="true">Все<span class="kase-tab-n">${CASES.length}</span></button>
${items}
        </div>`;
}

export function caseGrid() {
  const cards = CASES.map((c, i) => {
    const [v, l] = c.metrics[0];
    const [v2, l2] = c.metrics[1] || [];
    return `      <a class="kg-i" href="${caseUrl(c.slug)}" data-tags="${c.tags.join(' ')}" style="--d:${i}">
        ${shot(c, 'kg-img')}
        <div class="kg-f">${c.field}</div>
        <h3 class="kg-t">${c.h1}</h3>
        <div class="kg-geo">${c.geo}</div>
        <div class="kg-m">
          <span><b>${v}</b> ${l}</span>
          ${v2 ? `<span><b>${v2}</b> ${l2}</span>` : ''}
        </div>
        <span class="kg-go">Смотреть кейс <span class="arr" aria-hidden="true">→</span></span>
      </a>`;
  }).join('\n');

  return `<div class="kase-filters reveal">
      <div class="kase-filter-group">
        <span class="kase-filter-label">Услуга</span>
${tabs('service', 'Фильтр кейсов по услуге', SERVICE_LABELS)}
      </div>
      <div class="kase-filter-group">
        <span class="kase-filter-label">Ниша</span>
${tabs('niche', 'Фильтр кейсов по нише', NICHE_LABELS)}
      </div>
    </div>
    <div class="kg" id="kaseGrid">
${cards}
    </div>
    <p class="kg-empty" hidden>По этому сочетанию фильтров кейсов нет. Снимите один из них.</p>`;
}

export const CASE_GRID_CSS = `
/* ── Витрина кейсов ──────────────────────────────────────────────────────── */
.kg { display: grid; gap: 14px; margin-top: 26px; }
@media (min-width: 700px)  { .kg { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1080px) { .kg { grid-template-columns: repeat(3, 1fr); } }
/* Снимок в карточке — во всю её ширину, без внутреннего поля: фотография,
   отступившая от краёв рамки, читается как вложенная картинка в документе, а
   не как обложка карточки. */
.kg-img { position: relative; aspect-ratio: 16 / 9; margin: -24px -22px 16px;
  border-radius: 17px 17px 0 0; overflow: hidden; }
.kg-img img { position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block; }

.kg-i { display: flex; flex-direction: column; padding: 24px 22px 20px;
  border: 1px solid var(--line); border-radius: 18px; background: var(--surface);
  text-decoration: none; color: inherit;
  transition: border-color .2s cubic-bezier(.32,.72,0,1), transform .2s cubic-bezier(.32,.72,0,1); }
.kg-i:hover { border-color: var(--line-2); transform: translateY(-2px); }
.kg-i.hide { display: none; }
.kg-f { font-size: 11px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
  color: var(--lime-bright); margin-bottom: 8px; }
.kg-t { margin: 0 0 6px; font-size: 19px; line-height: 1.3; letter-spacing: -0.02em; }
.kg-geo { font-size: 13.5px; color: var(--muted); }
/* Цифры прижаты к низу: заголовки-запросы бывают в одну и в три строки, и без
   этого ряды метрик в соседних карточках стояли бы вразнобой. */
.kg-m { margin-top: auto; padding-top: 18px; display: flex; flex-direction: column; gap: 7px;
  font-size: 13.5px; color: var(--muted); }
.kg-m b { color: var(--ink); font-weight: 700; font-variant-numeric: tabular-nums; }
.kg-go { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line);
  font-size: 13.5px; font-weight: 600; color: var(--lime-bright); }
.kg-empty { margin: 26px 0 0; text-align: center; color: var(--muted); font-size: 15px; }
`;
