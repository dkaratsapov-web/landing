/* shared.jsx — hooks, toast system, and content data (from ТЗ). Exported to window. */

const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;

/* Reveal-on-scroll: adds .in when element enters viewport */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  });
}

/* Count-up for stat numbers when revealed */
function useCountUp(target, active, dur = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setVal(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, dur]);
  return val;
}

/* Toast notifications */
const ToastCtx = createContext(() => {});
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {toasts.map(t => (
          <div className="toast" key={t.id}>
            <span className="ic"><IconCheck size={16} /></span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

/* Phone mask helper */
function maskPhone(raw) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  let out = '+7';
  if (d.length > 1) out += ' (' + d.slice(1, 4);
  if (d.length >= 4) out += ') ' + d.slice(4, 7);
  if (d.length >= 7) out += '-' + d.slice(7, 9);
  if (d.length >= 9) out += '-' + d.slice(9, 11);
  return out;
}
const phoneValid = (raw) => raw.replace(/\D/g, '').length === 11;

/* ---------- DATA (faithful to ТЗ) ---------- */

const STATS = [
  { value: 9,  suffix: '+',     label: 'лет в маркетинге' },
  { value: 70, suffix: '%',     label: 'клиентов приходят по рекомендации' },
  { value: 3,  suffix: '+ млн', label: 'в месяц — оборот рекламных кабинетов' },
  { value: 50, suffix: '+',     label: 'инструментов для роста' },
];

const SERVICES = [
  { icon: 'IconTarget',  name: 'Контекстная реклама',   tag: 'Yandex Ads, Google Ads',
    result: 'Привожу целевые заявки с первых дней — без слива бюджета на нецелевой трафик.',
    works: [
      'Аудит ниши, спроса и конкурентов',
      'Сбор семантики, кластеризация, минус-слова',
      'Настройка кампаний: Поиск, РСЯ, ретаргетинг',
      'Написание и A/B-тест объявлений',
      'Еженедельная оптимизация ставок и отчёт',
    ],
    term: 'Запуск за 3–5 дней',
    price: 'от 50 000 ₽ настройка · от 30 000 ₽/мес ведение' },
  { icon: 'IconUsers',   name: 'Таргетированная реклама', tag: 'VK Ads, Telegram Ads, Avito Ads',
    result: 'Нахожу вашу аудиторию в соцсетях и веду её до заявки.',
    works: [
      'Анализ и сегментация целевой аудитории',
      'Настройка рекламного кабинета VK Ads',
      'Креативы и тексты под каждый сегмент',
      'Тест аудиторий, плейсментов и связок',
      'Масштабирование того, что приносит лиды',
    ],
    term: 'Запуск за 4–6 дней',
    price: 'от 25 000 ₽ настройка · от 18 000 ₽/мес ведение' },
  { icon: 'IconMonitor', name: 'Разработка сайтов',      tag: 'Лендинги и корпоративные',
    result: 'Делаю сайты под ключ — которые продают, а не просто красивые.',
    works: [
      'Прототип и структура под одну цель',
      'Дизайн в вашем фирменном стиле',
      'Адаптивная вёрстка под все устройства',
      'Подключение форм, аналитики и CRM',
      'Базовое SEO и скорость загрузки',
    ],
    term: 'Лендинг 7–14 дней',
    price: 'лендинг от 60 000 ₽ · корпоративный от 120 000 ₽' },
  { icon: 'IconChart',   name: 'Сквозная аналитика',     tag: 'Настройка и контроль',
    result: 'Настраиваю так, чтобы было видно, откуда приходит каждая заявка.',
    works: [
      'Яндекс.Метрика, цели и события',
      'Коллтрекинг и отслеживание форм',
      'Интеграция рекламы с CRM',
      'Сборка наглядного дашборда',
      'Обучу читать отчёты без аналитика',
    ],
    term: 'Настройка 5–10 дней',
    price: 'от 35 000 ₽ настройка · сопровождение от 12 000 ₽/мес' },
  { icon: 'IconLayers',  name: 'Комплексный маркетинг',  tag: 'Проект целиком',
    result: 'Беру проект целиком и веду от А до Я — одна точка ответственности.',
    works: [
      'Стратегия и медиаплан под бизнес',
      'Все каналы привлечения под ключ',
      'Сайт + реклама + аналитика в связке',
      'Еженедельные созвоны по результатам',
      'Один ответственный за весь результат — я',
    ],
    term: 'Старт за 1–2 недели',
    price: 'от 90 000 ₽/мес · зависит от объёма работ' },
];

const PROCESS = [
  { n: '01', title: 'Консультация', icon: 'IconPhone',
    desc: 'Разбираю вашу задачу лично. Договор обсуждаем здесь же — без лишних шагов.' },
  { n: '02', title: 'Аудит', icon: 'IconSearch',
    desc: 'Смотрю, что уже работает, а что сливает бюджет. Честно и по цифрам.' },
  { n: '03', title: 'Стратегия', icon: 'IconMap',
    desc: 'Составляю план под ваш бизнес и бюджет — без шаблонных решений.' },
  { n: '04', title: 'Реализация', icon: 'IconBolt',
    desc: 'Делаю руками сам: настраиваю рекламу, собираю сайты, веду аналитику.' },
  { n: '05', title: 'Отчёт и итог', icon: 'IconChart',
    desc: 'Показываю результат на понятных метриках. Не отчёты ради отчётов.' },
];

/* Фильтры кейсов по оказанным услугам (табы — из ТЗ клиента). */
const CASE_FILTERS = [
  { id: 'all',     label: 'Все' },
  { id: 'context', label: 'Контекстная реклама' },
  { id: 'site',    label: 'Разработка сайтов' },
  { id: 'target',  label: 'Таргетированная реклама' },
  { id: 'geo',     label: 'GEO-сервисы' },
];

/* Кейсы — данные строго из присланных файлов клиента (порядок — «Очередность»). */
const CASES = [
  { id: 'school', client: 'Школа «Дмитровский»', field: 'Частная школа', geo: 'Москва',
    img: 'assets/cases/school.jpg',
    tags: ['site', 'context', 'geo', 'target'],
    services: ['Сайт', 'Яндекс Директ', 'VK Ads', 'Яндекс Бизнес', 'SEO', 'RoiStat'],
    summary: 'Полный Digital-маркетинг для частной школы. Стабильный поток заявок от родителей Москвы и выше наполняемость групп.',
    metrics: [
      ['+400%', 'посетителей сайта за 4 месяца'],
      ['ROI 322%', 'за 6 месяцев'],
      ['+42%', 'набор в классы и группы'],
      ['+82', 'отзыва в Яндекс Бизнес за полгода'],
    ] },
  { id: 'profildoors', client: 'Профиль Дорс', field: 'Сеть салонов межкомнатных дверей', geo: 'Москва',
    img: 'assets/cases/profildoors.jpg',
    tags: ['context', 'geo', 'target'],
    services: ['Яндекс Директ', 'VK Ads', 'Яндекс Бизнес', 'RoiStat'],
    summary: 'Комплексная Digital-стратегия для сети салонов межкомнатных дверей.',
    metrics: [
      ['+45%', 'продаж за 2 месяца'],
      ['+4,6%', 'конверсия сайта'],
      ['−38%', 'стоимость лида (CPL)'],
      ['ДРР 7,3%', 'доля рекламных расходов'],
    ] },
  { id: 'tosun', client: 'To Sun Travel', field: 'Сервис трансферов', geo: 'Анталия, Турция',
    img: 'assets/cases/tosun.jpg',
    tags: ['site', 'context'],
    services: ['Сайт', 'Google Ads'],
    summary: 'Продающий сайт на 3 языках и Google Ads для сервиса трансферов. Рост заявок и бронирований по Турции.',
    metrics: [
      ['+85%', 'заявок за первые 2 месяца'],
      ['ROAS 450%', 'за первые 3 месяца'],
      ['65%', 'трафика из поиска Google Ads'],
      ['−18%', 'затрат на рекламу после оптимизации'],
    ] },
  { id: 'okna', client: 'Окна Люкс', field: 'Производство пластиковых окон', geo: 'Тверь',
    img: 'assets/cases/okna.jpg',
    tags: ['context', 'target'],
    services: ['Яндекс Директ', 'VK Ads', 'Сообщество ВКонтакте', 'RoiStat'],
    summary: 'Реклама в Яндекс Директ и VK Ads, оформление сообщества ВКонтакте и сквозная аналитика для производителя окон.',
    metrics: [
      ['ROI 220%', 'рекламы'],
      ['−30%', 'стоимость лида (CPL)'],
      ['40%', 'заказов из VK Ads'],
      ['+1200', 'подписчиков в группе ВК'],
    ] },
  { id: 'mebeline', client: 'Mebeline', field: 'Производитель мебели', geo: 'Костанай, Казахстан',
    img: 'assets/cases/mebeline.jpg',
    tags: ['site', 'context'],
    services: ['Сайт', 'Google Ads'],
    summary: 'Современный продающий сайт с каталогом и Google Ads для производителя мебели.',
    metrics: [
      ['+85%', 'заявок за первые 2 месяца'],
      ['ROI 340%', 'рекламы'],
      ['4500+', 'посещений сайта в месяц'],
      ['1 500 000 ₸', 'средняя стоимость заказа'],
    ] },
  { id: 'ipapa', client: 'iPapa', field: 'Магазин техники Apple', geo: 'Тверь',
    img: 'assets/cases/ipapa.jpg',
    tags: ['context', 'geo'],
    services: ['Яндекс Директ', 'Яндекс Бизнес', 'RoiStat'],
    summary: 'Комплексная стратегия продвижения для официального реселлера Apple в Твери.',
    metrics: [
      ['+53%', 'продаж'],
      ['ROI 420%', 'рекламы'],
      ['33%', 'лидов даёт Яндекс Бизнес'],
      ['−45%', 'снижение'],
    ] },
  { id: 'nebo', client: 'Nebo Lounge', field: 'Lounge Bar', geo: 'Москва',
    img: 'assets/cases/nebo.jpg',
    tags: ['context', 'geo'],
    services: ['Яндекс Директ', 'Яндекс Бизнес', 'RoiStat'],
    summary: 'Комплексная стратегия привлечения гостей для премиального Lounge Bar.',
    metrics: [
      ['+90%', 'бронирований за 4 месяца'],
      ['ROI 520%', 'с учётом повторных визитов'],
      ['170+', 'броней в месяц из Директа'],
      ['40%', 'новых клиентов из Яндекс Бизнес'],
    ] },
  { id: 'artlife', client: 'Art Life Cloud', field: 'Коворкинг', geo: 'Сочи', badge: 'Продвижение стартапа',
    img: 'assets/cases/artlife.jpg',
    tags: ['site', 'context', 'geo'],
    services: ['Сайт', 'Яндекс Директ', 'VK Ads', 'SEO', 'SMM', 'Яндекс Бизнес'],
    summary: 'Комплексное продвижение современного коворкинга в центре Сочи. Стабильный поток арендаторов и узнаваемость среди фрилансеров и предпринимателей.',
    metrics: [
      ['+80%', 'бронирований'],
      ['ROI 400%', 'за 5 месяцев'],
      ['+250%', 'посетителей сайта за 3 месяца'],
      ['+50%', 'постоянная заполняемость'],
    ] },
];

const WHY = [
  { icon: 'IconHandshake', title: 'Работаете со мной лично', desc: 'Не с менеджером и не с джуном. Проект веду я — от первого звонка до результата.' },
  { icon: 'IconEye',       title: 'Видно, куда идёт бюджет', desc: 'Настраиваю сквозную аналитику. Вы всегда знаете, откуда заявки и сколько они стоят.' },
  { icon: 'IconShield',    title: 'Отвечаю за результат',   desc: 'Не прячусь за «красивыми отчётами». Смотрим на заявки и деньги, а не на показы.' },
];

/* Сертификаты — превью (jpg) + полный документ (pdf). Открываются в лайтбоксе. */
const CERTS = [
  { title: 'Официальный партнёр Roistat', issuer: 'Roistat · сквозная аналитика',
    img: 'assets/certs/roistat.jpg', file: 'assets/certs/roistat.pdf' },
  { title: 'Яндекс Директ — Продвинутый', issuer: 'Яндекс · сертификат специалиста',
    img: 'assets/certs/direct-pro.jpg', file: 'assets/certs/direct-pro.pdf' },
  { title: 'Яндекс Директ — Базовый', issuer: 'Яндекс · сертификат специалиста',
    img: 'assets/certs/direct-base.jpg', file: 'assets/certs/direct-base.pdf' },
  { title: 'Яндекс Метрика', issuer: 'Яндекс · сертификат специалиста',
    img: 'assets/certs/metrika.jpg', file: 'assets/certs/metrika.pdf' },
  { title: 'Медийная реклама', issuer: 'Яндекс · сертификат специалиста',
    img: 'assets/certs/media.jpg', file: 'assets/certs/media.pdf' },
  { title: 'Реклама мобильных приложений', issuer: 'Яндекс · сертификация специалиста',
    img: 'assets/certs/mobile.jpg', file: 'assets/certs/mobile.pdf' },
  { title: 'Геоперформанс и Яндекс Бизнес', issuer: 'Яндекс · сертификация специалиста',
    img: 'assets/certs/yandex-geo.jpg', file: 'assets/certs/yandex-geo.pdf' },
  { title: 'Google Реклама — Поиск', issuer: 'Google Ads · поисковые кампании',
    img: 'assets/certs/google-search.jpg', file: 'assets/certs/google-search.pdf' },
  { title: 'Google Реклама — КМС', issuer: 'Google Ads · контекстно-медийная сеть',
    img: 'assets/certs/google-display.jpg', file: 'assets/certs/google-display.pdf' },
];

const QUIZ_STEPS = [
  { q: 'Какая задача сейчас важнее?', opts: ['Привлечь заявки', 'Сделать сайт', 'Настроить аналитику', 'Взять маркетинг целиком'] },
  { q: 'В какой нише ваш бизнес?', opts: ['Услуги', 'Товары / e-com', 'Производство', 'Другое'] },
  { q: 'Что с рекламой сейчас?', opts: ['Не запускали', 'Запускали сами', 'Был подрядчик', 'Работает, но слабо'] },
  { q: 'Бюджет на маркетинг в месяц', opts: ['До 50 000 ₽', '50–150 000 ₽', '150–300 000 ₽', 'Более 300 000 ₽'] },
];

Object.assign(window, {
  useReveal, useCountUp, ToastProvider, useToast, maskPhone, phoneValid,
  STATS, SERVICES, PROCESS, CASES, CASE_FILTERS, WHY, CERTS, QUIZ_STEPS,
});
