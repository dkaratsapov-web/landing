/* nav-hero-about.jsx — Nav, Hero (3 layout variants), About. Exported to window. */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const NAV_LINKS = [
  ['Обо мне', '#about'], ['Услуги', '#services'], ['Как работаю', '#process'],
  ['Кейсы', '#cases'], ['Контакты', '#contacts'],
];

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
          <span className="dot">ДК</span>Даниил Карацапов
        </a>
        <div className="nav-links">
          {NAV_LINKS.map(([t, h]) => <a key={h} href={h} onClick={(e) => go(e, h)}>{t}</a>)}
        </div>
        <a className="btn btn-fill btn-sm nav-cta" href="#contacts"
           onClick={(e) => { e.preventDefault(); onCta(); }}>Обсудить задачу</a>
        <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Меню">
          {open ? <IconClose size={22} /> : <Icon paths={<><path d="M4 7h16M4 12h16M4 17h16" /></>} size={22} />}
        </button>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0, background: 'rgba(8,8,10,0.96)',
          backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line)', padding: '14px 22px 22px',
          display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(([t, h]) => (
            <a key={h} href={h} onClick={(e) => go(e, h)}
               style={{ color: 'var(--txt)', textDecoration: 'none', fontSize: 18, padding: '12px 0',
                 borderBottom: '1px solid var(--line)' }}>{t}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ---------------- HERO ---------------- */
function HeroTrust() {
  return (
    <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 40 }}>
      {[['С 2017', 'в маркетинге'], ['5 услуг', 'под вашу задачу'], ['24 ч', 'среднее время ответа']].map(([a, b], i) => (
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
  return (
    <header id="top" className="bg-pg" style={{ paddingTop: 64, overflow: 'hidden' }}>
      <Atmos glows={[1, 3]} pattern="grid" drifting={true} />
      <div className="wrap hero-split-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56,
        alignItems: 'center', padding: '40px 32px 80px' }}>
        <div className="hero-copy">
          <span className="eyebrow reveal in">Даниил Карацапов · интернет-маркетолог</span>
          <h1 className="display reveal in" style={{ fontSize: 'clamp(40px, 6vw, 76px)' }}>
            Маркетинг, который<br />делаю <span style={{ color: 'var(--accent-bright)' }}>я сам</span>
          </h1>
          <p className="lead reveal in" style={{ marginTop: 26, maxWidth: 480 }}>{HERO_SUB}</p>
          <div className="reveal in" style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
            <a className="btn btn-fill btn-lg" href="#contacts" onClick={(e) => { e.preventDefault(); onCta(); }}>
              Обсудить задачу<IconArrowRight size={18} />
            </a>
            <a className="btn btn-ghost btn-lg" href="https://t.me/Daniil_065" target="_blank" rel="noopener">
              <IconSend size={17} />Telegram
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
        <div className="wrap" style={{ position: 'relative', padding: '64px 32px 100px' }}>
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
      <div className="wrap" style={{ padding: '70px 32px 0' }}>
        <span className="eyebrow reveal in">Даниил Карацапов · интернет-маркетолог</span>
        <h1 className="display reveal in" style={{ fontSize: 'clamp(42px, 8.5vw, 120px)', lineHeight: 0.98, letterSpacing: '-0.03em' }}>
          Маркетинг,<br />который делаю <span style={{ color: 'var(--accent-bright)' }}>я&nbsp;сам</span>
        </h1>
      </div>
      <div className="wrap two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end',
        padding: '44px 32px 0' }}>
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
      aspectRatio: short ? '4 / 3' : '4 / 5', background: 'var(--tile-c)',
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
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); io.disconnect(); } }, { threshold: 0.5 });
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
  return (
    <section id="about" className="sec bg-a">
      <div className="wrap two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div className="reveal">
          <span className="eyebrow">Обо мне</span>
          <h2 className="section-title">Вы работаете<br />с конкретным человеком</h2>
          <p className="lead" style={{ marginTop: 26 }}>
            7+ лет я занимаюсь интернет-маркетингом. Каждый проект веду лично — от аудита до результата.
            Работаю с малым бизнесом, стартапами и локальными компаниями по всей России.
          </p>
          <p className="lead" style={{ marginTop: 18 }}>
            Никаких «наших специалистов» и менеджеров-посредников. Вы всегда знаете, кто делает вашу
            рекламу и почему она работает именно так. Я отвечаю за результат лично.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
            <span className="chip"><IconMap size={15} />Вся Россия, онлайн</span>
            <span className="chip"><IconClock size={15} />Отвечаю в течение дня</span>
          </div>
        </div>
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', aspectRatio: '4 / 3',
            border: '1px solid var(--line)', background: 'var(--tile-b)' }}>
            <image-slot id="about-photo" placeholder="Перетащите фото (Москва-Сити, MacBook)" shape="rounded" radius="18" fit="cover" style={{ width: '100%', height: '100%', display: 'block' }}></image-slot>
          </div>
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28,
            padding: '36px', background: 'var(--tile-card)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' }}>
            {STATS.map((s, i) => <StatBlock key={i} s={s} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero, About });
