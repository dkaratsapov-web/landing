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

/* ---------- Quotes: auto-rotating, animated (content from CONTENT.quotes) ---------- */
/* Each quote in content.json is { text, hl, author, role }; hl is the substring
   to highlight. Convert to [char, isHighlighted] pairs for the typewriter. */
function quoteChars(q) {
  const t = (q && q.text) || '';
  const hl = (q && q.hl) || '';
  const at = hl ? t.indexOf(hl) : -1;
  const chars = [];
  for (let k = 0; k < t.length; k++) {
    chars.push([t[k], at >= 0 && k >= at && k < at + hl.length]);
  }
  return chars;
}

function Quotes() {
  const [i, setI] = useStateE(0);
  const [typed, setTyped] = useStateE(0);
  const [paused, setPaused] = useStateE(false);
  const QUOTES = (window.CONTENT && window.CONTENT.quotes) || [];
  const head = (window.CONTENT && window.CONTENT.quotesHead) || {};
  if (!QUOTES.length) return null;
  const q = QUOTES[Math.min(i, QUOTES.length - 1)];

  const chars = quoteChars(q);
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
    <section className="sec quotes-sec bg-b" style={{ overflow: 'clip' }}>
      <div className="wrap wrap-narrow" style={{ maxWidth: 1000 }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="eyebrow center">{head.eyebrow || 'Во что я верю'}</span>
        </div>
        <div className="quotes-stage">
          <figure className="quote-item active">
            <div className="quote-mark" aria-hidden="true">“</div>
            <blockquote className="quote-text">
              {chars.map(([ch, hl], k) => {
                const vis = k < typed;
                return (
                  <React.Fragment key={k}>
                    {k === typed && <span className="type-caret" aria-hidden="true" />}
                    {hl
                      ? <span className="hl" style={{ opacity: vis ? 1 : 0, transition: vis ? 'opacity 0.08s' : 'none' }}>{ch}</span>
                      : <span style={{ opacity: vis ? 1 : 0, transition: vis ? 'opacity 0.08s' : 'none' }}>{ch}</span>}
                  </React.Fragment>
                );
              })}
              {done && <span className="type-caret done" aria-hidden="true" />}
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

/* ---------- SectionWave: animated SVG wave divider between sections ----------
   INVARIANT (чтобы не появлялись чёрные/тёмные полосы на стыках):
   • `from` ДОЛЖЕН совпадать с фоном предыдущей секции, `to` — следующей.
   • Волна перекрывает оба соседних блока на 1px (marginTop/Bottom: -1):
     верхний 1px волны = `from` (= пред. блок), нижний 1px = `to` (= след. блок),
     поэтому перекрытие невидимо, но субпиксельная щель (через которую был
     виден фон страницы #08080a) закрыта. Не возвращать marginBottom к 0.

   • ambient — для стыка под секцией, у которой поверх фона лежат свечения или
     паттерн (сейчас это только герой). Инварианта «from = фон предыдущего
     блока» там мало: фон героя объявлен как #08080a, но свечение и сетка
     поднимают его фактический тон до rgb(10,10,12), и на границе секции этот
     подъём обрывается — ниже идут ровно 88px плоского #08080a, которые
     читаются как чёрная полоса перед волной. Замер по колонке пикселей:
     10,10,12 над границей → 8,8,10 сразу под ней и до самой волны.
     Флаг добавляет затухающий подхват тона, и ступенька исчезает.
     На плоских секциях его включать нельзя — там он сам создаст полосу. */
let waveSeq = 0;
function SectionWave({ from = '#08080a', to = '#0d0d0f', height = 88, speed = 15, ambient = false }) {
  /* Счётчик, а не хеш от цветов: пара from/to повторяется на странице по
     три раза, и id градиента выходил одинаковым. Дублирующийся id — это
     невалидный документ и сломанное дерево доступности: проверка агентного
     просмотра Яндекса на этом и спотыкалась. Плюс браузер связывает
     fill="url(#id)" с первым найденным узлом, так что вторая и третья волна
     подхватывали чужой градиент. */
  const gid = React.useMemo(() => 'wv' + (++waveSeq), []);
  return (
    <div className="wave-wrap" style={{ position: 'relative', height, overflow: 'clip',
      background: 'transparent', flexShrink: 0, lineHeight: 0, marginTop: -1, marginBottom: -1, zIndex: 2 }}>
      {/* Подхват тона идёт до <svg>, а не после: волна должна рисоваться
          поверх него, иначе подъём ляжет на саму кривую и осветлит её. */}
      {ambient && (
        <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.010), rgba(255,255,255,0) 72%)' }} />
      )}
      <svg className="wave-svg" viewBox="0 0 2880 88" preserveAspectRatio="none"
        style={{ '--wave-spd': speed + 's', position: 'absolute', bottom: 0, left: 0, width: '200%', height: '100%' }}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-bright)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--accent-bright)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent-bright)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Заливки под кривой рисуются только тогда, когда тона секций
            действительно разные. Сейчас фон на сайте единый, from === to, и
            эти два пути не добавляют ничего, кроме собственного сглаживания:
            над кривой оставалась полоса в шесть пикселей тоном ниже фона.
            Заметить её глазом почти нельзя, но пиксельная проверка находит
            стабильно — а держать невидимый слой ради артефакта незачем.
            Возможность развести тона при этом сохраняется. */}
        {from !== to && <>
          <path d="M0,44 C240,14 480,74 720,44 C960,14 1200,74 1440,44 C1680,14 1920,74 2160,44 C2400,14 2640,74 2880,44 L2880,88 L0,88 Z"
            fill={to} opacity="0.3" />
          <path d="M0,60 C360,30 720,88 1080,60 C1440,30 1800,88 2160,60 C2520,30 2880,88 2880,60 L2880,88 L0,88 Z"
            fill={to} />
        </>}
        <path d="M0,60 C360,30 720,88 1080,60 C1440,30 1800,88 2160,60 C2520,30 2880,88 2880,60"
          fill="none" stroke={`url(#${gid})`} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

Object.assign(window, { Atmos, Quotes, SectionWave });
