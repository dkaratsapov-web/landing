/* services-process-cases.jsx — Services (3 variants), Why, Process, Cases. */
const { useState: useStateB, useRef: useRefB, useEffect: useEffectB } = React;

/* Responsive column count for the masonry services layout. Distributing the
   cards into independent columns means expanding one card only pushes the
   cards below it in the same column — no empty gaps next to short siblings. */
function useColumns() {
  const [cols, setCols] = useStateB(3);
  useEffectB(() => {
    const calc = () => {
      const w = window.innerWidth;
      setCols(w >= 1180 ? 3 : w >= 760 ? 2 : 1);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return cols;
}
const ICONS_MAP = {
  IconTarget, IconUsers, IconMonitor, IconChart, IconLayers, IconPhone, IconSearch,
  IconMap, IconBolt, IconHandshake, IconEye, IconShield
};
const Glyph = ({ name, size }) => {const C = ICONS_MAP[name] || IconBolt;return <C size={size} />;};

/* ---------------- SERVICES ---------------- */
function ServiceHead() {
  return (
    <div className="reveal" style={{ maxWidth: 720, marginBottom: 56 }}>
      <span className="eyebrow">Что я делаю</span>
      <h2 className="section-title">Пять направлений.<br />Один ответственный — я</h2>
      <p className="lead" style={{ marginTop: 22 }}>
        Не «полный спектр услуг», а конкретные инструменты под вашу задачу. Беру то, что принесёт заявки.
      </p>
    </div>);

}

function ServiceCard({ s, i }) {
  const [open, setOpen] = useStateB(false);
  const [h, setH] = useStateB(0);
  const innerRef = useRefB(null);
  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      setH(next && innerRef.current ? innerRef.current.scrollHeight : 0);
      return next;
    });
  };
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    e.currentTarget.style.setProperty('--my', (e.clientY - r.top) + 'px');
  };
  return (
    <article className={'card svc-x reveal' + (open ? ' open' : '')} onMouseMove={onMove}
      style={{ transitionDelay: i * 50 + 'ms' }}>
      <button className="svc-x-head" onClick={toggle} aria-expanded={open}>
        <span className="icon-tile svc-x-icon"><Glyph name={s.icon} size={24} /></span>
        <span className="svc-x-titles">
          <span className="svc-x-name">{s.name}</span>
          <span className="svc-x-tag">{s.tag}</span>
        </span>
        <span className={'svc-x-chev' + (open ? ' open' : '')}><IconChevron size={20} /></span>
      </button>
      <p className="svc-x-result">{s.result}</p>
      <div className="svc-x-body" style={{ maxHeight: h }}>
        <div ref={innerRef} className="svc-x-inner">
          <div className="svc-x-label">Что входит</div>
          <ul className="svc-x-list">
            {s.works.map((w, k) => <li key={k}><IconCheck size={16} />{w}</li>)}
          </ul>
          <div className="svc-x-meta">
            <div>
              <span className="svc-x-meta-label"><IconClock size={13} />Срок</span>
              <span className="svc-x-meta-val">{s.term}</span>
            </div>
            <div>
              <span className="svc-x-meta-label"><IconBolt size={13} />Стоимость</span>
              <span className="svc-x-meta-val accent">{s.price}</span>
            </div>
          </div>
        </div>
      </div>
      <button className="svc-x-toggle" onClick={toggle} aria-expanded={open}>
        {open ? 'Свернуть' : 'Что входит, сроки и цена'}
        <IconChevron size={16} />
      </button>
    </article>);

}

function ServicesGrid() {
  const cols = useColumns();
  const columns = Array.from({ length: cols }, () => []);
  SERVICES.forEach((s, i) => columns[i % cols].push({ s, i }));
  return (
    <section id="services" className="sec bg-pg">
      <div className="wrap">
        <ServiceHead />
        <div className="svc-x-cols" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {columns.map((col, c) =>
          <div key={c} className="svc-x-col" style={{ flex: 1, minWidth: 0,
            display: 'flex', flexDirection: 'column', gap: 20 }}>
              {col.map(({ s, i }) => <ServiceCard key={i} s={s} i={i} />)}
            </div>
          )}
        </div>
      </div>
    </section>);

}

