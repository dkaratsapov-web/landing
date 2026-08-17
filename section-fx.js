/* section-fx.js — включение декоративных слоёв секций.

   Сам декор целиком в CSS (section-fx.css). Здесь только две вещи, которые
   CSS решить не может.

   1. Слабое устройство — декор не рисуем вовсе. Замер прокрутки главной:
      средний кадр со слоями 118мс, без них 60мс. Половину разницы давала
      маска, которая гасит декор у краёв секции, — а снять её нельзя, без неё
      возвращаются полосы на стыках (детектор находит три штуки, перепад до
      шести единиц тона). Значит выбор простой: там, где это не тянет,
      украшения не нужны — нужна плавная прокрутка.

      Порог намеренно низкий. Первая версия отсекала всё до четырёх ядер
      включительно и выключила декор на обычном рабочем ноутбуке; поймал
      только потому, что замер вдруг показал подозрительно хорошие цифры —
      декора в нём просто не было. Свойства поддерживаются не везде: при их
      отсутствии считаем устройство нормальным, иначе декор пропал бы у всех
      пользователей Safari разом.

   2. Анимации ставятся на паузу, пока секция далеко от экрана. Держать
      движение для блоков, которых на экране нет, незачем. Запас в 300px —
      чтобы к моменту появления движение уже шло, иначе видно, как рисунок
      трогается с места.

   Скрипт общий для всех страниц: на внутренних слои приезжают прямо в HTML,
   на главной их рисует React уже после загрузки — поэтому проход повторяется
   по событию гидратации.

   При prefers-reduced-motion скрипт не выходит: движение там и так выключено
   в CSS, а сам декор остаётся — просьба уменьшить анимацию не означает
   просьбу убрать фон. */
(() => {
  'use strict';

  function weakDevice() {
    const cores = navigator.hardwareConcurrency;
    const mem = navigator.deviceMemory;
    return (cores !== undefined && cores <= 2) || (mem !== undefined && mem <= 2);
  }

  const weak = weakDevice();
  let io = null;
  if (!weak && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle('live', e.isIntersecting);
    }, { rootMargin: '300px 0px' });
  }

  /* Помечаем обработанные, чтобы повторный проход после гидратации не
     подписывал одни и те же узлы дважды. */
  function apply() {
    for (const el of document.querySelectorAll('.sec-fx:not([data-fx])')) {
      el.dataset.fx = '1';
      if (weak) { el.remove(); continue; }
      if (io) io.observe(el); else el.classList.add('live');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
  window.addEventListener('app:hydrated', apply);
})();
