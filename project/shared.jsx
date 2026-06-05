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
  { value: 7,   suffix: '+',  label: 'лет в интернет-маркетинге' },
  { value: 150, suffix: '+',  label: 'проектов веду лично' },
  { value: 50,  suffix: '%',  label: 'клиентов приходят по рекомендации' },
  { value: 90,  suffix: '%',  label: 'фиксируют рост конверсии' },
];

const SERVICES = [
  { icon: 'IconTarget',  name: 'Контекстная реклама',   tag: 'Яндекс.Директ',
    result: 'Привожу целевые заявки с первых дней — без слива бюджета на нецелевой трафик.',
    works: [
      'Аудит ниши, спроса и конкурентов',
      'Сбор семантики, кластеризация, минус-слова',
      'Настройка кампаний: Поиск, РСЯ, ретаргетинг',
      'Написание и A/B-тест объявлений',
      'Еженедельная оптимизация ставок и отчёт',
    ],
    term: 'Запуск за 3–5 дней',
    price: 'от 30 000 ₽ настройка · от 20 000 ₽/мес ведение' },
  { icon: 'IconUsers',   name: 'Таргетированная реклама', tag: 'VK Ads',
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

const CASES = [
  { client: 'Школа «Дмитровский»', field: 'Образование', metric: '+42%', metricLabel: 'заявок за 2 месяца',
    summary: 'Запустил контекст и таргет под набор групп. Перестроил посадочную под одну цель.',
    photo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=640&fit=crop&q=80',
    note: 'Проект вёл лично: аудит посадочных, настройка кабинетов Директа и VK Ads, оптимизация ставок и стоп-слов в течение всего набора.',
    details: [
      ['Канал', 'Яндекс.Директ + VK Ads'],
      ['Срок', '2 месяца'],
      ['Заявки', '+42% к прошлому набору'],
      ['Цена заявки', '−31% после оптимизации'],
    ] },
  { client: 'Профиль Дорс', field: 'Производство дверей', metric: 'ROI 380%', metricLabel: 'на контекстной рекламе',
    summary: 'Собрал семантику по тёплым запросам, отсёк мусорный трафик, настроил сквозную аналитику.',
    photo: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=640&fit=crop&q=80',
    note: 'Построил семантику с нуля, лично настроил Директ и ретаргетинг. Владелец теперь видит источник каждой заявки — включая офлайн-звонки через колл-трекинг.',
    details: [
      ['Канал', 'Яндекс.Директ'],
      ['Срок', '3 месяца'],
      ['ROI', '380%'],
      ['Доля целевых лидов', 'выросла с 54% до 88%'],
    ] },
  { client: 'To Sun Travel', field: 'Туризм', metric: '×2,3', metricLabel: 'рост числа обращений',
    summary: 'Лендинг под горящие туры + таргет на сегменты по интересам и гео.',
    photo: 'https://images.unsplash.com/photo-1528920304568-7aa06b3dda8b?w=640&fit=crop&q=80',
    note: 'Написал и согласовал лендинг под сезонные предложения, сам вёл кабинет VK Ads с разбивкой по гео и интересам. Итог — в 2,3 раза больше обращений за 6 недель без роста бюджета.',
    details: [
      ['Канал', 'VK Ads + сайт'],
      ['Срок', '6 недель'],
      ['Обращения', 'выросли в 2,3 раза'],
      ['Стоимость лида', '−24%'],
    ] },
  { client: 'Окна Тверь', field: 'Окна и остекление', metric: '−27%', metricLabel: 'цена заявки',
    summary: 'Переработал объявления и посадочные под локальный спрос, выстроил аналитику по районам.',
    photo: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=640&fit=crop&q=80',
    note: 'Полностью пересобрал кампанию: новые объявления, переработанные посадочные, геотаргетинг по районам города. Конверсия сайта выросла в 2 раза, цена заявки упала на 27%.',
    details: [
      ['Канал', 'Яндекс.Директ'],
      ['Срок', '2 месяца'],
      ['Цена заявки', '−27%'],
      ['Конверсия сайта', 'с 2,1% до 4,4%'],
    ] },
  { client: 'BM Clinic', field: 'Медицина', metric: '+63%', metricLabel: 'записей с сайта',
    summary: 'Настроил сквозную аналитику и контекст по услугам, убрал нецелевые ключи.',
    photo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&fit=crop&q=80',
    note: 'Связал колл-трекинг, CRM и Яндекс.Директ в единую цепочку — клиника видит, какое именно объявление привело каждого пациента. Убрал нецелевые ключи, снизил нагрузку на администраторов.',
    details: [
      ['Канал', 'Яндекс.Директ + аналитика'],
      ['Срок', '4 месяца'],
      ['Записи', '+63%'],
      ['Прозрачность', 'видно источник каждой записи'],
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
  STATS, SERVICES, PROCESS, CASES, WHY, CERTS, QUIZ_STEPS,
});
