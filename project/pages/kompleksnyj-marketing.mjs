/* /kompleksnyj-marketing/ — маркетинг под ключ.

   Зачем страница. Это главное позиционирование владельца — «продаю не
   настройку рекламы, а связку трафик — посадочная — аналитика с одной
   ответственностью», — и до сих пор оно жило только фразой в шапке главной.
   По запросам «комплексный интернет-маркетинг», «маркетинг под ключ»,
   «интернет-маркетолог на аутсорсе» сайту нечего было показать: посетитель
   попадал на страницу контекста и видел одну услугу из трёх.

   Смысловое ядро страницы — не перечень услуг (он есть в прайсе), а разбор
   того, почему разделение подрядчиков ломает результат. Отсюда центральный
   блок «круг взаимных обвинений»: он объясняет проблему быстрее любого
   абзаца и его нельзя переписать с чужого сайта.

   Цены сверены с project/pages/ceny.mjs и content.json. Меняются втроём.
*/
import { SITE, breadcrumbs, faqItems } from '../layout.mjs';

export const meta = {
  path: '/kompleksnyj-marketing/',
  title: 'Комплексный интернет-маркетинг под ключ — трафик, сайт, аналитика | Даниил Карацапов',
  description: 'Веду интернет-маркетинг целиком: реклама, посадочная страница и сквозная аналитика в одних руках. Один ответственный вместо трёх подрядчиков, которые кивают друг на друга. От 90 000 ₽ в месяц.',
  ogImage: '/assets/og/uslugi.jpg',
};

/* Три звена связки. Порядок неслучаен: это путь клиента, а не список услуг
   по алфавиту, — и он же порядок, в котором связка ломается. */
const LAYERS = [
  {
    n: '01',
    name: 'Трафик',
    sub: 'Яндекс Директ, VK Ads, Telegram Ads, GEO-сервисы',
    lead: 'Человек с деньгами и намерением должен вас увидеть — и не переплатить за это.',
    works: [
      'Разбор спроса: что и как реально ищут в вашей нише',
      'Семантика и минус-слова — без них впустую уходит до двух третей бюджета',
      'Поиск, РСЯ, ретаргетинг, карты и справочники — по тому, где ваш клиент',
      'Еженедельная оптимизация ставок и площадок',
    ],
    href: '/kontekstnaya-reklama/',
  },
  {
    n: '02',
    name: 'Посадочная',
    sub: 'Лендинг, корпоративный сайт, доработка существующего',
    lead: 'Клик стоит денег. Страница либо превращает его в заявку, либо сжигает.',
    works: [
      'Проектирование под конкретный рекламный запрос, а не «чтобы красиво»',
      'Оффер, структура возражений, форма в один экран',
      'Скорость и мобильная вёрстка — от них зависит и конверсия, и цена клика',
      'Правки по данным, а не по вкусу: смотрим Вебвизор и карту скроллов',
    ],
    href: '/razrabotka-sajtov/',
  },
  {
    n: '03',
    name: 'Аналитика',
    sub: 'Яндекс Метрика, коллтрекинг, Roistat, CRM',
    lead: 'Пока не видно, какая кампания принесла деньги, оптимизация — это гадание.',
    works: [
      'Цели в Метрике по реальным действиям, а не по «клику на кнопку»',
      'Коллтрекинг: звонок — это тоже заявка, и у неё есть источник',
      'Связка с CRM: доход по каждому источнику, а не по каждому клику',
      'Один отчёт в неделю, который читается за пять минут',
    ],
    href: '/kontekstnaya-reklama/',
  },
];

/* Круг взаимных обвинений. Это не выдумка ради красоты: три реплики взяты
   из переписок, которыми чаще всего заканчивается работа с раздельными
   подрядчиками. Порядок замкнут — в этом вся суть блока. */
const BLAME = [
  { who: 'Директолог', says: 'Трафик целевой, кликов достаточно. Заявок нет — значит, сайт не продаёт.' },
  { who: 'Разработчик', says: 'Сайт работает, конверсия в норме. Значит, к нам идёт не та аудитория.' },
  { who: 'Аналитик', says: 'Цели настроены, данные собираются. Что с ними делать — решают те двое.' },
];

