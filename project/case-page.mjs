/* case-page.mjs — страница одного кейса из cases-data.mjs.

   Зачем отдельный шаблон, когда есть case-kit.mjs. Каркас в case-kit
   рассчитан на развёрнутый кейс со скриншотами интерфейса: галерея,
   лайтбокс, лента блоков «что сделано» с осью. У «Сферы» и «ДиАвто» такие
   материалы есть, потому что клиенты сами их передали. У остальных
   двадцати одного кейса материалов нет — есть задача, действия и цифры.
   Гнать их через тяжёлый каркас значит получить страницу с пустыми
   рамками там, где должны быть снимки.

   Про фотографии. На страницах кейсов их нет намеренно. Снимки в портфолио
   сняты «как есть» — на части из них вывеска с названием заведения, и
   обезличенный заголовок над фотографией вывески выглядит нелепо: текст
   говорит «магазин техники», картинка называет бренд. Либо обезличиваем
   по-настоящему, либо не обезличиваем вовсе; выбрано первое.

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
/* ── Страница кейса ──────────────────────────────────────────────────────── */
/* Отступ сверху отдельным правилом: шапка сайта фиксированная и лежит поверх
   содержимого, поэтому первый экран должен начинаться ниже неё. С обычным
   .section хлебные крошки уезжали под шапку — их просто не было видно. */
.kp-hero { padding: 104px 0 0; }
@media (max-width: 900px) { .kp-hero { padding-top: 88px; } }
.kp-eyebrow { display: inline-block; margin: 22px 0 14px; padding: 5px 12px;
  border-radius: var(--r-pill); background: rgba(255,255,255,.06); color: var(--muted);
  font-size: 11.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
.kp-hero h1 { margin: 0 0 16px; font-size: clamp(30px, 5vw, 52px); line-height: 1.05;
  letter-spacing: -0.03em; max-width: 18ch; }
.kp-lead { margin: 0; font-size: clamp(16px, 1.6vw, 19px); line-height: 1.6;
  color: var(--muted); max-width: 62ch; }

/* Ниша, география и услуги — строкой, а не карточкой: это подпись к
   заголовку, и рамка вокруг неё сделала бы из подписи отдельный объект. */
.kp-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 22px;
  margin: 24px 0 0; padding-top: 22px; border-top: 1px solid var(--line); }
.kp-meta-i { font-size: 14.5px; color: var(--muted); }
.kp-meta-i b { color: var(--ink); font-weight: 600; }
.kp-meta .kase-chips { display: flex; flex-wrap: wrap; gap: 6px; }

/* Цифры в первом экране: человек, открывший кейс из выдачи, решает за
   секунды, читать ли дальше. Результат прячут в конец по привычке из
   бумажных отчётов — здесь он сверху, а подробности ниже для тех, кому
   цифры показались интересными. */
.kp-nums { display: grid; gap: 14px; margin-top: 34px; }
@media (min-width: 620px)  { .kp-nums { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1000px) { .kp-nums { grid-template-columns: repeat(4, 1fr); } }
.kp-num { padding: 20px 20px 18px; border: 1px solid var(--line); border-radius: 16px;
  background: var(--surface); }
.kp-num-v { font-size: clamp(24px, 2.6vw, 30px); font-weight: 800; letter-spacing: -0.03em;
  color: var(--lime-bright); font-variant-numeric: tabular-nums; }
.kp-num-l { margin-top: 6px; font-size: 13.5px; line-height: 1.45; color: var(--muted); }

.kp-body { max-width: 68ch; }
.kp-body p { font-size: 16.5px; line-height: 1.7; color: var(--muted); margin: 0 0 18px; }

/* Шаги нумерованы и связаны линией: в кейсе важен не только состав работ,
   но и порядок — сначала разобрались, потом чинили, потом масштабировали. */
.kp-steps { list-style: none; margin: 0; padding: 0; counter-reset: kp; max-width: 74ch; }
.kp-steps li { position: relative; counter-increment: kp;
  padding: 0 0 26px 54px; font-size: 16px; line-height: 1.65; color: var(--ink); }
.kp-steps li::before { content: counter(kp, decimal-leading-zero);
  position: absolute; left: 0; top: -1px;
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12.5px; font-weight: 800; letter-spacing: .02em;
  color: var(--lime-ink); background: var(--lime); }
.kp-steps li:not(:last-child)::after { content: ''; position: absolute;
  left: 17px; top: 38px; bottom: 8px; width: 1px; background: var(--line-2); }
.kp-steps li:last-child { padding-bottom: 0; }

.kp-out { margin-top: 30px; padding: 24px 26px; border-radius: 18px;
  border: 1px solid rgba(182,240,30,0.28);
  background: linear-gradient(165deg, rgba(182,240,30,0.07), var(--surface));
  font-size: 16.5px; line-height: 1.65; max-width: 74ch; }
.kp-out b { display: block; margin-bottom: 8px; font-size: 12.5px; letter-spacing: .08em;
  text-transform: uppercase; color: var(--lime-bright); }

.kp-rel { display: grid; gap: 14px; }
@media (min-width: 760px) { .kp-rel { grid-template-columns: 1fr 1fr; } }
.kp-rel-i { display: block; padding: 24px; border: 1px solid var(--line); border-radius: 18px;
  background: var(--surface); text-decoration: none; color: inherit;
  transition: border-color .2s cubic-bezier(.32,.72,0,1), transform .2s cubic-bezier(.32,.72,0,1); }
.kp-rel-i:hover { border-color: var(--line-2); transform: translateY(-2px); }
.kp-rel-f { font-size: 11.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
  color: var(--lime-bright); margin-bottom: 8px; }
.kp-rel-t { font-size: 19px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.3; }
.kp-rel-m { margin-top: 12px; font-size: 14px; color: var(--muted); }
.kp-all { margin: 26px 0 0; text-align: center; }
`;

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

    const body = `<header class="section kp-hero">
  <div class="wrap">
    ${crumbs}
    <div class="kp-eyebrow">Кейс · ${c.field}</div>
    <h1>${c.h1}</h1>
    <p class="kp-lead">${c.lead}</p>
    <div class="kp-meta">
      <span class="kp-meta-i">Ниша: <b>${c.field}</b></span>
      <span class="kp-meta-i">География: <b>${c.geo}</b></span>
      ${chips(c.services)}
    </div>
    <div class="kp-nums stagger">
${nums}
    </div>
  </div>
</header>

<section class="section-sm">
  <div class="wrap">
    <div class="section-head reveal"><h2>Задача</h2></div>
    <div class="kp-body reveal"><p>${c.task}</p></div>
  </div>
</section>

<section class="section-sm">
  <div class="wrap">
    <div class="section-head reveal"><h2>Что я сделал</h2></div>
    <ol class="kp-steps reveal">
${steps}
    </ol>
    <div class="kp-out reveal">
      <b>Что это дало</b>
      ${c.outcome}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Похожие задачи</div>
      <h2>Кейсы рядом</h2>
    </div>
    <div class="kp-rel stagger">
${c.related.map(relCard).join('\n')}
    </div>
    <p class="kp-all reveal"><a class="btn btn-ghost" href="/keysy/">Все кейсы <span class="arr">→</span></a></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Ваша очередь</div>
      <h2>Похожая задача?</h2>
      <p class="lead">Посмотрю, что у вас сейчас в рекламе и аналитике, и скажу, где теряются деньги. Разбор бесплатный, дальше решаете сами.</p>
    </div>
    <p class="kp-all reveal">
      <a class="btn btn-lime" href="/contacts/" data-lead-modal>Обсудить задачу <span class="arr">→</span></a>
    </p>
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
