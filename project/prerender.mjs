/* prerender.mjs — рендерит React-лендинг в статический HTML на этапе сборки.

   Зачем: index.html отдавал поисковику пустой <div id="root">, весь текст
   рисовался React'ом в браузере. Яндекс исполняет JS выборочно, поэтому главная
   страница — самая весомая на сайте — не ранжировалась по своему содержимому.

   Как: компоненты живут в classic-scope скриптах и общаются через глобалы
   (window.CONTENT, window.STATS, ...). Мы собираем их скомпилированные исходники
   в один скрипт, выполняем его в vm-контексте с минимальными заглушками браузера
   и рендерим <App /> в строку. Эффекты (useEffect) при SSR не выполняются —
   именно там живёт весь код, который реально трогает DOM, canvas и localStorage,
   поэтому заглушек хватает совсем скромных.

   На клиенте app.jsx видит непустой #root и вызывает hydrateRoot вместо
   createRoot — разметка переиспользуется, лишней перерисовки нет.
*/
import { createContext, runInContext } from 'node:vm';
import React from 'react';
import { renderToString } from 'react-dom/server';

/* Заглушки браузерных API. Всё, что вызывается во время рендера, должно быть
   настоящим; всё, что только внутри useEffect, может быть no-op — эффекты при
   renderToString не запускаются. */
function makeBrowserStubs(content) {
  const noop = () => {};
  const style = { setProperty: noop, removeProperty: noop, getPropertyValue: () => '' };
  const classList = { add: noop, remove: noop, toggle: noop, contains: () => false };
  const element = {
    style, classList, appendChild: noop, removeChild: noop,
    addEventListener: noop, removeEventListener: noop,
    setAttribute: noop, getAttribute: () => null,
    getContext: () => null, getBoundingClientRect: () => ({
      top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
    }),
  };
  const document = {
    documentElement: element,
    body: { ...element },
    head: { ...element },
    createElement: () => ({ ...element }),
    // boot() в app.jsx достаёт #root и вызывает createRoot/hydrateRoot. Он
    // отрабатывает уже после нашего renderToString — в микротаске от fetch —
    // поэтому элемент должен существовать, иначе необработанное исключение
    // валит сборку после того, как всё уже записано на диск.
    getElementById: () => ({ ...element, firstElementChild: null }),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: noop,
    removeEventListener: noop,
    scripts: [],
  };
  const window = {
    CONTENT: content,
    document,
    innerWidth: 1440,
    innerHeight: 900,
    scrollY: 0,
    devicePixelRatio: 1,
    location: { href: '/', search: '' },
    navigator: { userAgent: 'prerender' },
    matchMedia: () => ({ matches: false, addListener: noop, removeListener: noop,
      addEventListener: noop, removeEventListener: noop }),
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
    requestAnimationFrame: noop,
    cancelAnimationFrame: noop,
    setTimeout: noop,
    clearTimeout: noop,
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    parent: { postMessage: noop },
    fetch: () => Promise.resolve({ ok: false, json: () => Promise.resolve(null) }),
    CustomEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init); } },
  };
  window.window = window;
  window.self = window;
  window.parent.postMessage = noop;
  return { window, document };
}

/* Собирает <App /> из скомпилированных исходников и рендерит в HTML-строку.
   sources — массив [имя, скомпилированный JS] в порядке загрузки; порядок важен,
   поздние файлы ссылаются на top-level имена из ранних.
   Бросает исключение при любой ошибке — сборка должна падать громко, а не
   выкладывать в прод молча опустевшую главную. */
export function prerenderApp(sources, content) {
  const { window, document } = makeBrowserStubs(content);

  const sandbox = {
    React,
    ReactDOM: {
      // boot() в app.jsx вызывает createRoot — при SSR это должно быть no-op:
      // рендерим мы сами, ниже, чтобы получить строку.
      createRoot: () => ({ render: () => {}, unmount: () => {} }),
      hydrateRoot: () => ({ render: () => {}, unmount: () => {} }),
    },
    window,
    document,
    localStorage: window.localStorage,
    navigator: window.navigator,
    location: window.location,
    matchMedia: window.matchMedia,
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    fetch: window.fetch,
    console,
    CustomEvent: window.CustomEvent,
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  };
  sandbox.globalThis = sandbox;

  const context = createContext(sandbox);
  for (const [name, code] of sources) {
    try {
      runInContext(code, context, { filename: name });
    } catch (err) {
      throw new Error(`prerender: не удалось выполнить ${name}: ${err.message}`);
    }
  }

  const App = sandbox.App || window.App;
  if (typeof App !== 'function') {
    throw new Error('prerender: компонент App не найден после выполнения скриптов');
  }

  const html = renderToString(React.createElement(App));
  if (!html || html.length < 2000) {
    throw new Error(`prerender: подозрительно короткий результат (${html.length} символов)`);
  }
  return html;
}