const STAGES = [
  ['Разбор, 3–5 дней',
    'Смотрю нишу, спрос, конкурентов и то, что уже сделано до меня. На выходе — не презентация, а список того, что даёт результат быстрее всего, и честная оценка, где мы упрёмся.'],
  ['Запуск, 1–2 недели',
    'Собираю связку целиком: кампании, посадочная под них, аналитика, которая всё это считает. Кабинеты оформляются на вас — бюджет вносите напрямую в площадку.'],
  ['Обучение, 1–2 месяца',
    'Автостратегиям нужно 10+ конверсий в неделю, чтобы выйти из обучения. В этот период цена лида скачет, и это нормально. Здесь важно не дёргать настройки, а копить данные.'],
  ['Ведение',
    'Дальше — работа по цифрам: перераспределение бюджета между каналами, правки на посадочной, отсечение того, что не окупается. Раз в неделю отчёт, раз в месяц разбор по деньгам.'],
];

const NOT_FOR = [
  'Нужна только настройка рекламы, а сайт и аналитику трогать нельзя. Тогда это отдельная услуга, и она дешевле.',
  'Рекламный бюджет ниже 50 000 ₽ в месяц. Данных для оптимизации не наберётся, автостратегии не выйдут из обучения — комплекс не окупится.',
  'Товар или услуга, которую не ищут. Реклама забирает существующий спрос, а не создаёт его с нуля.',
  'Нет ресурса обрабатывать заявки. Если на звонок отвечают через день, узкое место не в маркетинге.',
];

const FAQ = [
  ['Сколько стоит комплексный маркетинг?',
    'От 90 000 ₽ в месяц. Итоговая цифра зависит от числа каналов, объёма работ по сайту и того, нужна ли разработка с нуля. Это фиксированная стоимость работы, не процент от бюджета: процент создаёт у подрядчика стимул раздувать расход. Разовая плата за запуск обсуждается отдельно и зависит от объёма — подробности <a href="/ceny/">на странице цен</a>.'],
  ['Входит ли рекламный бюджет в эту сумму?',
    'Нет. Бюджет вы вносите напрямую в кабинет площадки, кабинет оформляется на вас. Я не беру наценку на бюджет и не провожу его через себя — вы в любой момент видите, сколько реально потрачено.'],
  ['У меня уже есть сайт. Придётся делать новый?',
    'Не обязательно. Сначала смотрю, справляется ли существующий: скорость, мобильная версия, путь до заявки. Часто хватает доработки. Новый предлагаю тогда, когда переделка выходит дороже — и говорю об этом прямо, а не начинаю с продажи разработки.'],
  ['Через сколько будут заявки?',
    'Первые — на 1–3 день после запуска. Выход на стабильную цену лида — 1–2 месяца: столько нужно автостратегиям, чтобы обучиться. Кто обещает предсказуемую стоимость заявки с первой недели, либо не работал с автостратегиями, либо не собирается говорить правду.'],
  ['Чем это лучше агентства?',
    'Проекты веду лично — между вами и человеком, который открывает кабинет, нет менеджера. В агентстве часть смысла теряется по дороге, и ваш проект — один из тридцати у джуна. Обратная сторона честная: я беру ограниченное число проектов и не закрываю задачи, где нужна команда из десяти человек.'],
  ['Можно взять только часть?',
    'Да. Контекст, таргет, сайт, GEO-сервисы и аналитика продаются отдельно — цены <a href="/ceny/">в прайсе</a>. Комплекс имеет смысл, когда узкое место не в одном звене, а в стыках между ними.'],
];

