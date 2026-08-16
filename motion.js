/* motion.js — микровзаимодействия, которые нельзя выразить одним CSS: всё
   здесь завязано на позицию указателя.

   Файл намеренно крошечный и без зависимостей: он подключается на всех
   страницах, включая те, куда Lenis и GSAP не приходят. Основная часть
   движения на сайте живёт в motion.css на scroll-driven анимациях и работает
   даже с отключённым JavaScript; здесь — только надстройка.

   Принципы:
   1. При prefers-reduced-motion скрипт выходит сразу, ничего не навешивая.
   2. Указательные эффекты включаются только для мыши (hover: hover и
      pointer: fine). На тач-экране «магнит» и подсветка бессмысленны: там
      нет курсора, а лишние обработчики съедают отзывчивость.
   3. Ничего обязательного для чтения страницы здесь нет. Не отработает —
      сайт останется рабочим.
*/
(() => {
  'use strict';

  const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
  if (mq('(prefers-reduced-motion: reduce)')) return;

  const finePointer = mq('(hover: hover) and (pointer: fine)');

  /* ── Кинетический заголовок ──────────────────────────────────────────────
     Разбивает текст на слова и пускает их лесенкой. Работает только с
     текстовыми узлами: вложенные <span class="accent"> и <br> остаются на
     месте, иначе рассыпалась бы подсветка акцентного слова в заголовке. */
  function kinetic(root) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          if (!parts.some((p) => p.trim())) return;
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement('span');
            span.className = 'mo-word';
            span.style.setProperty('--mo-i', i++);
            span.textContent = part;
            frag.appendChild(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && !child.classList.contains('mo-word')) {
          walk(child);
        }
      });
    };
    walk(root);
  }

  /* Разбивать заголовок можно только после того, как React закончит гидратацию.
     Раньше кинетика срабатывала сразу: motion.js стоит в очереди скриптов
     после app.js, но гидратация в React 18 конкурентная и к этому моменту
     ещё не завершена. Мы переписывали innerHTML заголовка героя, React видел
     разметку, не совпадающую с серверной, выбрасывал весь корень и рисовал
     страницу заново — на перезагрузке это и был видимый рывок.
     Отладочная сборка React называла узел прямым текстом:
     «Expected server HTML to contain a matching text node ... in <h1>».

     Заголовки вне React-корня (обычные страницы) разбираем сразу — там ждать
     нечего и незачем. */
  function runKinetic() {
    document.querySelectorAll('[data-mo-kinetic]').forEach(kinetic);
  }
  const inRoot = document.querySelector('#root [data-mo-kinetic]');
  if (!inRoot || document.documentElement.dataset.hydrated === '1') {
    runKinetic();
  } else {
    window.addEventListener('app:hydrated', runKinetic, { once: true });
    /* Страховка: если React почему-то не поднялся (не догрузился файл),
       заголовок всё равно должен ожить, а не остаться статичным навсегда. */
    window.addEventListener('load', () => setTimeout(() => {
      if (!document.querySelector('.mo-word')) runKinetic();
    }, 1200), { once: true });
  }

  /* ── Первый экран появляется сам ─────────────────────────────────────────
     Появление по скроллу привязано к положению элемента во вьюпорте. Для
     всего, что ниже сгиба, это ровно то, что нужно. Но блок, который уже
     виден при загрузке, свой диапазон никогда не проходит: он стоит в его
     начале и там и остаётся. На /ceny/ таблица цен так и висела с прогрессом
     0.02 — почти прозрачная, пока человек не тронет колесо. Плюс побочный
     эффект по всему сайту: прокрутил вниз и вернулся наверх — первый экран
     погас обратно.

     Поэтому всё, что при загрузке попадает во вьюпорт, переводим на обычную
     временную анимацию: один раз выехало и осталось. Диапазон замеряем до
     первого кадра, чтобы не поймать уже сдвинутую страницу (перезагрузка с
     сохранённой позицией скролла). */
  const fold = window.innerHeight;
  document.querySelectorAll('.reveal').forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.top < fold && r.bottom > 0) {
      el.dataset.mo = 'first';
      el.style.setProperty('--mo-i', Math.min(i, 7));
    }
  });

  /* Подсветку и магнит навешиваем по смыслу, а не по классу: размечать
     руками двадцать карточек на каждой странице — это гарантированно забыть
     половину. Кнопка-призыв и карточка-ссылка ведут себя одинаково на всём
     сайте, потому что правило одно. */
  document.querySelectorAll('.btn-fill, .btn-lime').forEach((b) => b.classList.add('mo-magnetic'));
  document.querySelectorAll('.price-card, .kfull, .post-card, .icon-card, .tool, .shot-open, .cert-row')
    .forEach((c) => c.classList.add('mo-spot'));

  if (!finePointer) return;

  /* ── Магнитные кнопки ────────────────────────────────────────────────────
     Кнопка тянется к курсору на подходе. Смещение ограничено восемью
     пикселями: заметно как «живость», но кнопка не убегает из-под пальца и
     не ломает попадание. */
  const MAGNET_MAX = 8;
  document.querySelectorAll('.mo-magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.setProperty('--mo-mx', (dx * MAGNET_MAX).toFixed(1) + 'px');
      el.style.setProperty('--mo-my', (dy * MAGNET_MAX).toFixed(1) + 'px');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--mo-mx', '0px');
      el.style.setProperty('--mo-my', '0px');
    });
  });


  /* ── Роли появления ──────────────────────────────────────────────────────
     До сих пор все элементы с .reveal выезжали одинаково: заголовок, абзац,
     карточка и картинка — одним и тем же движением на 26 пикселей вверх.
     Одинаковость и читается как шаблон: глазу не за что зацепиться, страница
     «проявляется» ровным полотном.

     Роль назначаем по структуре, а не по списку классов: тогда правило
     работает и на страницах, которых ещё нет, и не разъезжается, когда
     вёрстку правят. Дальше каждой роли CSS даёт своё появление.

       head   — заголовок: короче и раньше остальных, он задаёт такт
       text   — абзац: мягче, с лёгким расфокусом
       group  — сетка или ряд: сам не анимируется, вместо него лесенкой
                выезжают дети
       media  — блок с картинкой или схемой: подъезжает с приближением
       block  — всё остальное, прежнее поведение

     Дети группы получают --mo-i только для CSS-задержки; сам индекс дальше
     седьмого не нужен — в сетках больше восьми видимых элементов подряд
     не бывает, а бесконечная лесенка выглядит как затянутая. */
  document.querySelectorAll('.reveal').forEach((el) => {
    if (el.dataset.mo) return;

    if (el.matches('h1, h2, h3')) { el.dataset.mo = 'head'; return; }
    if (el.matches('p')) { el.dataset.mo = 'text'; return; }

    const cs = getComputedStyle(el);
    const kids = [...el.children].filter((c) => c.getBoundingClientRect().height > 24);
    const isTrack = /grid|flex/.test(cs.display) && kids.length >= 2;

    if (isTrack) {
      el.dataset.mo = 'group';
      kids.forEach((k, i) => k.style.setProperty('--mo-i', Math.min(i, 7)));
      return;
    }
    /* Картинка или встроенная схема — но только если она и есть содержимое
       блока, а не иконка внутри текста. */
    const media = el.querySelector('img, picture, canvas, .frame, .build, .geo-mock');
    el.dataset.mo = media && media.getBoundingClientRect().height > 120 ? 'media' : 'block';
  });

  /* ── Подсветка карточки под курсором ─────────────────────────────────────
     Координаты пишем в переменные, само пятно рисует CSS. Через
     requestAnimationFrame, чтобы на сетке из двадцати карточек не дёргать
     стили по каждому событию мыши. */
  const spots = document.querySelectorAll('.mo-spot');
  if (spots.length) {
    let queued = false;
    let pending = null;
    const flush = () => {
      queued = false;
      if (!pending) return;
      const { el, x, y } = pending;
      el.style.setProperty('--mo-x', x + '%');
      el.style.setProperty('--mo-y', y + '%');
    };
    spots.forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        pending = {
          el,
          x: (((e.clientX - r.left) / r.width) * 100).toFixed(1),
          y: (((e.clientY - r.top) / r.height) * 100).toFixed(1),
        };
        if (!queued) { queued = true; requestAnimationFrame(flush); }
      });
    });
  }
})();
