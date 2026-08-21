/* service-kit.mjs — общий каркас страниц услуг.

   Зачем появился. Первые версии новых страниц услуг начинались с образного
   заголовка («Поиск отдаёт не сразу»), а правая половина первого экрана
   пустовала. Читается красиво, работает плохо: в h1 нет запроса, по
   которому страницу ищут, нет ни одной цифры, и вся страница — колонка
   текста слева. Отсюда ощущение шаблона.

   Здесь собрано то, что должно быть одинаковым на всех страницах услуг:

     — первый экран: запрос в h1, УТП отдельной строкой, цифры и макет
       интерфейса справа;
     — макеты рекламных систем: поисковая выдача, кабинет Директа, отчёт
       сквозной аналитики, карточка в ленте Дзена. Всё нарисовано на CSS,
       а не снято скриншотом: чужие интерфейсы меняются, скриншот стареет
       за полгода и начинает врать, а нарисованный макет остаётся точным
       ровно в том, что он иллюстрирует, и не тянет за собой чужие
       товарные знаки;
     — блок смежных услуг: он же решает задачу перелинковки. Проверка
       показала, что новые страницы получали одну-две ссылки из текста
       против двадцати у страницы контекста — поисковик считает такие
       страницы второстепенными.
*/

/* ── Стили ────────────────────────────────────────────────────────────── */

