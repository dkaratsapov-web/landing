/* motion.js — лёгкий vanilla-движок микровзаимодействий и скролл-анимаций.
   Подключается отдельным <script defer> (как preloader.js), не зависит от React.
   Работает с элементами, размеченными data-атрибутами в JSX:
     [data-parallax="0.2"]   — вертикальный параллакс слоя (доля от смещения)
     [data-tilt]             — 3D-наклон к курсору (карточки/портрет)
     [data-magnetic]         — «магнитная» кнопка, тянется к курсору
   Плюс глобально: индикатор прогресса прокрутки в шапке.
   Всё уважает prefers-reduced-motion и не запускается на тач-устройствах,
   где это не имеет смысла (tilt/magnetic). */
(() => {
  'use strict';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Индикатор прогресса прокрутки ---------- */
  function scrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    let ticking = false;
    const update = () => {
      ticking = false;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------- 2. Параллакс слоёв при прокрутке ---------- */
  let parallaxEls = [];
  function collectParallax() {
    parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  }
  let pTicking = false;
  function applyParallax() {
    pTicking = false;
    const vh = window.innerHeight || 1;
    for (let i = 0; i < parallaxEls.length; i++) {
      const el = parallaxEls[i];
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      const rect = el.getBoundingClientRect();
      // Смещение слоя относительно центра вьюпорта — мягкий «уход» фона.
      const center = rect.top + rect.height / 2;
      const delta = (center - vh / 2) * speed;
      el.style.transform = 'translate3d(0,' + (-delta).toFixed(1) + 'px,0)';
    }
  }
  function onParallaxScroll() {
    if (!pTicking) { pTicking = true; requestAnimationFrame(applyParallax); }
  }

  /* ---------- 3. 3D-наклон к курсору ---------- */
  function bindTilt(el) {
    if (el.__tiltBound) return; el.__tiltBound = true;
    const max = parseFloat(el.getAttribute('data-tilt')) || 6; // градусы
    let raf = 0, tx = 0, ty = 0;
    const render = () => {
      raf = 0;
      el.style.transform = 'perspective(900px) rotateX(' + ty.toFixed(2) + 'deg) rotateY(' + tx.toFixed(2) + 'deg)';
    };
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tx = px * max * 2; ty = -py * max * 2;
      el.style.setProperty('--gx', (px * 100 + 50).toFixed(1) + '%');
      el.style.setProperty('--gy', (py * 100 + 50).toFixed(1) + '%');
      if (!raf) raf = requestAnimationFrame(render);
    });
    el.addEventListener('pointerleave', () => {
      tx = 0; ty = 0;
      el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
    });
  }

  /* ---------- 4. «Магнитные» кнопки ---------- */
  function bindMagnetic(el) {
    if (el.__magBound) return; el.__magBound = true;
    const pull = parseFloat(el.getAttribute('data-magnetic')) || 0.3;
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * pull;
      const y = (e.clientY - r.top - r.height / 2) * pull;
      el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }

  function bindInteractive() {
    if (!fine || reduce) return;
    document.querySelectorAll('[data-tilt]').forEach(bindTilt);
    document.querySelectorAll('[data-magnetic]').forEach(bindMagnetic);
  }

  /* ---------- Инициализация (с учётом async-рендера React) ---------- */
  function init() {
    scrollProgress();
    if (!reduce) {
      collectParallax();
      applyParallax();
      window.addEventListener('scroll', onParallaxScroll, { passive: true });
      window.addEventListener('resize', () => { collectParallax(); onParallaxScroll(); }, { passive: true });
    }
    bindInteractive();

    // React монтирует #root асинхронно (после fetch content.json). Перепривязываемся
    // при изменениях дерева — debounce, чтобы не дёргать на каждый узел.
    const root = document.getElementById('root');
    if (root && 'MutationObserver' in window) {
      let t = 0;
      const mo = new MutationObserver(() => {
        clearTimeout(t);
        t = setTimeout(() => {
          if (!reduce) { collectParallax(); applyParallax(); }
          bindInteractive();
        }, 120);
      });
      mo.observe(root, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
