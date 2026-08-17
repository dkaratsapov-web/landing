/* app.jsx — сборка лендинга + панель Tweaks (варианты Hero и Услуг). */
const { useState: useStateApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "split",
  "servicesVariant": "grid",
  "accent": "lime",
  "atmos": true,
  "showQuiz": true
} /*EDITMODE-END*/;

/* Три акцентные темы: каждая задаёт полный набор токенов, читаемых на тёмном фоне.
   fill — заливка кнопок, ink — текст на заливке, bright — ссылки/акцентный текст,
   line — хайрлайн на кнопке, soft/softBd — фон и обводка иконок и чипов. */
const THEMES = {
  black: { swatch: '#16161a', fill: '#1a1a1e', ink: '#ffffff', bright: '#eaeaee',
    line: 'rgba(255,255,255,0.22)', soft: 'rgba(255,255,255,0.08)', softBd: 'rgba(255,255,255,0.18)', label: 'Чёрный' },
  lime: { swatch: '#b6f01e', fill: '#b6f01e', ink: '#0c1402', bright: '#c4f53e',
    line: 'transparent', soft: 'rgba(182,240,30,0.13)', softBd: 'rgba(182,240,30,0.30)', label: 'Салатовый' },
  gold: { swatch: '#d9b44a', fill: '#d9b44a', ink: '#1c1500', bright: '#e6c463',
    line: 'transparent', soft: 'rgba(217,180,74,0.14)', softBd: 'rgba(217,180,74,0.30)', label: 'Золотой' }
};

function AccentSwatches({ value, onChange }) {
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>Акцент</span><span className="twk-val">{THEMES[value]?.label}</span></div>
      <div style={{ display: 'flex', gap: 8 }}>
        {Object.entries(THEMES).map(([key, th]) =>
        <button key={key} type="button" onClick={() => onChange(key)} title={th.label}
        style={{ flex: 1, height: 34, borderRadius: 9, cursor: 'pointer', background: th.swatch,
          border: value === key ? '2px solid #29261b' : '1px solid rgba(0,0,0,0.18)',
          boxShadow: value === key ? '0 0 0 2px rgba(255,255,255,0.85) inset' : 'none' }} />
        )}
      </div>
    </div>);

}