export const SVC_CSS = `
/* ── Первый экран ────────────────────────────────────────────────────────
   Две колонки: слева смысл, справа макет. На узком экране макет уходит
   вниз, а не сжимается: интерфейс шириной в 320px нечитаем и превращается
   в декоративное пятно. */
.svc-hero { display: grid; gap: 44px; align-items: center; }
@media (min-width: 1080px) {
  .svc-hero { grid-template-columns: minmax(0, 1fr) minmax(0, 44%); gap: 56px; }
}
.svc-hero .lead { max-width: 560px; }

/* h1 держит поисковый запрос, поэтому набирается плотно и не разъезжается
   на три строки: длинный заголовок в две строки читается как заголовок,
   в четыре — как абзац. */
.svc-hero h1 { font-size: clamp(32px, 4.4vw, 58px); line-height: 1.04; letter-spacing: -0.03em; margin: 0; }

/* УТП — отдельная строка между заголовком и лидом. Не курсив и не серый:
   это второе по важности предложение на странице после h1. */
.svc-utp {
  margin: 20px 0 0; max-width: 620px;
  font-size: clamp(18px, 1.7vw, 22px); line-height: 1.45; font-weight: 600;
  color: var(--txt); letter-spacing: -0.01em;
}
.svc-utp b { color: var(--accent-bright); font-weight: 600; }

/* ── Цифры под первым экраном ────────────────────────────────────────────
   Не карточки: рамка вокруг числа превращает факт в плашку. Разделены
   тонкими линиями — так это читается как строка показателей. */
.svc-facts { display: grid; gap: 1px; margin-top: 40px; background: var(--line); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
@media (min-width: 620px) { .svc-facts { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.svc-fact { background: var(--pg, #08080a); padding: 20px 22px 20px 0; }
@media (min-width: 620px) { .svc-fact { padding-left: 22px; } .svc-fact:first-child { padding-left: 0; } }
.svc-fact-v {
  font-family: var(--font-display, inherit);
  font-size: clamp(24px, 2.6vw, 31px); font-weight: 700; letter-spacing: -0.02em;
  color: var(--txt); line-height: 1.1; white-space: nowrap;
}
.svc-fact-v span { color: var(--accent-bright); }
.svc-fact-l { margin-top: 7px; font-size: 13.5px; line-height: 1.4; color: var(--txt-3); max-width: 22ch; }

/* ── Общая рамка макета ──────────────────────────────────────────────────
   Все макеты живут в одной оболочке: шапка с адресом и светлое или тёмное
   поле внутри. Без рамки чужой интерфейс на тёмной странице читается как
   сбой вёрстки, а не как «вот так это выглядит». */
.mock { border-radius: 16px; overflow: clip; border: 1px solid var(--line-strong, rgba(255,255,255,.14));
  background: #111115; box-shadow: 0 30px 90px rgba(0,0,0,.65); }
.mock-bar { display: flex; align-items: center; gap: 9px; padding: 10px 13px; background: #1a1a1e; border-bottom: 1px solid var(--line); }
.mock-dots { display: flex; gap: 5px; flex: none; }
.mock-dots i { width: 9px; height: 9px; border-radius: 50%; display: block; }
.mock-dots i:nth-child(1) { background: #ff5f57; }
.mock-dots i:nth-child(2) { background: #febc2e; }
.mock-dots i:nth-child(3) { background: #28c840; }
.mock-url {
  flex: 1; min-width: 0; padding: 4px 11px; border-radius: 6px;
  background: rgba(255,255,255,.06); font-size: 11.5px; color: var(--txt-3);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mock-cap { margin: 13px 2px 0; font-size: 13px; line-height: 1.5; color: var(--txt-3); }

/* ── Макет: поисковая выдача ─────────────────────────────────────────── */
.mk-serp { background: #f6f6f7; padding: 15px 16px 18px; }
.mk-q { display: flex; align-items: center; gap: 9px; padding: 8px 13px; border-radius: 999px; background: #fff; border: 1px solid #dcdce0; }
.mk-q-t { font-size: 13px; color: #21201f; }
.mk-q-go { margin-left: auto; font-size: 11.5px; color: #6b6b70; }
.mk-res { margin-top: 13px; display: flex; flex-direction: column; gap: 13px; }
.mk-item { position: relative; padding-left: 0; }
.mk-item-tag { display: inline-block; margin-bottom: 4px; padding: 1px 6px; border-radius: 4px; font-size: 9.5px; font-weight: 700; letter-spacing: .04em; background: #ffe4a0; color: #6b4a00; }
.mk-item-t { font-size: 13.5px; line-height: 1.3; color: #2b47b3; font-weight: 500; }
.mk-item-u { margin-top: 3px; font-size: 11px; color: #3a7d3a; }
.mk-item-d { margin-top: 4px; font-size: 11.5px; line-height: 1.45; color: #4d4d52; }
.mk-item.on { padding: 10px 12px; margin: 0 -12px; border-radius: 10px; background: #eaf6d8; box-shadow: inset 2px 0 0 #7cb518; }
.mk-pos { position: absolute; right: 10px; top: 10px; font-size: 10px; font-weight: 700; color: #4a7a11; }

/* ── Макет: кабинет рекламной системы ───────────────────────────────── */
.mk-cab { padding: 14px 15px 17px; background: #16161a; }
.mk-row { display: grid; grid-template-columns: minmax(0,1fr) auto auto; gap: 10px; align-items: center;
  padding: 10px 12px; border-radius: 9px; background: rgba(255,255,255,.03); border: 1px solid var(--line); }
.mk-row + .mk-row { margin-top: 7px; }
.mk-row-n { font-size: 12.5px; color: var(--txt-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mk-row-v { font-size: 12.5px; font-variant-numeric: tabular-nums; color: var(--txt-3); white-space: nowrap; }
.mk-flag { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; white-space: nowrap; }
.mk-flag.bad { background: rgba(255,90,77,.14); color: #ff8a80; }
.mk-flag.ok { background: var(--accent-soft, rgba(182,240,30,.13)); color: var(--accent-bright); }
.mk-row.alert { border-color: rgba(255,90,77,.32); background: rgba(255,90,77,.05); }
.mk-head { display: flex; gap: 8px; margin-bottom: 11px; }
.mk-tab { font-size: 11px; padding: 4px 10px; border-radius: 999px; color: var(--txt-3); border: 1px solid var(--line); }
.mk-tab.on { color: var(--accent-bright); border-color: var(--accent-soft-bd, rgba(182,240,30,.3)); }

/* ── Макет: отчёт аналитики ─────────────────────────────────────────── */
.mk-rep { padding: 15px 16px 18px; background: #16161a; }
.mk-rep-head { display: grid; grid-template-columns: minmax(0,1.4fr) repeat(3, minmax(0,1fr)); gap: 8px;
  padding-bottom: 9px; border-bottom: 1px solid var(--line); font-size: 10.5px; letter-spacing: .04em;
  text-transform: uppercase; color: var(--txt-3); }
.mk-rep-row { display: grid; grid-template-columns: minmax(0,1.4fr) repeat(3, minmax(0,1fr)); gap: 8px;
  padding: 11px 0; border-bottom: 1px solid var(--line); font-size: 12.5px; align-items: center; }
.mk-rep-row:last-child { border-bottom: 0; }
.mk-rep-src { color: var(--txt-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mk-rep-n { font-variant-numeric: tabular-nums; color: var(--txt-3); }
.mk-rep-n.win { color: var(--accent-bright); font-weight: 700; }
.mk-rep-n.lose { color: #ff8a80; }

/* ── Макет: карточка в ленте ────────────────────────────────────────── */
.mk-feed { padding: 14px; background: #16161a; display: flex; flex-direction: column; gap: 11px; }
.mk-card { border-radius: 12px; overflow: clip; border: 1px solid var(--line); background: rgba(255,255,255,.03); }
.mk-card-img { height: 84px; background: linear-gradient(120deg, rgba(182,240,30,.16), rgba(182,240,30,.03) 60%, transparent), #1d1d22; }
.mk-card-b { padding: 11px 13px 13px; }
.mk-card-t { font-size: 13px; font-weight: 700; line-height: 1.3; color: var(--txt); }
.mk-card-m { margin-top: 7px; display: flex; gap: 10px; font-size: 10.5px; color: var(--txt-3); }
.mk-card.on { border-color: var(--accent-soft-bd, rgba(182,240,30,.3)); }

/* ── Смежные услуги ─────────────────────────────────────────────────────
   Не «читайте также» списком внизу, а полноценный блок: он и навигация,
   и перелинковка. Проверка ссылочного графа показала, что без него новые
   страницы получали по одной входящей ссылке из текста. */
.svc-rel { display: grid; gap: 1px; margin-top: 34px; background: var(--line);
  border: 1px solid var(--line); border-radius: 20px; overflow: clip; }
@media (min-width: 760px) { .svc-rel { grid-template-columns: repeat(3, 1fr); } }
.svc-rel-i {
  display: block; padding: 26px 26px 24px; background: var(--surface);
  color: inherit; text-decoration: none;
  transition: background .4s cubic-bezier(.32,.72,0,1);
}
.svc-rel-i:hover { background: rgba(255,255,255,.035); }
.svc-rel-t { display: flex; align-items: baseline; gap: 9px; font-size: 18px; font-weight: 700; color: var(--txt); }
.svc-rel-t .arr { color: var(--accent-bright); transition: transform .4s cubic-bezier(.32,.72,0,1); }
.svc-rel-i:hover .arr { transform: translateX(4px); }
.svc-rel-d { margin: 10px 0 0; font-size: 14.5px; line-height: 1.55; color: var(--txt-3); }
.svc-rel-p { margin-top: 12px; font-size: 13px; color: var(--accent-bright); font-variant-numeric: tabular-nums; }

/* ── Телефон ─────────────────────────────────────────────────────────────
   Макеты интерфейсов рассчитаны на колонку в 400–500px. На экране в 390px
   те же четыре столбца отчёта сжимались до шестидесяти пикселей каждый, и
   «+312 000 ₽» разрывалось на две строки посреди числа. Здесь макет
   переразмечается под узкую колонку, а не масштабируется целиком:
   уменьшенный до нечитаемости интерфейс — это уже картинка, а не пример. */
@media (max-width: 620px) {
  .mock { border-radius: 14px; }
  .mock-cap { font-size: 12.5px; }

  /* Отчёт: расход убираем совсем. Из четырёх столбцов на узком экране
     осмысленны три — источник, сделки и прибыль; расход при этом остаётся
     в подписи под макетом, если он важен для примера. */
  .mk-rep { padding: 13px 13px 15px; }
  .mk-rep-head, .mk-rep-row {
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.6fr) minmax(0, 1fr);
    gap: 7px;
  }
  .mk-rep-head span:nth-child(2), .mk-rep-row span:nth-child(2) { display: none; }
  .mk-rep-row { font-size: 12px; padding: 10px 0; }
  .mk-rep-n { white-space: nowrap; }
  .mk-rep-src { white-space: normal; }

  /* Кабинет: название кампании переносится, а не обрезается многоточием —
     «Поиск · Общие запр…» не говорит ничего. */
  .mk-row { grid-template-columns: minmax(0, 1fr) auto; row-gap: 6px; padding: 9px 11px; }
  .mk-row-n { white-space: normal; overflow: visible; }
  .mk-flag { grid-column: 1 / -1; justify-self: start; font-size: 11px; }
  .mk-tab { font-size: 11.5px; }

  /* Выдача: подпись позиции не наезжает на заголовок. */
  .mk-item.on { padding: 9px 10px; margin: 0 -10px; }
  .mk-pos { position: static; display: block; margin-bottom: 3px; }
}
`;

