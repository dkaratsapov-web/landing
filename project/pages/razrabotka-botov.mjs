/* /razrabotka-botov/ — боты для Telegram и MAX.

   Зачем страница. Услуга есть в работе (кейс «ДиАвто69»: сайт, бот и
   мини-приложение), но на сайте о ней не сказано ни слова. Запросы
   «разработка телеграм бота», «заказать бота для telegram», «бот для
   записи клиентов» — заметная частотность и вменяемая конкуренция:
   в выдаче в основном студии с ценами «от 100 000» и конструкторы.

   Смысловое ядро. Ботов продают как «автоматизацию» вообще, и от этого
   слова покупателю ни холодно ни жарко. Работает другой критерий:
   бот окупается там, где одно и то же действие повторяется десятки раз
   в день и каждый раз отнимает время живого человека. Если операция
   редкая или каждый раз разная, бот только добавит звено. Отсюда
   центральный блок — не список возможностей, а таблица «операция →
   сколько раз в день → что забирает бот → что остаётся человеку».

   Про MAX. Мессенджер российский, у него есть бот-API и мини-приложения,
   и аудитория у него своя. Никаких цифр охвата на странице нет
   намеренно: они меняются каждый месяц, а проверить их владелец не
   сможет — значит, врать будет страница, а отвечать он.

   Цены в прайсе на эту услугу нет, поэтому конкретной цифры здесь тоже
   нет. Вилка появится в /ceny/ и в списке ALL в service-kit.mjs, когда
   владелец её назовёт.

   Блока с кейсами здесь нет намеренно: среди двадцати двух обезличенных
   кейсов ни одного с ботом, а единственный подходящий — «ДиАвто69» —
   лежит отдельной страницей. На неё ведут ссылки из первого экрана и из
   ответов на вопросы; ставить блок «доказательства» с чужими по теме
   проектами значит выдавать одно за другое.
*/
import { SITE, breadcrumbs, faqItems } from '../layout.mjs';
import { SVC_CSS, hero, related } from '../service-kit.mjs';

export const meta = {
  path: '/razrabotka-botov/',
  title: 'Разработка ботов для Telegram и MAX — под задачу бизнеса | Даниил Карацапов',
  description: 'Делаю ботов для Telegram и MAX: приём заявок, запись, каталог, ответы на типовые вопросы, уведомления менеджерам и связка с CRM. Сначала считаем, окупится ли бот, потом пишем.',
  ogImage: '/assets/og/uslugi.jpg',
};

/* Центральная таблица. Первые три строки — операции, которые бот забирает
   целиком; последние две показывают границу: там, где ответ каждый раз
   разный, бот работает диспетчером, а не исполнителем. Это честнее, чем
   обещать «полную автоматизацию», и снимает половину возражений заранее. */
const OPS = [
  {
    op: 'Приём заявки',
    freq: 'десятки в день',
    bot: 'Собирает контакт, задачу и бюджет по шагам, проверяет телефон на опечатку и кладёт заявку в CRM.',
    human: 'Получает готовую карточку и звонит по делу, а не выясняет вводные.',
    on: true,
  },
  {
    op: 'Запись на время',
    freq: 'десятки в день',
    bot: 'Показывает свободные окна, записывает, шлёт напоминание накануне и принимает перенос.',
    human: 'Ведёт приём. В переписку не заходит вовсе.',
    on: true,
  },
  {
    op: 'Типовые вопросы',
    freq: 'сотни в день',
    bot: 'Отвечает на «сколько стоит», «где вы находитесь», «когда привезёте» — по вашим же формулировкам.',
    human: 'Разбирает только то, что бот не узнал.',
    on: true,
  },
  {
    op: 'Подбор и сравнение',
    freq: 'единицы в день',
    bot: 'Показывает каталог с фильтрами и отправляет выбранное менеджеру вместе с историей выбора.',
    human: 'Досогласовывает детали — здесь без человека не выйдет.',
  },
  {
    op: 'Сложный спор или рекламация',
    freq: 'редко',
    bot: 'Только фиксирует обращение и зовёт человека.',
    human: 'Решает. Пытаться закрыть это ботом — верный способ потерять клиента.',
  },
];

