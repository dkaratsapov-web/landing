/* extras.jsx — animated background atmosphere + rotating quotes. Exported to window. */
const { useState: useStateE, useEffect: useEffectE, useRef: useRefE,
  useMemo: useMemoE, useCallback: useCallbackE } = React;

/* ---------- Atmos: drifting glows + pattern, sits behind a section ---------- */
function Atmos({ glows = [1, 2], pattern = 'dots', drifting = false }) {
  return (
    <div className="atmos" aria-hidden="true">
      {pattern && <div className={'pattern pattern-' + pattern + (drifting ? ' drifting' : '')} />}
      {glows.map((g) => <div key={g} className={'glow g' + g} />)}
    </div>
  );
}

/* ---------- Quotes: auto-rotating, animated (content from CONTENT.quotes) ---------- */
/* Each quote in content.json is { text, hl, author, role }; hl is the substring
   to highlight. */

/* Typewriter body — isolated in its own component so the per-character ticks
   re-render ONLY this subtree, never the animated background (Atmos) or the
   dots. The visible text is built from 3 string segments (pre / highlight /
   post) instead of one <span> per character, so each tick touches at most a
   few text nodes — this is the difference between smooth and janky on phones. */
function QuoteBody({ q, paused, onAdvance }) {
  const [typed, setTyped] = useStateE(0);
  const text = (q && q.text) || '';
  const hl = (q && q.hl) || '';
  const total = text.length;
  const done = typed >= total;
  const at = hl ? text.indexOf(hl) : -1;
  const hlEnd = at >= 0 ? at + hl.length : -1;

  // Type the active quote out, one character at a time.
  useEffectE(() => {
    setTyped(0);
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setTyped(n);
      if (n >= total) clearInterval(id);
    }, 42);
    return () => clearInterval(id);
  }, [q, total]);

  // Once typed (and not hovered), hold for a beat, then advance to the next.
  useEffectE(() => {
    if (!done || paused) return;
    const id = setTimeout(onAdvance, 2800);
    return () => clearTimeout(id);
  }, [done, paused, onAdvance]);

  // Split the revealed substring into plain / highlighted / plain segments.
  let pre = '', mid = '', post = '';
  if (at < 0) {
    pre = text.slice(0, typed);
  } else {
    pre = text.slice(0, Math.min(typed, at));
    if (typed > at) mid = text.slice(at, Math.min(typed, hlEnd));
    if (typed > hlEnd) post = text.slice(hlEnd, typed);
  }

  return (
    <figure className="quote-item active">
      <div className="quote-mark" aria-hidden="true">“</div>
      <blockquote className="quote-text">
        {pre}{mid && <span className="hl">{mid}</span>}{post}
        <span className={'type-caret' + (done ? ' done' : '')} aria-hidden="true" />
      </blockquote>
      <figcaption className="quote-author" style={{ opacity: done ? 1 : 0 }}>
        <span className="rule" /><b>{q.author}</b><span>·&nbsp;{q.role}</span>
      </figcaption>
    </figure>
  );
}

function Quotes() {
  const [i, setI] = useStateE(0);
  const [paused, setPaused] = useStateE(false);
  const QUOTES = (window.CONTENT && window.CONTENT.quotes) || [];
  const head = (window.CONTENT && window.CONTENT.quotesHead) || {};
  if (!QUOTES.length) return null;
  const q = QUOTES[Math.min(i, QUOTES.length - 1)];

  const advance = useCallbackE(() => setI((p) => (p + 1) % QUOTES.length), [QUOTES.length]);
  // Stable element so parent re-renders (on quote change) don't restart the
  // background animation.
  const bg = useMemoE(() => <Atmos glows={[1, 3]} pattern="grid" drifting={true} />, []);

  return (
    <section className="sec quotes-sec bg-b" style={{ overflow: 'hidden' }}>
      {bg}
      <div className="wrap wrap-narrow" style={{ maxWidth: 1000 }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="eyebrow center">{head.eyebrow || 'Во что я верю'}</span>
        </div>
        <div className="quotes-stage">
          <QuoteBody key={i} q={q} paused={paused} onAdvance={advance} />
        </div>
        <div className="quote-dots">
          {QUOTES.map((_, idx) => (
            <button key={idx} className={'quote-dot' + (idx === i ? ' on' : '')}
              onClick={() => setI(idx)} aria-label={'Цитата ' + (idx + 1)} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- SectionWave: animated SVG wave divider between sections ----------
   INVARIANT (чтобы не появлялись чёрные/тёмные полосы на стыках):
   • `from` ДОЛЖЕН совпадать с фоном предыдущей секции, `to` — следующей.
   • Волна перекрывает оба соседних блока на 1px (marginTop/Bottom: -1):
     верхний 1px волны = `from` (= пред. блок), нижний 1px = `to` (= след. блок),
     поэтому перекрытие невидимо, но субпиксельная щель (через которую был
     виден фон страницы #08080a) закрыта. Не возвращать marginBottom к 0. */
function SectionWave({ from = '#08080a', to = '#0d0d0f', height = 88, speed = 15 }) {
  const gid = 'wv' + from.replace(/#/g, '') + to.replace(/#/g, '');
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden',
      background: from, flexShrink: 0, lineHeight: 0, marginTop: -1, marginBottom: -1, zIndex: 2 }}>
      <svg className="wave-svg" viewBox="0 0 2880 88" preserveAspectRatio="none"
        style={{ '--wave-spd': speed + 's', position: 'absolute', bottom: 0, left: 0, width: '200%', height: '100%' }}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-bright)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--accent-bright)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent-bright)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,44 C240,14 480,74 720,44 C960,14 1200,74 1440,44 C1680,14 1920,74 2160,44 C2400,14 2640,74 2880,44 L2880,88 L0,88 Z"
          fill={to} opacity="0.3" />
        <path d="M0,60 C360,30 720,88 1080,60 C1440,30 1800,88 2160,60 C2520,30 2880,88 2880,60 L2880,88 L0,88 Z"
          fill={to} />
        <path d="M0,60 C360,30 720,88 1080,60 C1440,30 1800,88 2160,60 C2520,30 2880,88 2880,60"
          fill="none" stroke={`url(#${gid})`} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

Object.assign(window, { Atmos, Quotes, SectionWave });