const KM_CSS = `<style>
/* ── Схема связки в герое ────────────────────────────────────────────────
   Правая колонка первого экрана. Смысл ровно один: три звена стоят на общей
   вертикали, а скоба справа объединяет их в одну ответственность. Всё на
   CSS — ни картинки, ни SVG-файла: схема должна оставаться резкой на любом
   экране и переживать смену акцентного цвета.

   Пунктир между узлами рисуется фоном самой колонки, а не отдельными
   элементами: одна линия проще, чем три отрезка, которые надо стыковать. */
.chain { position: relative; display: flex; flex-direction: column; gap: 22px; padding: 8px 92px 8px 0; }
.chain::before {
  content: ''; position: absolute; left: 27px; top: 34px; bottom: 34px; width: 1px;
  background: repeating-linear-gradient(var(--line-strong, rgba(255,255,255,.16)) 0 4px, transparent 4px 9px);
}
.chain-node {
  position: relative; display: flex; align-items: center; gap: 16px;
  padding: 18px 22px; border-radius: 16px;
  background: var(--surface); border: 1px solid var(--line);
}
.chain-n {
  flex: none; width: 38px; height: 38px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--pg, #08080a); border: 1px solid var(--accent-soft-bd, rgba(182,240,30,.3));
  font-size: 12px; font-weight: 700; color: var(--accent-bright);
  font-variant-numeric: tabular-nums;
}
.chain-name { font-size: 19px; font-weight: 600; letter-spacing: -0.01em; color: var(--txt); }
/* Скоба: две горизонтальные засечки и вертикаль между ними, подпись развёрнута
   вдоль. Обычная фигурная скобка шрифтом на такой высоте выглядит сломанной. */
.chain-brace {
  position: absolute; right: 34px; top: 26px; bottom: 26px; width: 1px;
  background: var(--accent);
  opacity: .55;
}
.chain-brace::before, .chain-brace::after {
  content: ''; position: absolute; right: 0; width: 14px; height: 1px; background: var(--accent);
}
.chain-brace::before { top: 0; }
.chain-brace::after { bottom: 0; }
/* Подпись — сосед скобки, а не её потомок. Внутри скобки её фоном была бы
   сама лаймовая линия, и любая проверка контраста честно считала бы лаймовый
   текст на лаймовом фоне (1.07:1), хотя на экране подпись лежит на фоне
   страницы. Родство здесь только мешает. */
.chain-brace-lbl {
  position: absolute; right: 18px; top: 50%;
  transform: translateY(-50%) rotate(90deg);
  white-space: nowrap;
  font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: var(--accent-bright);
}
@media (max-width: 900px) {
  /* На узком экране схема повторяет то, что уже сказано текстом ниже, —
     показывать её второй раз значит гнать читателя мимо одного и того же. */
  .hero-visual { display: none; }
}

/* ── Связка: три слоя ────────────────────────────────────────────────────
   Не три равных карточки в ряд (самая узнаваемая шаблонная раскладка), а
   вертикальный стек с номером на полях — читается как путь клиента сверху
   вниз, а не как меню. */
.lay { display: flex; flex-direction: column; margin-top: 40px; }
.lay-item {
  display: grid; gap: 6px 28px; padding: 34px 0;
  grid-template-columns: 1fr;
  border-top: 1px solid var(--line);
}
.lay-item:last-child { border-bottom: 1px solid var(--line); }
@media (min-width: 900px) {
  .lay-item { grid-template-columns: 96px minmax(0, 340px) minmax(0, 1fr); align-items: start; }
}
.lay-n {
  font-size: 13px; font-weight: 700; letter-spacing: .16em;
  color: var(--accent-bright); font-variant-numeric: tabular-nums; padding-top: 6px;
}
.lay-name { font-size: clamp(24px, 3vw, 34px); font-weight: 700; letter-spacing: -0.02em; color: var(--txt); }
.lay-sub { margin-top: 8px; font-size: 13px; color: var(--txt-3); }
.lay-lead { margin-top: 10px; font-size: 16px; line-height: 1.6; color: var(--txt-2); }
.lay-works { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 11px; }
.lay-works li { position: relative; padding-left: 26px; font-size: 15px; line-height: 1.55; color: var(--txt-2); }
.lay-works li::before {
  content: ''; position: absolute; left: 4px; top: .62em;
  width: 8px; height: 8px; border-radius: 50%;
  border: 1.5px solid var(--accent);
}
/* Отдельно стоящая ссылка, а не часть предложения, — значит зона касания
   должна быть от 24px. Подчёркивание рисуем фоном, чтобы вертикальное поле
   не отодвигало линию от текста. */
.lay-more {
  display: inline-block; margin-top: 12px; padding: 4px 0;
  font-size: 14px; color: var(--accent-bright); text-decoration: none;
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0 1px; background-position: 0 calc(100% - 4px);
  background-repeat: no-repeat;
  transition: background-size .35s cubic-bezier(.16, .7, .3, 1);
}
.lay-more:hover { background-size: 100% 1px; }

/* ── Круг взаимных обвинений ─────────────────────────────────────────────
   Три реплики и замкнутая стрелка между ними. Ключевая деталь — стрелка
   от последней карточки уходит обратно к первой: разговор не заканчивается
   выводом, он зацикливается. Ровно это и происходит у клиента. */
/* Зазор между карточками задан с запасом: в нём живёт стрелка (26px), и ей
   нужно поместиться целиком, иначе она уезжает под соседнюю карточку. */
.blame { position: relative; margin-top: 38px; display: grid; gap: 40px; padding-bottom: 62px; }
@media (min-width: 940px) { .blame { grid-template-columns: repeat(3, 1fr); gap: 44px; } }
.blame-c {
  position: relative; padding: 26px 24px 24px;
  background: var(--surface); border: 1px solid var(--line); border-radius: 18px;
}
.blame-who {
  font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
  color: var(--txt-3); margin-bottom: 12px;
}
.blame-says { font-size: 16px; line-height: 1.6; color: var(--txt); }
.blame-says::before { content: '«'; color: var(--txt-3); }
.blame-says::after { content: '»'; color: var(--txt-3); }
/* Стрелка между карточками. На узком экране смотрит вниз, на широком — вправо. */
.blame-c::after {
  content: ''; position: absolute; z-index: 1;
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--pg, #08080a); border: 1px solid var(--line);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2382828a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14M13 6l6 6-6 6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: center;
  left: 50%; bottom: -33px; transform: translateX(-50%) rotate(90deg);
}
@media (min-width: 940px) {
  .blame-c::after { left: auto; right: -35px; bottom: auto; top: 50%; transform: translateY(-50%); }
}
/* У последней карточки своей стрелки нет: возврат к первой рисуется общей
   петлёй под всем рядом. Стрелка на краю ряда упиралась бы в границу
   контейнера и обрезалась. */
.blame-c:last-child::after { display: none; }

/* Петля возврата. Три стороны рамки без верхней — линия уходит вниз от
   последней карточки, идёт налево под рядом и поднимается к первой. Именно
   она превращает три реплики в круг: без неё это просто три мнения. */
.blame::after {
  content: ''; position: absolute; left: 30px; right: 30px; bottom: 20px; height: 30px;
  border: 1px solid var(--line-strong, rgba(255, 255, 255, .14));
  border-top: 0; border-radius: 0 0 16px 16px;
  pointer-events: none;
}
/* Наконечник на левом конце петли — она заканчивается у первой карточки. */
.blame::before {
  content: ''; position: absolute; left: 24px; bottom: 44px; z-index: 1;
  width: 13px; height: 13px;
  border-left: 1px solid var(--line-strong, rgba(255, 255, 255, .14));
  border-top: 1px solid var(--line-strong, rgba(255, 255, 255, .14));
  transform: rotate(45deg);
}
.blame-out {
  margin-top: 26px; padding: 24px 26px;
  border-left: 2px solid var(--accent);
  background: linear-gradient(90deg, rgba(182, 240, 30, .06), transparent 70%);
  font-size: 17px; line-height: 1.65; color: var(--txt);
}

/* ── Кому не подходит ────────────────────────────────────────────────────
   Обычный «минусовый» список, но без красного и без драматизации: это не
   предупреждение, а фильтр. Тон должен быть спокойный. */
.nofit { display: grid; gap: 1px; margin-top: 34px; background: var(--line);
  border: 1px solid var(--line); border-radius: 18px; overflow: clip; }
@media (min-width: 860px) { .nofit { grid-template-columns: 1fr 1fr; } }
.nofit-i {
  background: var(--surface); padding: 24px 26px;
  font-size: 15px; line-height: 1.6; color: var(--txt-2);
}
.nofit-i strong { display: block; color: var(--txt); font-weight: 600; }
</style>`;