/* Две платформы. Сравнение по делу, без «где больше аудитории»: этот
   вопрос решается не платформой, а тем, где сидят клиенты конкретного
   бизнеса. Поэтому сравниваю по свойствам, которые влияют на разработку. */
const PLATFORMS = [
  {
    name: 'Telegram',
    tag: 'привычная среда',
    items: [
      'Клиенты уже там и умеют пользоваться — обучать не нужно.',
      'Мини-приложения: внутри бота открывается полноценный экран с каталогом, картой или календарём.',
      'Платежи, оплата прямо в переписке.',
      'Каналы и боты работают в связке: пост в канале — кнопка — бот.',
    ],
  },
  {
    name: 'MAX',
    tag: 'российская платформа',
    items: [
      'Отечественный мессенджер со своим бот-API и мини-приложениями.',
      'Важен там, где для бизнеса принципиальна российская площадка.',
      'Аудитория пересекается с Telegram не полностью: часть клиентов будет только здесь.',
      'Логику бота пишу один раз, платформы подключаю обе — переписывать с нуля не нужно.',
    ],
  },
];

const WORKS = [
  ['Считаем, окупится ли',
    'Первый разговор — не про кнопки, а про операции: что повторяется каждый день, сколько времени отнимает и сколько таких обращений. Если выходит, что бот сэкономит час в неделю, я так и скажу — такой бот не стоит своей разработки и поддержки.'],
  ['Сценарий',
    'Рисую путь клиента по шагам: что бот спрашивает, в каком порядке, что делает при странном ответе и где передаёт человеку. Здесь же — тексты сообщений. Большая часть провальных ботов провалилась именно на этом шаге, а не в коде.'],
  ['Разработка',
    'Пишу бота и подключаю то, что нужно: базу товаров или услуг, календарь записи, оплату, мини-приложение. Данные живут на вашей стороне, доступы оформляются на вас.'],
  ['Связка с CRM и уведомлениями',
    'Заявка из бота попадает туда же, куда заявки с сайта, — с меткой источника. Иначе бот выглядит бесплатным каналом, а его вклад в продажи никто не видит.'],
  ['Запуск и наблюдение',
    'Смотрю, где люди отваливаются в сценарии и что пишут вместо кнопок. Первые две недели правки идут почти каждый день — это нормально и заложено в работу.'],
];

const NOT_FOR = [
  'Редкие обращения. Три заявки в неделю разберёт человек. Бот здесь — лишнее звено, которое ещё и нужно поддерживать.',
  'Каждый запрос уникален. Если ответ всякий раз собирается заново, сценарий превратится в дерево из сотни веток и всё равно упрётся в живого специалиста.',
  'Бот вместо сайта. В мессенджере человек не сравнивает предложения и не читает длинное описание — он выполняет действие. Продавать сложное лучше на странице, а боту отдать заявку и запись.'
    + ' Если сайта нет, начинать разумнее с <a href="/razrabotka-sajtov/">него</a>.',
  'Никто не будет отвечать. Бот доводит человека до вопроса, на который нужен ответ живого сотрудника. Если отвечать некому, разговор оборвётся ровно на самом горячем месте.',
];

const FAQ = [
  ['Сколько стоит разработать бота?',
    'Зависит от сценария: бот приёма заявок и бот с каталогом, оплатой и мини-приложением — работы разного объёма. Называю сумму после разговора о задаче, когда понятно, что именно бот делает и с чем связывается. Прайс на остальные услуги — <a href="/ceny/">на странице цен</a>.'],
  ['Сколько времени занимает разработка?',
    'Простой бот приёма заявок — обычно несколько дней. Бот с каталогом, записью и связкой с CRM — недели. Точнее скажу после сценария: именно он определяет объём, а не платформа.'],
  ['Telegram или MAX — что выбрать?',
    'По тому, где ваши клиенты. Telegram — привычная среда, там уже сидят и умеют пользоваться. MAX важен, когда для бизнеса принципиальна российская платформа или часть аудитории есть только там. Логика бота пишется один раз, поэтому вторая платформа обходится заметно дешевле первой.'],
  ['Можно ли связать бота с сайтом и CRM?',
    'Да, и это обычно и есть смысл затеи. Заявка из бота попадает в ту же CRM, что и заявки с сайта, с меткой источника — иначе непонятно, что канал вообще приносит. С <a href="/skvoznaya-analitika/">сквозной аналитикой</a> видно и выручку по нему.'],
  ['Что такое мини-приложение?',
    'Экран, который открывается прямо внутри мессенджера: каталог с фильтрами, карта, календарь записи, личный кабинет. Выглядит как обычное приложение, но ставить ничего не нужно. Так сделан каталог в <a href="/keysy/diauto69/">кейсе с импортёром автомобилей</a>.'],
  ['Кому принадлежит бот?',
    'Вам. Бот регистрируется на ваш аккаунт, доступы и данные остаются под вашим контролем. Я работаю в ваших аккаунтах и ничего не закрываю от клиента.'],
  ['Нужна ли поддержка после запуска?',
    'Первые недели — да, обязательно: люди ведут себя не так, как ожидает сценарий, и правки идут по факту. Дальше бот работает сам, а обращаться приходится, когда меняется услуга, цена или условия.'],
];