/* ── Разметка ─────────────────────────────────────────────────────────── */

export function facts(list) {
  return list.map(([v, l]) => `        <div class="svc-fact">
          <div class="svc-fact-v">${v}</div>
          <div class="svc-fact-l">${l}</div>
        </div>`).join('\n');
}

/* Первый экран. h1 обязан содержать запрос — это единственное жёсткое
   правило: остальное можно менять от страницы к странице. */
export function hero({ label, crumbs, eyebrow, h1, utp, lead, ctas, factList, visual }) {
  return `<header class="hero" data-screen-label="${label}">
  <div class="wrap">
    ${crumbs}
    <div class="svc-hero">
      <div>
        <div class="eyebrow reveal">${eyebrow}</div>
        <h1 class="reveal">${h1}</h1>
        <p class="svc-utp reveal">${utp}</p>
        <p class="lead reveal">${lead}</p>
        <div class="btn-row reveal">
${ctas}
        </div>
      </div>
      <div class="reveal" aria-hidden="true">
${visual}
      </div>
    </div>
    <div class="svc-facts reveal">
${facts(factList)}
    </div>
  </div>
</header>`;
}

const barDots = '<span class="mock-dots"><i></i><i></i><i></i></span>';

/* ── Макет: поисковая выдача ──────────────────────────────────────────── */
export function mockSerp({ query, items, cap }) {
  const rows = items.map((it) => `        <div class="mk-item${it.on ? ' on' : ''}">
${it.ad ? '          <span class="mk-item-tag">Реклама</span>\n' : ''}          <div class="mk-item-t">${it.title}</div>
          <div class="mk-item-u">${it.url}</div>
          <div class="mk-item-d">${it.desc}</div>
${it.pos ? `          <span class="mk-pos">${it.pos}</span>\n` : ''}        </div>`).join('\n');

  return `        <div class="mock">
          <div class="mock-bar">${barDots}<span class="mock-url">yandex.ru/search</span></div>
          <div class="mk-serp">
            <div class="mk-q"><span class="mk-q-t">${query}</span><span class="mk-q-go">Найти</span></div>
            <div class="mk-res">
${rows}
            </div>
          </div>
        </div>
${cap ? `        <p class="mock-cap">${cap}</p>` : ''}`;
}

