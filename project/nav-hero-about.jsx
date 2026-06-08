/* nav-hero-about.jsx — Nav, Hero (3 layout variants), About. Exported to window. */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const NAV_LINKS = [
  ['Услуги', '/kontekstnaya-reklama/', [
    ['Контекстная реклама', '/kontekstnaya-reklama/'],
    ['Разработка сайтов', '/razrabotka-sajtov/'],
    ['Таргетированная реклама', '/targetirovannaya-reklama/'],
    ['GEO-сервисы', '/geo-servisy/'],
  ]],
  ['Кейсы', '/keysy/'],
  ['Контакты', '/contacts/'],
];

/* Логотип — оригинальный SVG (бумажный самолётик #D6FF41, прозрачный фон). */
function BrandPlane() {
  return (
    <svg className="brand-plane" width="30" height="30" viewBox="0 0 50 50" fill="none" aria-hidden="true">
      <path d="M5 5L13.1505 42L27.1012 29.4506L12.6396 13.0136L34.6486 25.502L46 20.4601L5 5Z" fill="#D6FF41" />
      <path d="M35 29.0967L30.2839 45V29.6413L24.6612 23L35 29.0967ZM23 39.4725L27.4277 45V35.3329L23 39.4725Z" fill="#D6FF41" />
    </svg>
  );
}