const BOT_CSS = `<style>
/* ── Таблица операций ────────────────────────────────────────────────────
   Не карточки, а строки с разделителями: это сравнение по столбцам, и
   рамки вокруг каждой строки заставляли бы глаз читать их как отдельные
   объекты вместо одной таблицы.

   Первые три строки подсвечены слева полосой — там, где бот забирает
   операцию целиком. Полоса, а не заливка: заливка на трёх строках из
   пяти перекрашивает половину блока и перестаёт что-либо значить. */
.ops { margin-top: 34px; border: 1px solid var(--line); border-radius: 18px; overflow: clip; }
.ops-head, .ops-row {
  display: grid; gap: 4px 20px; padding: 18px 22px;
  border-bottom: 1px solid var(--line);
}
@media (min-width: 1000px) {
  .ops-head, .ops-row { grid-template-columns: 1.1fr 0.7fr 1.6fr 1.4fr; gap: 20px; align-items: start; }
}
.ops-row:last-child { border-bottom: none; }
.ops-head {
  background: var(--surface-2); font-size: 11.5px; font-weight: 700;
  letter-spacing: .09em; text-transform: uppercase; color: var(--txt-3);
}
@media (max-width: 999px) { .ops-head { display: none; } }
.ops-row { background: var(--surface); position: relative; }
.ops-row.on::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--accent);
}
.ops-op { font-size: 16px; font-weight: 700; color: var(--txt); }
.ops-freq { font-size: 13.5px; color: var(--accent-bright); font-weight: 600; }
.ops-bot, .ops-human { font-size: 14.5px; line-height: 1.55; color: var(--txt-2); }
.ops-human { color: var(--txt-3); }
/* На узком экране столбцы схлопываются в строки, и без подписей понять,
   что есть что, невозможно: шапка таблицы там скрыта. */
@media (max-width: 999px) {
  .ops-bot::before { content: 'Бот: '; color: var(--txt-3); }
  .ops-human::before { content: 'Человек: '; color: var(--txt-3); }
}
.ops-note { margin-top: 18px; font-size: 14px; color: var(--txt-3);
  display: flex; align-items: center; gap: 10px; }
.ops-note::before { content: ''; width: 26px; height: 2px; background: var(--accent); flex: none; }

/* ── Платформы ───────────────────────────────────────────────────────── */
.plt { display: grid; gap: 16px; margin-top: 34px; }
@media (min-width: 860px) { .plt { grid-template-columns: 1fr 1fr; } }
.plt-i { padding: 28px 26px; border: 1px solid var(--line); border-radius: 18px; background: var(--surface); }
.plt-h { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.plt-n { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--txt); }
.plt-tag { font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: var(--txt-3); }
.plt-l { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
.plt-l li { position: relative; padding-left: 22px; font-size: 15px; line-height: 1.55; color: var(--txt-2); }
.plt-l li::before { content: ''; position: absolute; left: 0; top: 9px;
  width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }

/* ── Кому не нужен ──────────────────────────────────────────────────── */
.nofit { display: grid; gap: 1px; margin-top: 34px; background: var(--line);
  border: 1px solid var(--line); border-radius: 18px; overflow: clip; }
@media (min-width: 860px) { .nofit { grid-template-columns: 1fr 1fr; } }
.nofit-i { background: var(--surface); padding: 24px 26px; font-size: 15px; line-height: 1.6; color: var(--txt-2); }
.nofit-i strong { display: block; color: var(--txt); font-weight: 600; margin-bottom: 4px; }
.nofit-i a { color: var(--accent-bright); }

/* ── Макет переписки с ботом в первом экране ─────────────────────────────
   Нарисован на CSS, а не снят скриншотом: чужие интерфейсы меняются, и
   снимок через полгода начинает врать. Здесь показан не «красивый чат», а
   ровно то, что продаёт услугу, — бот собирает вводные по шагам и отдаёт
   готовую карточку. */
.chat { border: 1px solid var(--line); border-radius: 18px; overflow: clip; background: var(--surface); }
.chat-bar { display: flex; align-items: center; gap: 10px; padding: 12px 16px;
  background: var(--surface-2); border-bottom: 1px solid var(--line); }
.chat-av { width: 26px; height: 26px; border-radius: 50%; background: var(--accent);
  color: var(--lime-ink, #0c1402); display: grid; place-items: center;
  font-size: 12px; font-weight: 800; flex: none; }
.chat-nm { font-size: 13.5px; font-weight: 600; color: var(--txt); }
.chat-st { font-size: 11.5px; color: var(--txt-3); margin-left: auto; }
.chat-body { padding: 16px; display: flex; flex-direction: column; gap: 9px; }
.msg { max-width: 82%; padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.45; }
.msg-bot { align-self: flex-start; background: var(--surface-2); color: var(--txt-2);
  border-bottom-left-radius: 5px; }
.msg-me { align-self: flex-end; background: var(--accent); color: var(--lime-ink, #0c1402);
  border-bottom-right-radius: 5px; font-weight: 600; }
.msg-btns { display: flex; flex-wrap: wrap; gap: 6px; align-self: flex-start; max-width: 82%; }
.msg-btn { padding: 7px 12px; border-radius: 999px; border: 1px solid var(--line-strong, rgba(255,255,255,.14));
  font-size: 12.5px; color: var(--txt-2); }
.chat-card { margin: 4px 16px 16px; padding: 13px 15px; border-radius: 13px;
  border: 1px solid rgba(182,240,30,0.3); background: rgba(182,240,30,0.06); }
.chat-card-h { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: var(--accent-bright); margin-bottom: 7px; }
.chat-card-r { display: flex; justify-content: space-between; gap: 14px;
  font-size: 13px; line-height: 1.7; color: var(--txt-2); }
.chat-card-r b { color: var(--txt); font-weight: 600; }
</style>`;