/* ── Макет: кабинет рекламной системы ─────────────────────────────────── */
export function mockCabinet({ url, tabs, rows, cap }) {
  const tabsHtml = tabs.map((t, i) => `<span class="mk-tab${i === 0 ? ' on' : ''}">${t}</span>`).join('');
  const rowsHtml = rows.map((r) => `            <div class="mk-row${r.alert ? ' alert' : ''}">
              <span class="mk-row-n">${r.name}</span>
              <span class="mk-row-v">${r.value}</span>
              <span class="mk-flag ${r.bad ? 'bad' : 'ok'}">${r.flag}</span>
            </div>`).join('\n');

  return `        <div class="mock">
          <div class="mock-bar">${barDots}<span class="mock-url">${url}</span></div>
          <div class="mk-cab">
            <div class="mk-head">${tabsHtml}</div>
${rowsHtml}
          </div>
        </div>
${cap ? `        <p class="mock-cap">${cap}</p>` : ''}`;
}

/* ── Макет: отчёт по источникам ───────────────────────────────────────── */
export function mockReport({ url, head, rows, cap }) {
  const headHtml = head.map((h) => `<span>${h}</span>`).join('');
  const rowsHtml = rows.map((r) => `            <div class="mk-rep-row">
              <span class="mk-rep-src">${r[0]}</span>
              <span class="mk-rep-n">${r[1]}</span>
              <span class="mk-rep-n">${r[2]}</span>
              <span class="mk-rep-n ${r[4] || ''}">${r[3]}</span>
            </div>`).join('\n');

  return `        <div class="mock">
          <div class="mock-bar">${barDots}<span class="mock-url">${url}</span></div>
          <div class="mk-rep">
            <div class="mk-rep-head">${headHtml}</div>
${rowsHtml}
          </div>
        </div>
${cap ? `        <p class="mock-cap">${cap}</p>` : ''}`;
}

