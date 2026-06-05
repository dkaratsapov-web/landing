/* services-process-cases.jsx — Services (3 variants), Why, Process, Cases. */
const { useState: useStateB, useRef: useRefB, useEffect: useEffectB } = React;
const ICONS_MAP = {
  IconTarget, IconUsers, IconMonitor, IconChart, IconLayers, IconPhone, IconSearch,
  IconMap, IconBolt, IconHandshake, IconEye, IconShield
};
const Glyph = ({ name, size }) => {const C = ICONS_MAP[name] || IconBolt;return <C size={size} />;};

/* Подсказка-призыв «листайте» — видна только на мобильных над каруселями. */
function SwipeHint() {
  return (
    <div className="swipe-hint" aria-hidden="true">
      <span>Листайте</span><IconArrowRight size={16} />
    </div>
  );
}

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

function ServiceCard({ s, open, onToggle }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    e.currentTarget.style.setProperty('--my', (e.clientY - r.top) + 'px');
  };
  return (
    <article className={'card svc-x' + (open ? ' open' : '')} onMouseMove={onMove}>
      <button className="svc-x-head" onClick={onToggle} aria-expanded={open}>
        <span className="icon-tile svc-x-icon"><Glyph name={s.icon} size={24} /></span>
        <span className="svc-x-titles">
          <span className="svc-x-name">{s.name}</span>
          <span className="svc-x-tag">{s.tag}</span>
        </span>
        <span className="svc-x-result">{s.result}</span>
        <span className={'svc-x-chev' + (open ? ' open' : '')}><IconChevron size={22} /></span>
      </button>
      <div className="svc-x-body">
        <div className="svc-x-clip">
          <div className="svc-x-inner">
            <div className="svc-x-detail">
              <div className="svc-x-works">
                <div className="svc-x-label">Что входит</div>
                <ul className="svc-x-list">
                  {s.works.map((w, k) => <li key={k}><IconCheck size={16} />{w}</li>)}
                </ul>
              </div>
              <div className="svc-x-aside">
                <div className="svc-x-meta-row">
                  <span className="svc-x-meta-label"><IconClock size={14} />Срок</span>
                  <span className="svc-x-meta-val">{s.term}</span>
                </div>
                <div className="svc-x-meta-row">
                  <span className="svc-x-meta-label"><IconBolt size={14} />Стоимость</span>
                  <span className="svc-x-meta-val accent">{s.price}</span>
                </div>
                <a className="btn btn-fill btn-sm svc-x-cta" href="#contacts">
                  Обсудить задачу<IconArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>);

}

function ServicesGrid() {
  const [open, setOpen] = useStateB(-1);
  return (
    <section id="services" className="sec bg-pg">
      <div className="wrap">
        <ServiceHead />
        <SwipeHint />
        <div className="svc-x-stack" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SERVICES.map((s, i) =>
          <ServiceCard key={i} s={s} open={open === i}
            onToggle={() => setOpen(open === i ? -1 : i)} />
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

/* ---------------- CERTIFICATES ---------------- */
function Certificates() {
  const [open, setOpen] = useStateB(-1);
  const close = () => setOpen(-1);
  const step = (d) => setOpen((o) => (o + d + CERTS.length) % CERTS.length);
  useEffectB(() => {
    if (open < 0) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(-1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const c = open >= 0 ? CERTS[open] : null;
  return (
    <section id="certs" className="sec bg-b">
      <div className="wrap">
        <div className="reveal" style={{ maxWidth: 680, marginBottom: 48 }}>
          <span className="eyebrow">Подтверждённая экспертиза</span>
          <h2 className="section-title">Мои сертификаты</h2>
          <p className="lead" style={{ marginTop: 22 }}>
            Официальные сертификации Яндекса и партнёрский статус Roistat. Нажмите на сертификат, чтобы открыть его в полном размере.
          </p>
        </div>
        <SwipeHint />
        <div className="cert-grid">
          {CERTS.map((it, i) =>
          <button key={i} type="button" className="cert-card" onClick={() => setOpen(i)} aria-label={'Открыть: ' + it.title}>
              <span className="cert-thumb">
                <img src={it.img} alt={it.title} loading="lazy" decoding="async" />
                <span className="cert-zoom"><IconSearch size={20} /></span>
              </span>
              <span className="cert-meta">
                <span className="cert-title">{it.title}</span>
                <span className="cert-issuer">{it.issuer}</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {c &&
      <div className="cert-lb" onClick={close} role="dialog" aria-modal="true">
        <button className="cert-lb-close" onClick={close} aria-label="Закрыть"><IconClose size={26} /></button>
        <button className="cert-lb-nav prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Предыдущий"><IconChevron size={28} /></button>
        <div className="cert-lb-stage" onClick={(e) => e.stopPropagation()}>
          <img src={c.img} alt={c.title} />
          <div className="cert-lb-bar">
            <div>
              <div className="cert-lb-title">{c.title}</div>
              <div className="cert-lb-sub">{c.issuer}</div>
            </div>
            <a className="btn btn-fill btn-sm" href={c.file} target="_blank" rel="noopener">
              Открыть PDF<IconArrowRight size={16} />
            </a>
          </div>
        </div>
        <button className="cert-lb-nav next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Следующий"><IconChevron size={28} /></button>
      </div>}
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
        <SwipeHint />
        <div className="proc-grid proc-chain" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
          {PROCESS.map((p, i) =>
          <div key={i} className="reveal proc-step" style={{ transitionDelay: i * 60 + 'ms', position: 'relative',
            padding: '0 22px 0 0', '--i': i }}>
              <div className="proc-node-row">
                <span className="proc-node"><Glyph name={p.icon} size={20} /></span>
                {i < PROCESS.length - 1 &&
                  <span className="proc-link"><span className="proc-link-flow" /></span>}
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
    <section id="cases" className="sec bg-b" style={{ overflow: 'hidden', marginTop: -1 }}>
      <Atmos glows={[1, 2, 3]} pattern="dots" />
      <div className="wrap">
        <div className="reveal" style={{ maxWidth: 780, marginBottom: 48 }}>
          <span className="eyebrow">Кейсы · доказательства</span>
          <h2 className="section-title">Результат в цифрах,<br />а не в красивых отчётах</h2>
          <p className="lead" style={{ marginTop: 22 }}>Раскройте карточку — внутри метрики, сроки и каналы. Без «мы реализовали»: я реализовал.</p>
        </div>
        <SwipeHint />
        <div className="case-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

Object.assign(window, { Services, Certificates, Process, Cases });