function ServicesRows() {
  return (
    <section id="services" className="sec bg-pg">
      <div className="wrap">
        <ServiceHead />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SERVICES.map((s, i) =>
          <article key={i} className="reveal svc-row" style={{ display: 'grid',
            gridTemplateColumns: '64px 1fr 1.1fr', gap: 28, alignItems: 'center',
            padding: '30px 0', borderTop: '1px solid var(--line)', transitionDelay: i * 40 + 'ms' }}>
              <span className="icon-tile"><Glyph name={s.icon} size={24} /></span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>{s.name}</h3>
                <div style={{ color: 'var(--accent-bright)', fontSize: 14, marginTop: 6 }}>{s.tag}</div>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 17, lineHeight: 1.5 }}>{s.result}</p>
            </article>
          )}
          <div style={{ borderTop: '1px solid var(--line)' }} />
        </div>
      </div>
    </section>);

}

function ServicesFeature() {
  const [active, setActive] = useStateB(0);
  const s = SERVICES[active];
  return (
    <section id="services" className="sec bg-pg">
      <div className="wrap">
        <ServiceHead />
        <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 40 }}>
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SERVICES.map((it, i) =>
            <button key={i} onClick={() => setActive(i)}
            style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer',
              background: i === active ? 'var(--tile-card)' : 'transparent',
              border: '1px solid', borderColor: i === active ? 'var(--line-strong)' : 'transparent',
              borderRadius: 'var(--r-md)', padding: '18px 20px', color: 'var(--txt)',
              transition: 'all .2s ease' }}>
                <span style={{ color: i === active ? 'var(--accent-bright)' : 'var(--txt-3)', flex: '0 0 auto' }}>
                  <Glyph name={it.icon} size={22} />
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600,
                color: i === active ? 'var(--txt)' : 'var(--txt-2)' }}>{it.name}</span>
                {i === active && <span style={{ marginLeft: 'auto', color: 'var(--accent-bright)' }}><IconArrowRight size={18} /></span>}
              </button>
            )}
          </div>
          <div className="reveal card" style={{ padding: 44, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', minHeight: 320 }}>
            <span className="icon-tile" style={{ width: 60, height: 60 }}><Glyph name={s.icon} size={28} /></span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em',
              margin: '24px 0 8px' }}>{s.name}</h3>
            <div style={{ color: 'var(--accent-bright)', fontSize: 16 }}>{s.tag}</div>
            <p className="lead" style={{ marginTop: 20 }}>{s.result}</p>
          </div>
        </div>
      </div>
    </section>);

}

function Services({ variant }) {
  if (variant === 'rows') return <ServicesRows />;
  if (variant === 'feature') return <ServicesFeature />;
  return <ServicesGrid />;
}