/* ── Макет: лента с карточками статей ─────────────────────────────────── */
export function mockFeed({ url, cards, cap }) {
  const cardsHtml = cards.map((c) => `            <div class="mk-card${c.on ? ' on' : ''}">
              <div class="mk-card-img"></div>
              <div class="mk-card-b">
                <div class="mk-card-t">${c.title}</div>
                <div class="mk-card-m">${c.meta.map((m) => `<span>${m}</span>`).join('')}</div>
              </div>
            </div>`).join('\n');

  return `        <div class="mock">
          <div class="mock-bar">${barDots}<span class="mock-url">${url}</span></div>
          <div class="mk-feed">
${cardsHtml}
          </div>
        </div>
${cap ? `        <p class="mock-cap">${cap}</p>` : ''}`;
}

/* ── Смежные услуги ───────────────────────────────────────────────────── */

/* Один список на все страницы: цена и описание в нём должны совпадать с
   /ceny/, поэтому меняются здесь, а не в каждой странице отдельно. */
const ALL = [
  ['/kompleksnyj-marketing/', 'Маркетинг под ключ', 'Трафик, посадочная и аналитика в одних руках, одна точка ответственности.', 'от 65 000 ₽/мес'],
  ['/kontekstnaya-reklama/', 'Контекстная реклама', 'Яндекс Директ: поиск, РСЯ, ретаргетинг. Забирает спрос, который уже есть.', 'от 30 000 ₽/мес'],
  ['/targetirovannaya-reklama/', 'Таргетированная реклама', 'VK Ads и Telegram Ads там, где аудитория не ищет, но проводит время.', 'от 20 000 ₽/мес'],
  ['/geo-servisy/', 'GEO-сервисы', 'Карты и справочники: для локального бизнеса клиент оттуда дешевле.', 'от 20 000 ₽/мес'],
  ['/razrabotka-sajtov/', 'Разработка сайтов', 'Посадочная под рекламный запрос, а не «чтобы было красиво».', 'от 60 000 ₽'],
  ['/razrabotka-botov/', 'Разработка ботов', 'Telegram и MAX: заявки, запись и типовые вопросы без участия менеджера.', 'по объёму работ'],
  ['/seo-optimizaciya/', 'SEO-оптимизация', 'Техническая база, структура под спрос и тексты. Отдаёт не сразу, зато надолго.', 'по объёму работ'],
  ['/promostranicy/', 'Промостраницы Яндекса', 'Статья вместо объявления, оплата за дочитывание. Для сложных продуктов.', 'по объёму работ'],
  ['/skvoznaya-analitika/', 'Сквозная аналитика', 'Связка рекламы, звонков и CRM: видно деньги, а не клики.', 'от 12 000 ₽/мес'],
  ['/audit-reklamy/', 'Аудит рекламы', 'Разбор действующих кампаний: где утекает бюджет и что чинить первым.', 'экспресс — бесплатно'],
];

const ARR = '<span class="arr" aria-hidden="true">→</span>';

