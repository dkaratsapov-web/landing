/* scroll.js — движок «дорогого» скролла: Lenis (плавная инерция) + GSAP
   ScrollTrigger (параллакс, reveal, скраб по прогрессу секций) плюс
   указательные микровзаимодействия.

   Подключается отдельным <script defer> ПОСЛЕ Lenis/GSAP с CDN. Если CDN не
   дошёл или включён prefers-reduced-motion — тихо откатывается на нативный
   скролл, и сайт работает полностью.

   Разметочные хуки:
     [data-gsap-parallax="8"]   вертикальный параллакс (проценты), scrub
     [data-gsap-reveal]         появление по скроллу
     [data-gsap-stagger]        дети контейнера выезжают каскадом
     [data-tilt]                наклон карточки за курсором (только десктоп)
     [data-magnetic]            кнопка тянется к курсору (только десктоп)

   Прогресс-бар добавляется скриптом, разметка для него не нужна: нет JS —
   нет и полоски, вместо пустой висящей линии.

   Правило, которое тут важнее всего: ни один эффект не прячет контент
   безвозвратно. Элемент, уже попавший в первый экран, не затемняется —
   иначе при медленной загрузке GSAP пользователь увидит, как текст
   моргнул и исчез. */
(() => {
  'use strict';

  const reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  /* Указательные эффекты — только там, где есть настоящий курсор. На тач-
     экранах наклон карточки срабатывает от тапа и мешает скроллу. */
  const finePointer = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function start() {
    const hasLenis = !!window.Lenis;
    const hasGsap = !!(window.gsap && window.ScrollTrigger);

    let lenis = null;
    if (hasLenis) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
      window.__lenis = lenis;
    }

    if (hasGsap) {
      gsap.registerPlugin(ScrollTrigger);
      if (lenis) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      }
    } else if (lenis) {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    /* Инерцию под открытой модалкой выключаем: все модалки ставят
       body.overflow:hidden, иначе фон скроллится сквозь оверлей. */
    if (lenis && window.MutationObserver) {
      const syncModal = () => {
        const hidden = getComputedStyle(document.body).overflow === 'hidden';
        if (hidden) lenis.stop(); else lenis.start();
      };
      new MutationObserver(syncModal)
        .observe(document.body, { attributes: true, attributeFilter: ['style'] });
    }

    progressBar();
    if (finePointer) { bindPointer(); }
    if (!hasGsap) return;

    bindScroll();

    /* React монтирует #root асинхронно — добиваем хуки после рендера. */
    const root = document.getElementById('root');
    if (root && window.MutationObserver) {
      let t = 0;
      new MutationObserver(() => {
        clearTimeout(t);
        t = setTimeout(() => {
          bindScroll();
          if (finePointer) bindPointer();
          ScrollTrigger.refresh();
        }, 160);
      }).observe(root, { childList: true, subtree: true });
    }
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ---------- Полоска прогресса чтения ---------- */
  function progressBar() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let raf = 0;
    const draw = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    draw();
  }

  /* ---------- Что анимируем ----------
     Эффекты навешиваются по селекторам, а не по атрибутам в разметке: так
     один файл покрывает и React-главную, и статические страницы услуг,
     и не нужно расставлять хуки по десятку JSX-файлов.

     Сюда НЕ попадает то, у чего анимация появления уже есть: карточки
     кейсов (.kase, keyframes kaseIn со своей задержкой) и шаги процесса
     (.proc-step, .reveal с transitionDelay). Иначе элемент выезжал бы
     дважды и дёргался. */
  const STAGGER_SEL  = ['.cert-grid', '.svc-x-stack', '.stat-grid'];
  const PARALLAX_SEL = [['.atmos .glow', 7], ['.atmos .pattern', 4]];
  const MAGNETIC_SEL = ['.btn-fill.btn-lg'];
  const TILT_SEL     = ['.cert-card'];

  /* ---------- Скролл-эффекты ---------- */
  const boundScroll = new WeakSet();

  function inFirstScreen(el) {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.92;
  }

  /* Слоёный параллакс первого экрана. Слои едут вниз с разной скоростью,
     пока герой уходит за край: дальний быстрее, передний почти стоит.
     scrub:0 — позиция слоёв жёстко привязана к прокрутке, без догона;
     любое сглаживание здесь читается как лаг. */
  function bindHeroParallax() {
    const trigger = document.querySelector('[data-parallax-layers]');
    if (!trigger || boundScroll.has(trigger)) return;
    boundScroll.add(trigger);

    const tl = gsap.timeline({
      scrollTrigger: { trigger: trigger, start: '0% 0%', end: '100% 0%', scrub: 0 },
    });
    const layers = [['1', 70], ['2', 55], ['3', 40], ['4', 10]];
    layers.forEach(([layer, yPercent], i) => {
      const els = trigger.querySelectorAll('[data-parallax-layer="' + layer + '"]');
      if (!els.length) return;
      tl.to(els, { yPercent: yPercent, ease: 'none' }, i === 0 ? undefined : '<');
    });
  }

  function bindScroll() {
    bindHeroParallax();
    STAGGER_SEL.forEach((sel) => {
      document.querySelectorAll(sel).forEach((box) => box.setAttribute('data-gsap-stagger', ''));
    });
    PARALLAX_SEL.forEach(([sel, amt]) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.hasAttribute('data-gsap-parallax')) el.setAttribute('data-gsap-parallax', amt);
      });
    });

    document.querySelectorAll('[data-gsap-parallax]').forEach((el) => {
      if (boundScroll.has(el)) return; boundScroll.add(el);
      const amt = parseFloat(el.getAttribute('data-gsap-parallax')) || 8;
      gsap.fromTo(el, { yPercent: amt * 0.6 }, {
        yPercent: -amt, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    });

    document.querySelectorAll('[data-gsap-reveal]').forEach((el) => {
      if (boundScroll.has(el)) return; boundScroll.add(el);
      if (inFirstScreen(el)) return;   // уже на экране — не трогаем, иначе моргнёт
      gsap.fromTo(el, { autoAlpha: 0, y: 26 }, {
        autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
    });

    document.querySelectorAll('[data-gsap-stagger]').forEach((box) => {
      if (boundScroll.has(box)) return; boundScroll.add(box);
      if (inFirstScreen(box)) return;
      const kids = Array.prototype.filter.call(box.children, (k) => k.nodeType === 1);
      if (!kids.length) return;
      gsap.fromTo(kids, { autoAlpha: 0, y: 30 }, {
        autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: box, start: 'top 85%', once: true },
      });
    });
  }

  /* ---------- Указательные микровзаимодействия ---------- */
  const boundPointer = new WeakSet();

  function bindPointer() {
    TILT_SEL.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.hasAttribute('data-tilt')) el.setAttribute('data-tilt', '5');
      });
    });
    MAGNETIC_SEL.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.hasAttribute('data-magnetic')) el.setAttribute('data-magnetic', '0.18');
      });
    });

    document.querySelectorAll('[data-tilt]').forEach((el) => {
      if (boundPointer.has(el)) return; boundPointer.add(el);
      const max = parseFloat(el.getAttribute('data-tilt')) || 6;
      /* Перспектива задаётся самому элементу через GSAP: CSS-свойство
         perspective действует на детей, а крутим мы саму карточку. */
      if (window.gsap) gsap.set(el, { transformPerspective: 900, transformOrigin: '50% 50%' });
      const set = window.gsap
        ? { rx: gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' }),
            ry: gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3' }) }
        : null;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        if (set) { set.ry(dx * max * 2); set.rx(-dy * max * 2); }
        else { el.style.transform = 'perspective(900px) rotateY(' + dx * max * 2 +
               'deg) rotateX(' + -dy * max * 2 + 'deg)'; }
      });
      el.addEventListener('pointerleave', () => {
        if (set) { set.ry(0); set.rx(0); } else { el.style.transform = ''; }
      });
    });

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      if (boundPointer.has(el)) return; boundPointer.add(el);
      const pull = parseFloat(el.getAttribute('data-magnetic')) || 0.25;
      const set = window.gsap
        ? { x: gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' }),
            y: gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' }) }
        : null;
      if (!set) return;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        set.x((e.clientX - (r.left + r.width / 2)) * pull);
        set.y((e.clientY - (r.top + r.height / 2)) * pull);
      });
      el.addEventListener('pointerleave', () => { set.x(0); set.y(0); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