/* ---------------- WHY ---------------- */
function Why() {
  return (
    <section className="sec bg-b">
      <div className="wrap">
        <div className="reveal" style={{ maxWidth: 680, marginBottom: 52 }}>
          <span className="eyebrow">Почему работают со мной</span>
          <h2 className="section-title">Без агентской анонимности</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {WHY.map((w, i) =>
          <div key={i} className="reveal" style={{ transitionDelay: i * 60 + 'ms' }}>
              <span className="icon-tile" style={{ width: 56, height: 56 }}><Glyph name={w.icon} size={26} /></span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 23, fontWeight: 600, letterSpacing: '-0.01em', margin: '22px 0 12px', color: "rgb(255, 255, 255)" }}>{w.title}</h3>
              <p className="muted" style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>{w.desc}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ---------------- PROCESS ---------------- */
function Process() {
  return (
    <section id="process" className="sec bg-pg">
      <div className="wrap">
        <div className="reveal" style={{ maxWidth: 680, marginBottom: 56 }}>
          <span className="eyebrow">Как я работаю</span>
          <h2 className="section-title">Прозрачно, по шагам</h2>
          <p className="lead" style={{ marginTop: 22 }}>Вы всегда понимаете, на каком этапе проект и что я делаю прямо сейчас.</p>
        </div>
        <div className="proc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
          {PROCESS.map((p, i) =>
          <div key={i} className="reveal proc-step" style={{ transitionDelay: i * 60 + 'ms', position: 'relative',
            padding: '0 22px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ color: 'var(--accent-bright)' }}><Glyph name={p.icon} size={22} /></span>
                <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--txt-3)',
              letterSpacing: '0.06em', marginBottom: 10 }}>{p.n}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 10px', color: 'var(--txt)' }}>{p.title}</h3>
              <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ---------------- CASES (expandable, with photo + featured) ---------------- */
function CaseCard({ c, idx, open, onToggle, featured }) {
  const stop = (e) => e.stopPropagation();
  return (
    <article className={'card case-card reveal' + (featured ? ' featured' : '')} style={{ transitionDelay: idx * 50 + 'ms' }}>
      <div className="case-head" role="button" tabIndex={0} onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}>
        <div className="case-thumb" onClick={stop}>
          <image-slot id={'case-photo-' + idx} src={c.photo} placeholder="Фото проекта" shape="rounded" radius="11"></image-slot>
        </div>
        <div>
          <div style={{ color: 'var(--txt-3)', fontSize: 13, marginBottom: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {featured && <span className="chip accent" style={{ padding: '4px 11px', fontSize: 12 }}>Кейс месяца</span>}
            <span>{c.field}</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: featured ? 30 : 24, fontWeight: 600, letterSpacing: '-0.01em', margin: 0, color: 'var(--txt)' }}>{c.client}</h3>
          <p className="muted" style={{ margin: '12px 0 0', fontSize: featured ? 17 : 16, lineHeight: 1.5, maxWidth: 560 }}>{c.summary}</p>
        </div>
        <div className="case-metric" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div className="case-metric-num">{c.metric}</div>
            <div style={{ color: 'var(--txt-2)', fontSize: 13, marginTop: 4, maxWidth: 150 }}>{c.metricLabel}</div>
          </div>
          <span className={'case-chevron' + (open ? ' open' : '')}><IconChevron size={22} /></span>
        </div>
      </div>
      <div className="case-body" style={{ maxHeight: open ? 420 : 0 }}>
        <div style={{ padding: '4px 24px 28px', borderTop: '1px solid var(--line)', marginTop: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 18, paddingTop: 24 }}>
            {c.details.map(([k, v], i) =>
            <div key={i}>
                <div style={{ color: 'var(--txt-3)', fontSize: 13, marginBottom: 6 }}>{k}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--txt)' }}>{v}</div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 24, color: 'var(--txt-2)', fontSize: 14, fontStyle: 'italic', borderLeft: '2px solid var(--accent-soft-bd)', paddingLeft: 14 }}>
            {c.note}
          </div>
        </div>
      </div>
    </article>);

}

function Cases({ onCta }) {
  const [open, setOpen] = useStateB(0);
  return (
    <section id="cases" className="sec bg-b" style={{ overflow: 'hidden' }}>
      <Atmos glows={[1, 2, 3]} pattern="dots" />
      <div className="wrap">
        <div className="reveal" style={{ maxWidth: 780, marginBottom: 48 }}>
          <span className="eyebrow">Кейсы · доказательства</span>
          <h2 className="section-title">Результат в цифрах,<br />а не в красивых отчётах</h2>
          <p className="lead" style={{ marginTop: 22 }}>Раскройте карточку — внутри метрики, сроки и каналы. Без «мы реализовали»: я реализовал.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {CASES.map((c, i) =>
          <CaseCard key={i} c={c} idx={i} featured={i === 0} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          )}
        </div>
        <div className="reveal" style={{ marginTop: 40 }}>
          <a className="btn btn-fill btn-lg" href="#contacts" onClick={(e) => {e.preventDefault();onCta();}}>
            Обсудить похожую задачу<IconArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>);

}

Object.assign(window, { Services, Why, Process, Cases });