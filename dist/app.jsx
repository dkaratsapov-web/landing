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
    <div className="cookie-bar" role="dialog" aria-live="polite">
      <p className="cookie-text">
        Мы используем файлы cookie, чтобы улучшить работу сайта. К сайту подключён сервис веб-аналитики Яндекс.Метрика, использующий cookie-файлы.
      </p>
      <button type="button" className="cookie-ok" onClick={accept}>ок</button>
    </div>);

}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [quizOpen, setQuizOpen] = useStateApp(false);
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

  const scrollToContacts = () => document.querySelector('#contacts')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <ToastProvider>
      <Nav onCta={scrollToContacts} />
      <Hero variant={t.heroVariant} portrait="assets/portrait.jpg" onCta={scrollToContacts} />
      <SectionWave from="#08080a" to="#0d0d0f" speed={16} />
      <About />
      <SectionWave from="#0d0d0f" to="#08080a" speed={13} />
      <Services variant={t.servicesVariant} />
      <SectionWave from="#08080a" to="#151517" speed={18} />
      <Certificates />
      <SectionWave from="#151517" to="#08080a" speed={14} />
      <Process data-comment-anchor="a0b41ccc3a-h3-158-15" />
      <SectionWave from="#08080a" to="#151517" speed={16} />
      <Quotes />
      <Cases onCta={scrollToContacts} />
      <SectionWave from="#151517" to="#08080a" speed={13} />
      <Audit />
      {t.showQuiz && <QuizTeaser onOpen={() => setQuizOpen(true)} />}
      <SectionWave from="#08080a" to="#151517" speed={17} />
      <Contacts />
      <SectionWave from="#151517" to="#000000" speed={15} />
      <Footer onCta={scrollToContacts} />
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
      <CookieNotice />

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
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}
fetch('content.json', { cache: 'no-store' })
  .then((r) => (r.ok ? r.json() : null))
  .then((c) => { if (c && typeof c === 'object') window.CONTENT = c; })
  .catch(() => {})
  .finally(boot);