function Nav({ onCta }) {
  const [scrolled, setScrolled] = useStateA(false);
  const [open, setOpen] = useStateA(false);
  useEffectA(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const go = (e, href) => { e.preventDefault(); setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="wrap">
        <a className="brand" href="#top" onClick={(e) => go(e, '#top')}>
          <BrandPlane />Даниил Карацапов
        </a>
        <div className="nav-links">
          {NAV_LINKS.map(([t, h, sub]) =>
            sub ? (
              <div key={h} className="nav-item-drop">
                <span className="nav-drop-trigger">
                  {t}<svg className="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <div className="nav-dropdown">
                  {sub.map(([st, sh]) =>
                    sh.startsWith('/') ? (
                      <a key={sh} href={sh} className="nav-drop-link">{st}</a>
                    ) : (
                      <a key={sh} href={sh} className="nav-drop-link" onClick={(e) => go(e, sh)}>{st}</a>
                    )
                  )}
                </div>
              </div>
            ) : h.startsWith('/') ? (
              <a key={h} href={h}>{t}</a>
            ) : (
              <a key={h} href={h} onClick={(e) => go(e, h)}>{t}</a>
            )
          )}
        </div>
        <div className="nav-actions">
          <a className="nav-ic nav-ic-tg" href="https://t.me/Daniil_065" target="_blank" rel="noopener" aria-label="Telegram">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.94 4.6 18.6 20.3c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.09-.56-.62-.2L5.8 13.06l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6L20.5 2.55c.9-.33 1.7.22 1.44 2.05Z"/></svg>
          </a>
          <a className="nav-ic nav-ic-max" href="https://max.ru/u/f9LHodD0cOKhyIzKq01tP4W7NPCgguZmr-6XQ2vXMOaCb3gg1L1a1m4PP0c" target="_blank" rel="noopener" aria-label="MAX">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12.4 3.5C16.9 3.5 20.5 6.9 20.5 11C20.5 15.1 16.9 18.5 12.4 18.5C11.3 18.5 10.2 18.3 9.3 17.9L5.6 19.8C5.2 20 4.8 19.6 4.9 19.2L5.7 15.9C4.8 14.6 4.3 12.9 4.3 11C4.3 6.9 7.9 3.5 12.4 3.5ZM13 7.5A3.1 3.1 0 1 0 13 13.7A3.1 3.1 0 1 0 13 7.5Z"/></svg>
          </a>
          <a className="btn btn-fill btn-sm nav-cta" href="#contacts"
             onClick={(e) => { e.preventDefault(); onCta(); }}>Обсудить задачу</a>
          <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Меню">
            {open ? <IconClose size={22} /> : <Icon paths={<><path d="M4 7h16M4 12h16M4 17h16" /></>} size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 68, left: 0, right: 0, background: 'rgba(8,8,10,0.96)',
          backdropFilter: 'blur(20px)', border: '1px solid var(--line)', borderRadius: 16,
          padding: '10px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4,
          boxShadow: '0 14px 40px rgba(0,0,0,0.5)' }}>
          {NAV_LINKS.map(([t, h, sub]) => (
            <React.Fragment key={h}>
              <a href={h} onClick={h.startsWith('/') ? (() => setOpen(false)) : ((e) => go(e, h))}
                 style={{ color: 'var(--txt)', textDecoration: 'none', fontSize: 18, padding: '12px 0',
                   borderBottom: sub ? 'none' : '1px solid var(--line)' }}>{t}</a>
              {sub && sub.map(([st, sh]) => (
                sh.startsWith('/') ? (
                  <a key={sh} href={sh}
                     style={{ color: 'var(--txt-2)', textDecoration: 'none', fontSize: 16, padding: '10px 0 10px 18px',
                       borderBottom: '1px solid var(--line)' }}>{st}</a>
                ) : (
                  <a key={sh} href={sh} onClick={(e) => go(e, sh)}
                     style={{ color: 'var(--txt-2)', textDecoration: 'none', fontSize: 16, padding: '10px 0 10px 18px',
                       borderBottom: '1px solid var(--line)' }}>{st}</a>
                )
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ---------------- HERO ---------------- */
function HeroTrust() {
  const trust = (window.CONTENT.hero && window.CONTENT.hero.trust) || [];
  return (
    <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 40 }}>
      {trust.map(([a, b], i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, letterSpacing: '-0.02em' }}>{a}</span>
          <span style={{ color: 'var(--txt-2)', fontSize: 14, marginTop: 2 }}>{b}</span>
        </div>
      ))}
    </div>
  );
}

const HERO_H = 'Маркетинг, который\u00A0делаю я\u00A0сам';
const HERO_SUB = 'Помогаю малому и среднему бизнесу привлекать клиентов через интернет. Без посредников, без анонимных команд и пустых отчётов.';

function HeroSplit({ portrait, onCta }) {
  const H = window.CONTENT.hero || {};
  return (
    <header id="top" className="bg-pg" style={{ paddingTop: 64, overflow: 'hidden' }}>
      <Atmos glows={[1, 3]} pattern="grid" drifting={true} />
      <div className="wrap hero-split-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56,
        alignItems: 'center', paddingTop: 32, paddingBottom: 60 }}>
        <div className="hero-copy">
          <span className="eyebrow reveal in">{H.eyebrow}</span>
          <h1 className="display reveal in" style={{ fontSize: 'clamp(40px, 6vw, 76px)' }}>
            {H.titleLine1}<br />{H.titleLine2} <span style={{ color: 'var(--accent-bright)' }}>{H.titleAccent}</span>
          </h1>
          <p className="lead reveal in" style={{ marginTop: 26, maxWidth: 480 }}>{H.sub}</p>
          <div className="reveal in" style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
            <a className="btn btn-fill btn-lg" href="#contacts" onClick={(e) => { e.preventDefault(); onCta(); }}>
              {H.ctaPrimary}<IconArrowRight size={18} />
            </a>
            <a className="btn btn-ghost btn-lg" href={H.telegramUrl} target="_blank" rel="noopener">
              <IconSend size={17} />{H.ctaTelegram}
            </a>
            <a className="btn btn-ghost btn-lg" href="https://max.ru/u/f9LHodD0cOKhyIzKq01tP4W7NPCgguZmr-6XQ2vXMOaCb3gg1L1a1m4PP0c" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12.4 3.5C16.9 3.5 20.5 6.9 20.5 11C20.5 15.1 16.9 18.5 12.4 18.5C11.3 18.5 10.2 18.3 9.3 17.9L5.6 19.8C5.2 20 4.8 19.6 4.9 19.2L5.7 15.9C4.8 14.6 4.3 12.9 4.3 11C4.3 6.9 7.9 3.5 12.4 3.5ZM13 7.5A3.1 3.1 0 1 0 13 13.7A3.1 3.1 0 1 0 13 7.5Z"/></svg>MAX
            </a>
          </div>
          <HeroTrust />
        </div>
        <div className="reveal in" style={{ position: 'relative' }}>
          <PortraitFrame portrait={portrait} />
        </div>
      </div>
    </header>
  );
}

function HeroOverlay({ portrait, onCta }) {
  return (
    <header id="top" className="bg-black" style={{ paddingTop: 64, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${portrait})`,
          backgroundSize: 'cover', backgroundPosition: 'center 22%', filter: 'saturate(0.96)' }} />
        <div style={{ position: 'absolute', inset: 0, background:
          'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 38%, rgba(0,0,0,0.82) 100%)' }} />
        <div className="wrap" style={{ position: 'relative', paddingTop: 64, paddingBottom: 100 }}>
          <span className="eyebrow reveal in">Даниил Карацапов · интернет-маркетолог</span>
          <h1 className="display reveal in" style={{ fontSize: 'clamp(40px, 7vw, 88px)', maxWidth: 900 }}>
            Маркетинг, который делаю <span style={{ color: 'var(--accent-bright)' }}>я сам</span>
          </h1>
          <p className="lead reveal in" style={{ marginTop: 24, maxWidth: 560, color: '#e6e6ea' }}>{HERO_SUB}</p>
          <div className="reveal in" style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
            <a className="btn btn-fill btn-lg" href="#contacts" onClick={(e) => { e.preventDefault(); onCta(); }}>
              Обсудить задачу<IconArrowRight size={18} />
            </a>
            <a className="btn btn-ghost btn-lg" href="https://t.me/Daniil_065" target="_blank" rel="noopener">
              <IconSend size={17} />Telegram
            </a>
            <a className="btn btn-ghost btn-lg" href="https://max.ru/u/f9LHodD0cOKhyIzKq01tP4W7NPCgguZmr-6XQ2vXMOaCb3gg1L1a1m4PP0c" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12.4 3.5C16.9 3.5 20.5 6.9 20.5 11C20.5 15.1 16.9 18.5 12.4 18.5C11.3 18.5 10.2 18.3 9.3 17.9L5.6 19.8C5.2 20 4.8 19.6 4.9 19.2L5.7 15.9C4.8 14.6 4.3 12.9 4.3 11C4.3 6.9 7.9 3.5 12.4 3.5ZM13 7.5A3.1 3.1 0 1 0 13 13.7A3.1 3.1 0 1 0 13 7.5Z"/></svg>MAX
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroEditorial({ portrait, onCta }) {
  return (
    <header id="top" className="bg-pg" style={{ paddingTop: 64, overflow: 'hidden' }}>
      <Atmos glows={[2, 3]} pattern="dots" />
      <div className="wrap" style={{ paddingTop: 70 }}>
        <span className="eyebrow reveal in">Даниил Карацапов · интернет-маркетолог</span>
        <h1 className="display reveal in" style={{ fontSize: 'clamp(42px, 8.5vw, 120px)', lineHeight: 0.98, letterSpacing: '-0.03em' }}>
          Маркетинг,<br />который делаю <span style={{ color: 'var(--accent-bright)' }}>я&nbsp;сам</span>
        </h1>
      </div>
      <div className="wrap two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end',
        paddingTop: 44 }}>
        <div className="reveal in">
          <PortraitFrame portrait={portrait} short />
        </div>
        <div className="reveal in" style={{ paddingBottom: 18 }}>
          <p className="lead" style={{ maxWidth: 460 }}>{HERO_SUB}</p>
          <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
            <a className="btn btn-fill btn-lg" href="#contacts" onClick={(e) => { e.preventDefault(); onCta(); }}>
              Обсудить задачу<IconArrowRight size={18} />
            </a>
            <a className="btn btn-ghost btn-lg" href="https://t.me/Daniil_065" target="_blank" rel="noopener">
              <IconSend size={17} />Telegram
            </a>
            <a className="btn btn-ghost btn-lg" href="https://max.ru/u/f9LHodD0cOKhyIzKq01tP4W7NPCgguZmr-6XQ2vXMOaCb3gg1L1a1m4PP0c" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12.4 3.5C16.9 3.5 20.5 6.9 20.5 11C20.5 15.1 16.9 18.5 12.4 18.5C11.3 18.5 10.2 18.3 9.3 17.9L5.6 19.8C5.2 20 4.8 19.6 4.9 19.2L5.7 15.9C4.8 14.6 4.3 12.9 4.3 11C4.3 6.9 7.9 3.5 12.4 3.5ZM13 7.5A3.1 3.1 0 1 0 13 13.7A3.1 3.1 0 1 0 13 7.5Z"/></svg>MAX
            </a>
          </div>
          <HeroTrust />
        </div>
      </div>
      <div style={{ height: 100 }} />
    </header>
  );
}

function PortraitFrame({ portrait, short }) {
  return (
    <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden',
      aspectRatio: short ? '4 / 3' : '4 / 4', background: 'var(--tile-c)',
      boxShadow: 'var(--product-shadow)', border: '1px solid var(--line)' }}>
      <img src={portrait} alt="Даниил Карацапов" loading="eager"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 18%' }} />
      <div style={{ position: 'absolute', left: 16, bottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="chip" style={{ background: 'rgba(8,8,10,0.6)', backdropFilter: 'blur(10px)' }}>
          <IconBolt size={14} />Веду проект лично
        </span>
      </div>
    </div>
  );
}

function Hero({ variant, portrait, onCta }) {
  if (variant === 'overlay') return <HeroOverlay portrait={portrait} onCta={onCta} />;
  if (variant === 'editorial') return <HeroEditorial portrait={portrait} onCta={onCta} />;
  return <HeroSplit portrait={portrait} onCta={onCta} />;
}

/* ---------------- ABOUT ---------------- */
function StatBlock({ s }) {
  const ref = useRefA(null);
  const [active, setActive] = useStateA(false);
  useEffectA(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); io.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const v = useCountUp(s.value, active);
  return (
    <div ref={ref}>
      <div className="stat-num"><span className="accent">{Math.round(v)}{s.suffix}</span></div>
      <div className="stat-label">{s.label}</div>
    </div>
  );
}

function About() {
  useReveal();
  const A = window.CONTENT.about || {};
  const paras = A.paragraphs || [];
  const chips = A.chips || [];
  const chipIcons = [IconMap, IconClock];
  return (
    <section id="about" className="sec bg-a">
      <div className="wrap two-col about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'stretch' }}>
        <div className="reveal about-col" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 40 }}>
          <div>
            <span className="eyebrow">{A.eyebrow}</span>
            <h2 className="section-title"><Lines text={A.heading} /></h2>
            {paras.map((p, i) =>
              <p className="lead" key={i} style={{ marginTop: i === 0 ? 26 : 18 }}>{p}</p>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
              {chips.map((ch, i) => {
                const Ic = chipIcons[i] || IconMap;
                return <span className="chip" key={i}><Ic size={15} />{ch}</span>;
              })}
            </div>
          </div>
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28,
            padding: '36px', background: 'var(--tile-card)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' }}>
            {STATS.map((s, i) => <StatBlock key={i} s={s} />)}
          </div>
        </div>
        <div className="reveal about-photo-wrap" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden',
          border: '1px solid var(--line)', background: 'var(--tile-b)', minHeight: 0 }}>
          <image-slot id="about-photo" src="assets/about-work.jpg" placeholder="Фото за работой" shape="rounded" radius="18" fit="cover" style={{ width: '100%', height: '100%', display: 'block' }}></image-slot>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero, About });

