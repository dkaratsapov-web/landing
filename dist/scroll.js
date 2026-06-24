/* scroll.js — фундамент «дорогого» скролла: Lenis (плавная инерция) + GSAP
   ScrollTrigger (reveal / параллакс по прогрессу секций). Подключается
   отдельным <script defer> ПОСЛЕ Lenis/GSAP с CDN. Если CDN не загрузился
   или включён prefers-reduced-motion — тихо откатывается на нативный скролл.

   Разметка-хуки (добавляются точечно в JSX):
     [data-gsap-parallax="8"]  — мягкий вертикальный параллакс (проценты), scrub
     [data-gsap-reveal]        — плавное появление по скроллу (GSAP ease-out)
   Существующие CSS-reveal (IntersectionObserver) продолжают работать как есть. */
(() => {
  'use strict';
  const reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // нативный скролл, никаких анимаций

  function start() {
    if (!window.Lenis) return; // CDN не дошёл → нативный скролл, сайт работает

    const lenis = new Lenis({
      lerp: 0.09,            // инерция: ниже = «тяжелее»/плавнее
      wheelMultiplier: 1,
      smoothWheel: true,
      // на тач-устройствах Lenis по умолчанию отдаёт нативный скролл — это
      // правильно для перформанса на мобиле.
    });
    window.__lenis = lenis;

    const hasGsap = !!(window.gsap && window.ScrollTrigger);
    if (hasGsap) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    /* Останавливаем инерцию под открытой модалкой (все модалки ставят
       body.overflow:hidden) — иначе фон скроллится сквозь оверлей. */
    const syncModal = () => {
      const hidden = getComputedStyle(document.body).overflow === 'hidden';
      if (hidden) lenis.stop(); else lenis.start();
    };
    if (window.MutationObserver) {
      new MutationObserver(syncModal)
        .observe(document.body, { attributes: true, attributeFilter: ['style'] });
    }

    if (!hasGsap) return;

    /* ---- GSAP: параллакс + reveal по прогрессу секции ---- */
    const bound = new WeakSet();
    function bind() {
      document.querySelectorAll('[data-gsap-parallax]').forEach((el) => {
        if (bound.has(el)) return; bound.add(el);
        const amt = parseFloat(el.getAttribute('data-gsap-parallax')) || 8;
        gsap.fromTo(el, { yPercent: amt * 0.6 }, {
          yPercent: -amt, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });
      document.querySelectorAll('[data-gsap-reveal]').forEach((el) => {
        if (bound.has(el)) return; bound.add(el);
        gsap.fromTo(el, { autoAlpha: 0, y: 26 }, {
          autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        });
      });
    }
    bind();

    // React монтирует #root асинхронно — добиваем хуки после рендера.
    const root = document.getElementById('root');
    if (root && window.MutationObserver) {
      let t = 0;
      new MutationObserver(() => {
        clearTimeout(t);
        t = setTimeout(() => { bind(); ScrollTrigger.refresh(); }, 160);
      }).observe(root, { childList: true, subtree: true });
    }
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