export function related(currentPath, picks) {
  const items = picks.map((href) => {
    const row = ALL.find(([h]) => h === href);
    if (!row) throw new Error(`service-kit: нет услуги с адресом ${href}`);
    const [h, name, desc, price] = row;
    if (h === currentPath) throw new Error(`service-kit: страница ссылается сама на себя — ${h}`);
    return `      <a class="svc-rel-i" href="${h}">
        <span class="svc-rel-t">${name} ${ARR}</span>
        <p class="svc-rel-d">${desc}</p>
        <div class="svc-rel-p">${price}</div>
      </a>`;
  }).join('\n');

  return `<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Смежные услуги</div>
      <h2>Что ещё закрываю сам</h2>
      <p class="lead">Работаю не по одному каналу, поэтому связка собирается целиком — без второго подрядчика и без стыков, на которых теряется результат.</p>
    </div>
    <div class="svc-rel reveal">
${items}
    </div>
  </div>
</section>`;
}

/* ── Доказательства на странице услуги ────────────────────────────────────

   Страницы услуг обещали результат и ничем его не подкрепляли: кейсы жили
   только на витрине и на странице контекста, где стояли все двадцать два
   разом. Здесь — короткая выжимка: три проекта, где эта услуга была
   основной, с цифрами и без имён клиентов.

   Три, а не шесть и не двадцать два. Блок стоит внутри страницы услуги, а не
   вместо неё: его задача — снять недоверие к соседним абзацам, а не заменить
   собой портфолио. За остальными есть ссылка.

   Данные берутся из cases-data.mjs, то есть из того же источника, что и
   витрина. Разметка тут не хранится: подберёшь другой кейс — поменяются и
   цифры, и ниша, и услуги, без ручной правки в пяти файлах. */
import { CASES } from './cases-data.mjs';

function caseCard(id) {
  const c = CASES.find((x) => x.id === id);
  if (!c) throw new Error(`service-kit: нет кейса с id ${id}`);
  /* Три метрики, а не все: у части кейсов их четыре, и четвёртая почти всегда
     самая слабая — её ставили, чтобы добить сетку. */
  const metrics = c.metrics.slice(0, 3).map(([v, l]) =>
    `          <div class="pcase-m"><div class="pcase-mv">${v}</div><div class="pcase-ml">${l}</div></div>`).join('\n');
  const chips = c.services.map((s) => `<span class="kase-chip">${s}</span>`).join('');
  return `      <article class="pcase">
        <div class="pcase-top">
          <div class="pcase-field">${c.field}</div>
          <h3 class="pcase-name">${c.label}</h3>
          <div class="pcase-geo">${c.geo}</div>
        </div>
        <div class="pcase-metrics">
${metrics}
        </div>
        <div class="kase-chips pcase-chips">${chips}</div>
      </article>`;
}

export function cases({ eyebrow = 'Доказательства', h2, lead, picks }) {
  if (picks.length !== 3) throw new Error('service-kit: в блок кейсов берём ровно три');
  return `<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">${eyebrow}</div>
      <h2>${h2}</h2>
      <p class="lead">${lead}</p>
    </div>
    <div class="pcase-grid stagger">
${picks.map(caseCard).join('\n')}
    </div>
    <p class="pcase-all reveal"><a class="btn btn-ghost" href="/keysy/">Все {{CASES_N}} ${ARR}</a></p>
  </div>
</section>`;
}

/* Подборки под конкретные страницы. Лежат здесь, а не в самих страницах,
   чтобы статические страницы (таргет, разработка, GEO) могли получить тот же
   блок на сборке — у них нет доступа к модулям, только подстановка по
   маркеру. Ключ маркера — ключ этого объекта. */
export const CASE_SETS = {
  geo: {
    h2: 'Кейсы по картам и справочникам',
    lead: 'Три проекта, где карточка в Яндекс Бизнесе стала отдельным каналом заявок. Названия убраны, цифры — из отчётов.',
    picks: ['berezka', 'ipapa', 'bmclinic'],
  },
  analytics: {
    h2: 'Что показала аналитика',
    lead: 'Три проекта, где связка рекламы, звонков и заявок изменила решения по бюджету. Названия убраны, цифры — из отчётов.',
    picks: ['stroypro', 'everest', 'zojefina'],
  },
  kompleks: {
    h2: 'Проекты, которые вёл целиком',
    lead: 'Три проекта, где на мне были сразу сайт, реклама, карты и аналитика. Названия убраны, цифры — из отчётов.',
    picks: ['school', 'artlife', 'royalneva'],
  },
};
