/* extras.jsx — animated background atmosphere + rotating quotes. Exported to window. */
const { useState: useStateE, useEffect: useEffectE, useRef: useRefE } = React;

/* ---------- Atmos: drifting glows + pattern, sits behind a section ---------- */
function Atmos({ glows = [1, 2], pattern = 'dots', drifting = false }) {
  return (
    <div className="atmos" aria-hidden="true">
      {pattern && <div className={'pattern pattern-' + pattern + (drifting ? ' drifting' : '')} />}
      {glows.map((g) => <div key={g} className={'glow g' + g} />)}
    </div>
  );
}

/* ---------- Quotes: auto-rotating, animated ---------- */
const QUOTES = [
  { parts: [['Цель маркетинга — ', false], ['сделать продажи излишними', true], ['.', false]],
    author: 'Питер Друкер', role: 'теоретик менеджмента' },
  { parts: [['Ваш бренд — это то, что ', false], ['о вас говорят, когда вас нет в комнате', true], ['.', false]],
    author: 'Джефф Безос', role: 'основатель Amazon' },
  { parts: [['Если это ', false], ['не продаёт', true], [' — это не креатив.', false]],
    author: 'Дэвид Огилви', role: '«отец рекламы»' },
  { parts: [['Будьте ', false], ['эталоном качества', true], [' — не все привыкли к среде, где ждут совершенства.', false]],
    author: 'Стив Джобс', role: 'сооснователь Apple' },
];

function Quotes() {
  const [i, setI] = useStateE(0);
  const [typed, setTyped] = useStateE(0);
  const [paused, setPaused] = useStateE(false);
  const q = QUOTES[i];

  // Flatten the quote into a list of [char, isHighlighted] for the typewriter.
  const chars = [];
  q.parts.forEach(([txt, hl]) => { for (const ch of txt) chars.push([ch, hl]); });
  const total = chars.length;
  const done = typed >= total;

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
  }, [i, total]);

  // Once typed (and not hovered), hold for a beat, then advance to the next.
  useEffectE(() => {
    if (!done || paused) return;
    const id = setTimeout(() => setI((p) => (p + 1) % QUOTES.length), 2800);
    return () => clearTimeout(id);
  }, [done, paused]);

  return (
    <section className="sec quotes-sec bg-b" style={{ overflow: 'hidden' }}>
      <Atmos glows={[1, 3]} pattern="grid" drifting={true} />
      <div className="wrap wrap-narrow" style={{ maxWidth: 1000 }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="eyebrow center">Во что я верю</span>
        </div>
        <div className="quotes-stage">
          <figure className="quote-item active">
            <div className="quote-mark" aria-hidden="true">“</div>
            <blockquote className="quote-text">
              {chars.slice(0, typed).map(([ch, hl], k) =>
                hl ? <span key={k} className="hl">{ch}</span> : <React.Fragment key={k}>{ch}</React.Fragment>
              )}
              <span className={'type-caret' + (done ? ' done' : '')} aria-hidden="true" />
            </blockquote>
            <figcaption className="quote-author" style={{ opacity: done ? 1 : 0 }}>
              <span className="rule" /><b>{q.author}</b><span>·&nbsp;{q.role}</span>
            </figcaption>
          </figure>
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

/* ---------- SectionWave: animated SVG wave divider between sections ---------- */
function SectionWave({ from = '#08080a', to = '#0d0d0f', height = 88, speed = 15 }) {
  const gid = 'wv' + from.replace(/#/g, '') + to.replace(/#/g, '');
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden',
      background: from, flexShrink: 0, lineHeight: 0, marginTop: -36, marginBottom: 0, zIndex: 2 }}>
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
