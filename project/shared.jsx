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

/* ---------- CONTENT-DRIVEN DATA ----------
   Заполняется из window.CONTENT (content.json; запасной — content-default.js).
   applyContent() перечитывает контент после fetch'а content.json при загрузке,
   поэтому правка content.json / через /admin меняет весь сайт. */
function Lines({ text }) {
  return String(text == null ? '' : text).split('\n').map((p, i) =>
    <React.Fragment key={i}>{i > 0 && <br />}{p}</React.Fragment>);
}
let STATS, SERVICES, PROCESS, CASES, CASE_FILTERS, CERTS, QUIZ_STEPS;
function applyContent() {
  const c = (typeof window !== 'undefined' && window.CONTENT) || {};
  STATS        = (c.about && c.about.stats) || [];
  SERVICES     = c.services    || [];
  PROCESS      = c.process     || [];
  CASES        = c.cases       || [];
  CASE_FILTERS = c.caseFilters || [];
  CERTS        = c.certs       || [];
  QUIZ_STEPS   = c.quiz        || [];
}
applyContent();

const WHY = [
  { icon: 'IconHandshake', title: 'Работаете со мной лично', desc: 'Не с менеджером и не с джуном. Проект веду я — от первого звонка до результата.' },
  { icon: 'IconEye',       title: 'Видно, куда идёт бюджет', desc: 'Настраиваю сквозную аналитику. Вы всегда знаете, откуда заявки и сколько они стоят.' },
  { icon: 'IconShield',    title: 'Отвечаю за результат',   desc: 'Не прячусь за «красивыми отчётами». Смотрим на заявки и деньги, а не на показы.' },
];

Object.assign(window, {
  useReveal, useCountUp, ToastProvider, useToast, maskPhone, phoneValid, applyContent, Lines,
  STATS, SERVICES, PROCESS, CASES, CASE_FILTERS, WHY, CERTS, QUIZ_STEPS,
});