/* Уведомление о cookie — показывается один раз, выбор хранится в localStorage. */
function CookieNotice() {
  const [show, setShow] = useStateApp(false);
  React.useEffect(() => {
    let ok = false;
    try { ok = !!localStorage.getItem('ck-accept'); } catch (e) {}
    if (!ok) setShow(true);
  }, []);
  if (!show) return null;
  const accept = () => {
    try { localStorage.setItem('ck-accept', '1'); } catch (e) {}
    setShow(false);
  };
  return (
    /* role="dialog" без доступного названия — ошибка PageSpeed. Здесь роль
       и не нужна: это не диалог, а уведомление, которое ничего не блокирует
       и не перехватывает фокус. Правильная роль для такого — status. */
    <div className="cookie-bar" role="status" aria-label="Уведомление об использовании cookie">
      <p className="cookie-text">
        Мы используем файлы cookie, чтобы улучшить работу сайта. К сайту подключён сервис веб-аналитики Яндекс.Метрика, использующий cookie-файлы.
      </p>
      <button type="button" className="cookie-ok" onClick={accept}>ок</button>
    </div>);

}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [quizOpen, setQuizOpen] = useStateApp(false);
  const [leadOpen, setLeadOpen] = useStateApp(false);
  useReveal();

  // фоновые узоры можно отключить
  React.useEffect(() => {
    document.documentElement.classList.toggle('no-atmos', t.atmos === false);
  }, [t.atmos]);

  // применяем выбранную акцентную тему к CSS-токенам
  React.useEffect(() => {
    const th = THEMES[t.accent] || THEMES.lime;
    const r = document.documentElement.style;
    r.setProperty('--accent', th.fill);
    r.setProperty('--accent-bright', th.bright);
    r.setProperty('--accent-ink', th.ink);
    r.setProperty('--accent-line', th.line);
    r.setProperty('--accent-soft', th.soft);
    r.setProperty('--accent-soft-bd', th.softBd);
  }, [t.accent]);

  const openLead = () => setLeadOpen(true);
  React.useEffect(() => {
    window.openLeadModal = openLead;
    /* Сигнал для motion.js: гидратация завершена, DOM можно трогать.
       Эффект выполняется после коммита, то есть после того, как React сверил
       серверную разметку с клиентской. До этого момента любая правка DOM
       снаружи ломает гидратацию и заставляет React перерисовать всю страницу. */
    document.documentElement.dataset.hydrated = '1';
    window.dispatchEvent(new Event('app:hydrated'));
  }, []);

  return (
    <ToastProvider>
      {/* Атмосфера страницы — один слой на всю главную. Раньше он был в
          каждой секции отдельно, и на границах блоков оставались тёмные
          полосы: свечение гасло к краю, а разделитель между секциями
          собственного фона не имел. Общий слой убирает саму возможность
          такого стыка. */}
      <div className="page-atmos" aria-hidden="true">
        <div className="pattern pattern-grid drifting" />
        <div className="glow pg-g1" />
        <div className="glow pg-g2" />
      </div>
      <Nav onCta={openLead} />
      {/* <main> охватывает всё между шапкой и подвалом: без него в дереве
          доступности нет области основного содержимого, и проверка агентного
          просмотра считает разметку некорректной. */}
      <main id="main">
      {/* Разделители намеренно разные. Волна оставлена в двух местах — под
          героем и перед контактами: восемь одинаковых волн подряд читались
          как приём, который забыли выключить. Декор самих секций задаётся
          внутри них через <SectionFx>. */}
      <Hero variant={t.heroVariant} portrait="assets/portrait.jpg" onCta={openLead} />
      <SectionWave from="#08080a" to="#08080a" speed={16} />
      <About />
      <SectionEdge variant="dashes" />
      <Services variant={t.servicesVariant} onCta={openLead} />
      <SectionEdge variant="node" />
      <Certificates />
      <SectionEdge variant="hairline" />
      <Process data-comment-anchor="a0b41ccc3a-h3-158-15" />
      <SectionEdge variant="chevron" />
      <Quotes />
      <Cases onCta={openLead} />
      <SectionEdge variant="node" />
      <Audit />
      <SectionWave from="#08080a" to="#08080a" speed={13} />
      <Contacts onCta={openLead} />
      <SectionEdge variant="hairline" />
      </main>
      <Footer />
      {t.showQuiz && <QuizFab onOpen={() => setQuizOpen(true)} />}
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
      <LeadFormModal open={leadOpen} onClose={() => setLeadOpen(false)} />
      <CookieNotice />
      {/* Быстрая связь на телефоне: Telegram слева, звонок справа. Разметка
          повторяет mobileDock() из layout.mjs — главная собирается отдельно,
          общего источника у них нет. Стили общие, в nav.css. */}
      <div className="mob-dock">
        <a className="mob-dock-btn mob-dock-tg" href="https://t.me/Daniil_065"
           target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.94 4.6 18.6 20.3c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.09-.56-.62-.2L5.8 13.06l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6L20.5 2.55c.9-.33 1.7.22 1.44 2.05Z"/></svg>
        </a>
        <a className="mob-dock-btn mob-dock-call" href="tel:+79963470065" aria-label="Позвонить +7 (996) 347-00-65">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
        </a>
      </div>

      <TweaksPanel>
        <TweakSection label="Главный экран (Hero)" />
        <TweakRadio label="Раскладка" value={t.heroVariant}
        options={[{ value: 'split', label: 'Сплит' }, { value: 'overlay', label: 'Фото-фон' }, { value: 'editorial', label: 'Крупно' }]}
        onChange={(v) => setTweak('heroVariant', v)} />
        <TweakSection label="Услуги" />
        <TweakRadio label="Раскладка" value={t.servicesVariant}
        options={[{ value: 'grid', label: 'Карточки' }, { value: 'rows', label: 'Список' }, { value: 'feature', label: 'Вкладки' }]}
        onChange={(v) => setTweak('servicesVariant', v)} />
        <TweakSection label="Оформление" />
        <AccentSwatches value={t.accent} onChange={(v) => setTweak('accent', v)} />
        <TweakToggle label="Фоновые узоры" value={t.atmos !== false} onChange={(v) => setTweak('atmos', v)} />
        <TweakToggle label="Блок квиза" value={t.showQuiz} onChange={(v) => setTweak('showQuiz', v)} />
      </TweaksPanel>
    </ToastProvider>);

}

/* Load editable content (content.json) before first render. content-default.js
   already set window.CONTENT as a baked fallback, so the site renders even if
   the fetch fails. applyContent() refreshes the data arrays from CONTENT. */
function boot() {
  if (typeof applyContent === 'function') applyContent();
  const root = document.getElementById('root');
  // build.mjs вшивает в #root пререндеренную разметку — переиспользуем её через
  // hydrateRoot, иначе React стёр бы готовый HTML и нарисовал то же самое заново.
  // Если разметки нет (dev-режим без сборки) или content.json на сервере успели
  // отредактировать через /admin — createRoot и обычный рендер с нуля.
  if (root.firstElementChild) ReactDOM.hydrateRoot(root, <App />);
  else ReactDOM.createRoot(root).render(<App />);
}
fetch('content.json', { cache: 'no-store' })
  .then((r) => (r.ok ? r.json() : null))
  .then((c) => { if (c && typeof c === 'object') window.CONTENT = c; })
  .catch(() => {})
  .finally(boot);