const CHAT_MOCK = `        <div class="chat">
          <div class="chat-bar">
            <span class="chat-av">Б</span>
            <span class="chat-nm">Бот компании</span>
            <span class="chat-st">отвечает сразу</span>
          </div>
          <div class="chat-body">
            <div class="msg msg-bot">Здравствуйте! Подскажу по услугам и приму заявку. С чего начнём?</div>
            <div class="msg-btns">
              <span class="msg-btn">Рассчитать стоимость</span>
              <span class="msg-btn">Записаться</span>
              <span class="msg-btn">Где вы находитесь</span>
            </div>
            <div class="msg msg-me">Рассчитать стоимость</div>
            <div class="msg msg-bot">Какой объём работ? Можно примерно.</div>
            <div class="msg msg-me">Около 200 м²</div>
            <div class="msg msg-bot">Принял. Оставьте телефон — пришлю расчёт и передам менеджеру.</div>
          </div>
          <div class="chat-card">
            <div class="chat-card-h">В CRM ушла карточка</div>
            <div class="chat-card-r"><span>Объём</span><b>200 м²</b></div>
            <div class="chat-card-r"><span>Источник</span><b>бот, Telegram</b></div>
            <div class="chat-card-r"><span>Время на менеджера</span><b>0 минут</b></div>
          </div>
        </div>
        <p class="mock-cap">Вводные бот собирает сам. Человек получает готовую карточку — и звонит по делу, а не выясняет, что нужно клиенту.</p>`;

