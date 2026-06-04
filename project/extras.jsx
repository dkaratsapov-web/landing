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
  const [paused, setPaused] = useStateE(false);
  const timer = useRefE(null);

  useEffectE(() => {
    if (paused) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % QUOTES.length), 5800);
    return () => clearInterval(timer.current);
  }, [paused]);

  return (
    <section className="sec bg-b" style={{ overflow: 'hidden' }}>
      <Atmos glows={[1, 3]} pattern="grid" drifting={true} />
      <div className="wrap wrap-narrow" style={{ maxWidth: 1000 }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="eyebrow center">Во что я верю</span>
        </div>
        <div className="quotes-stage">
          {QUOTES.map((q, idx) => (
            <figure key={idx} className={'quote-item' + (idx === i ? ' active' : '')}>
              <div className="quote-mark" aria-hidden="true">“</div>
              <blockquote className="quote-text">
                {q.parts.map(([txt, hl], k) => hl ? <span key={k} className="hl">{txt}</span> : <React.Fragment key={k}>{txt}</React.Fragment>)}
              </blockquote>
              <figcaption className="quote-author">
                <span className="rule" /><b>{q.author}</b><span>·&nbsp;{q.role}</span>
              </figcaption>
            </figure>
          ))}
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

Object.assign(window, { Atmos, Quotes });