export function render() {
  const crumbs = breadcrumbs([['/kompleksnyj-marketing/', 'Комплексный маркетинг']]);

  const layers = LAYERS.map((l) => `      <div class="lay-item reveal">
        <div class="lay-n">${l.n}</div>
        <div>
          <div class="lay-name">${l.name}</div>
          <div class="lay-sub">${l.sub}</div>
          <p class="lay-lead">${l.lead}</p>
          <a class="lay-more" href="${l.href}">Подробнее об услуге →</a>
        </div>
        <ul class="lay-works">
${l.works.map((w) => `          <li>${w}</li>`).join('\n')}
        </ul>
      </div>`).join('\n');

  const blame = BLAME.map((b) => `        <div class="blame-c">
          <div class="blame-who">${b.who}</div>
          <p class="blame-says">${b.says}</p>
        </div>`).join('\n');

  const stages = STAGES.map(([t, d], i) => `        <div class="tl-item reveal">
          <div class="tl-num">${i + 1}</div>
          <div class="tl-body">
            <div class="tl-title">${t}</div>
            <p class="tl-text">${d}</p>
          </div>
        </div>`).join('\n');

  const nofit = NOT_FOR.map((n) => {
    const [head, ...rest] = n.split('. ');
    return `        <div class="nofit-i"><strong>${head}.</strong>${rest.join('. ')}</div>`;
  }).join('\n');

  const body = `<header class="hero" data-screen-label="Комплексный маркетинг">
  <div class="wrap">
    ${crumbs.visible}
    <div class="hero-grid">
      <div>
        <div class="eyebrow reveal">Маркетинг под ключ</div>
        <h1 class="reveal">Трафик, сайт и аналитика — <span class="accent">в одних руках</span></h1>
        <p class="lead reveal">Разделённый маркетинг ломается на стыках: реклама ведёт на страницу, которую делал не тот, кто её продаёт, а данные собирает третий. Я закрываю всю цепочку целиком, поэтому за результат отвечает один человек — и спорить не с кем.</p>
        <div class="btn-row reveal">
          <a class="btn btn-fill btn-lg" href="/contacts/">Обсудить проект</a>
          <a class="btn btn-ghost btn-lg" href="/keysy/">Посмотреть кейсы</a>
        </div>
        <div class="hero-stats reveal">
          <div class="stat"><div class="num">от 90 000 <span class="accent">₽</span></div><div class="lbl">в месяц, фиксированно</div></div>
          <div class="stat"><div class="num">70+ ниш</div><div class="lbl">с измеримым результатом</div></div>
          <div class="stat"><div class="num">с 2019</div><div class="lbl">в digital, три агентства до этого</div></div>
        </div>
      </div>
      <div class="hero-visual reveal" aria-hidden="true">
        <div class="chain">
${LAYERS.map((l) => `          <div class="chain-node">
            <span class="chain-n">${l.n}</span>
            <span class="chain-name">${l.name}</span>
          </div>`).join('\n')}
          <div class="chain-brace"></div>
          <div class="chain-brace-lbl">одна ответственность</div>
        </div>
      </div>
    </div>
  </div>
</header>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Почему не по частям</div>
      <h2>Круг, из которого не выйти</h2>
      <p class="lead">Когда рекламу, сайт и аналитику ведут разные подрядчики, каждый из них прав по-своему — и именно поэтому ничего не двигается.</p>
    </div>
    <div class="blame reveal">
${blame}
    </div>
    <p class="blame-out reveal">Каждый отвечает за свой участок и ни один — за деньги на выходе. Заказчик остаётся единственным, кто видит картину целиком, но у него нет ни времени, ни инструментов, чтобы её разобрать. Связка в одних руках убирает не работу — она убирает этот круг.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Что входит</div>
      <h2>Три звена одной цепочки</h2>
      <p class="lead">Порядок не случайный: это путь клиента от первого показа до денег в кассе. Рвётся связка всегда на стыке, а не внутри звена.</p>
    </div>
    <div class="lay">
${layers}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap-narrow">
    <div class="section-head reveal">
      <div class="eyebrow">Как устроена работа</div>
      <h2>От разбора до ведения</h2>
    </div>
    <div class="tl">
${stages}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Честно о границах</div>
      <h2>Когда комплекс брать не нужно</h2>
      <p class="lead">Четыре случая, в которых я сам отговариваю. Дешевле сказать это на первом созвоне, чем через три месяца объяснять, почему не сработало.</p>
    </div>
    <div class="nofit reveal">
${nofit}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap-narrow">
    <div class="section-head reveal">
      <div class="eyebrow">Вопросы</div>
      <h2>Что обычно спрашивают</h2>
    </div>
    <div class="faq-list reveal">
${faqItems(FAQ)}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="cta-final reveal">
      <h2>Расскажите, где сейчас теряются деньги</h2>
      <p class="lead">Посмотрю кабинет, сайт и аналитику и скажу, что чинить первым. Если по цифрам выйдет, что комплекс вам не нужен, — скажу и это.</p>
      <div class="btn-row">
        <a class="btn btn-fill btn-lg" href="/contacts/">Написать мне</a>
        <a class="btn btn-ghost btn-lg" href="/ceny/">Посмотреть цены</a>
      </div>
    </div>
  </div>
</section>`;

  const schema = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Комплексный интернет-маркетинг под ключ',
      serviceType: 'Интернет-маркетинг',
      description: 'Ведение рекламы, разработка посадочной страницы и настройка сквозной аналитики одним специалистом.',
      url: SITE + meta.path,
      areaServed: { '@type': 'Country', name: 'Россия' },
      provider: { '@type': 'Person', name: 'Даниил Карацапов', url: SITE },
      offers: {
        '@type': 'Offer',
        price: '90000',
        priceCurrency: 'RUB',
        url: SITE + '/ceny/',
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '90000',
          priceCurrency: 'RUB',
          unitText: 'месяц',
          valueAddedTaxIncluded: true,
        },
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Что входит',
        itemListElement: LAYERS.map((l) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: l.name, description: l.sub },
        })),
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

  return { body, schema, extraHead: KM_CSS };
}