export function render() {
  const crumbs = breadcrumbs([['/razrabotka-botov/', 'Разработка ботов']]);

  const ops = OPS.map((o) => `        <div class="ops-row${o.on ? ' on' : ''}">
          <div class="ops-op">${o.op}</div>
          <div class="ops-freq">${o.freq}</div>
          <div class="ops-bot">${o.bot}</div>
          <div class="ops-human">${o.human}</div>
        </div>`).join('\n');

  const platforms = PLATFORMS.map((p) => `        <div class="plt-i reveal">
          <div class="plt-h"><span class="plt-n">${p.name}</span><span class="plt-tag">${p.tag}</span></div>
          <ul class="plt-l">
${p.items.map((i) => `            <li>${i}</li>`).join('\n')}
          </ul>
        </div>`).join('\n');

  const works = WORKS.map(([t, d], i) => `        <div class="tl-item reveal">
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

  const body = `${hero({
    label: 'Боты',
    crumbs: crumbs.visible,
    eyebrow: 'Разработка ботов · Telegram и MAX',
    h1: 'Разработка ботов <span class="accent">для Telegram и MAX</span>',
    utp: 'Бот окупается не «автоматизацией вообще», а конкретной операцией, которая повторяется десятки раз в день. <b>Сначала считаем, есть ли такая операция</b>, и только потом пишем.',
    lead: 'Приём заявок, запись на время, ответы на типовые вопросы, каталог и мини-приложение, уведомления менеджерам и связка с CRM. Бот регистрируется на вас, данные остаются у вас.',
    ctas: `          <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Обсудить задачу</a>
          <a class="btn btn-ghost btn-lg" href="/keysy/diauto69/">Посмотреть кейс с ботом</a>`,
    factList: [
      ['<span>2</span> платформы', 'Telegram и MAX, логика пишется один раз'],
      ['от <span>нескольких дней</span>', 'на бота приёма заявок'],
      ['<span>0</span> минут', 'времени менеджера на сбор вводных'],
    ],
    visual: CHAT_MOCK,
  })}

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Главный вопрос</div>
      <h2>Не «что умеет бот», а какую операцию он забирает</h2>
      <p class="lead">Ботов продают словом «автоматизация», и покупателю оно ничего не говорит. Полезный критерий другой: действие повторяется много раз в день и каждый раз отнимает время живого человека. Ниже — где это так, а где нет.</p>
    </div>
    <div class="ops reveal">
      <div class="ops-head">
        <div>Операция</div>
        <div>Как часто</div>
        <div>Что делает бот</div>
        <div>Что остаётся человеку</div>
      </div>
${ops}
    </div>
    <p class="ops-note">Отмечено то, что бот забирает целиком. Ниже отметки он работает диспетчером: фиксирует обращение и зовёт человека.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Две платформы</div>
      <h2>Telegram, MAX или обе сразу</h2>
      <p class="lead">Выбор решается не тем, где «больше аудитории вообще», а тем, где сидят ваши клиенты. Сценарий и логика пишутся один раз, поэтому вторая платформа обходится заметно дешевле первой.</p>
    </div>
    <div class="plt">
${platforms}
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
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Честно о границах</div>
      <h2>Когда бот не нужен</h2>
      <p class="lead">В четырёх случаях ниже бот либо не окупится, либо навредит. Если ваша задача из этого списка, я так и скажу на первом же разговоре.</p>
    </div>
    <div class="nofit reveal">
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

${related('/razrabotka-botov/', ['/razrabotka-sajtov/', '/skvoznaya-analitika/', '/kontekstnaya-reklama/'])}

<section class="section">
  <div class="wrap">
    <div class="cta-final reveal">
      <h2>Расскажите, что повторяется каждый день</h2>
      <p class="lead">По описанию операции обычно сразу видно, окупится бот или нет. Если не окупится — скажу прямо и предложу то, что решит задачу дешевле.</p>
      <div class="btn-row">
        <a class="btn btn-fill btn-lg" href="/contacts/" data-lead-modal>Написать мне</a>
        <a class="btn btn-ghost btn-lg" href="/razrabotka-sajtov/">Разработка сайтов</a>
      </div>
    </div>
  </div>
</section>`;

  const schema = [
    crumbs.schema,
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Разработка ботов для Telegram и MAX',
      serviceType: 'Разработка чат-ботов',
      description: 'Боты для приёма заявок, записи, ответов на типовые вопросы, каталога и мини-приложений с интеграцией в CRM.',
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

  return { body, schema, extraHead: `<style>${SVC_CSS}</style>` + BOT_CSS };
}
