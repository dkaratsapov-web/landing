/* gen-illustrations.mjs — генератор иллюстраций к статьям: обложки и
   инфографика в фирменном стиле.

   Зачем. Статьям нужны картинки — на Дзене и VC текст без визуала дочитывают
   заметно хуже, а часть содержания (шаги, сравнения, чек-листы, цифры)
   вообще воспринимается картинкой лучше, чем абзацем. Заказывать их
   дизайнеру на каждый материал при плане в 45 статей в месяц нереально ни по
   деньгам, ни по срокам.

   Как. Тот же приём, что в gen-og.mjs: вёрстка карточки на HTML/CSS,
   скриншот headless-Chromium, сжатие в JPEG. Пять типов карточек покрывают
   почти всё, что встречается в статьях по маркетингу. Стиль задан один раз —
   значит все картинки во всех статьях выглядят как одна серия, чего от руки
   добиться сложнее, чем кажется.

   Запуск:
     node project/gen-illustrations.mjs              # всё из illustrations.mjs
     node project/gen-illustrations.mjs kontekst     # только группу «kontekst»

   Результат: project/assets/blog/<группа>-<имя>.jpg
*/
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const SPECS_MODULE = process.env.ILL_SPECS || './illustrations.mjs';
const { SPECS } = await import(SPECS_MODULE);

const HERE = dirname(fileURLToPath(import.meta.url));
/* Куда складывать картинки. По умолчанию — в assets сайта, но материалы для
   Дзена и VC на сайте публиковать нельзя (это дубли), и их иллюстрации не
   должны попадать в сборку. Для них передаём каталог через ILL_OUT. */
const OUT = process.env.ILL_OUT
  ? (process.env.ILL_OUT.startsWith('/') ? process.env.ILL_OUT : join(HERE, '..', process.env.ILL_OUT))
  : join(HERE, 'assets', 'blog');
const TMP = join(HERE, '.ill-tmp');
const CHROME = process.env.CHROME_BIN
  || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/* Размеры под площадки. Дзен показывает обложку широкой (16:9), у сайта и VC
   стандартные 1200×630. Внутренние картинки — одна ширина, высота по типу. */
export const SIZES = {
  'cover-site': [1200, 630],
  'cover-dzen': [1600, 900],
  'cover-vc':   [1200, 630],
  inline:       [1200, 750],
  'inline-tall': [1200, 950],
  avatar:       [1080, 1080],
};

const BRAND = {
  bg: '#08080a', card: '#141417', line: 'rgba(255,255,255,0.10)',
  text: '#eaeaee', muted: '#9a9aa4', accent: '#b6f01e', ink: '#0c1402',
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const portrait = (() => {
  const p = join(HERE, 'assets', 'portrait.jpg');
  return existsSync(p) ? 'data:image/jpeg;base64,' + readFileSync(p).toString('base64') : null;
})();

/* ── Общая обвязка ──────────────────────────────────────────────────────── */
/* Высоты заданы через height:100%, а не фиксированными пикселями, и ничего не
   позиционируется абсолютно от низа кадра. Этот headless-Chromium раскладывает
   страницу по вьюпорту, который не совпадает с --window-size: при `height:750px`
   и `position:absolute; bottom:0` нижние элементы уезжали за границу
   скриншота — подпись и акцентная полоса просто не попадали в картинку.
   Поток + margin-top:auto ведут себя предсказуемо. */
function shell(w, h, inner, extraCss = '') {
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html{height:100%}
  body{
    width:${w}px; height:100%; overflow:hidden;
    background:${BRAND.bg}; color:${BRAND.text};
    font-family:"Liberation Sans","DejaVu Sans",sans-serif;
    position:relative; display:flex; flex-direction:column;
  }
  .glow{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none}
  .g1{width:560px;height:560px;background:${BRAND.accent};top:-260px;left:-180px;opacity:.14}
  .g2{width:440px;height:440px;background:${BRAND.accent};top:${h - 180}px;right:-140px;opacity:.07}
  .pad{position:relative;flex:1;display:flex;flex-direction:column;padding:52px 60px 48px}
  /* Содержимое центрируется по вертикали: карточки бывают разной плотности,
     и без этого короткие висят вверху кадра с пустотой под ними. */
  .main{flex:1;display:flex;flex-direction:column;justify-content:center}
  .main h1{margin-bottom:36px}
  .main .eyebrow+h1{margin-bottom:0}
  .eyebrow{
    color:${BRAND.accent};font-size:21px;font-weight:700;
    letter-spacing:.09em;text-transform:uppercase;margin-bottom:22px;
  }
  h1{font-size:54px;line-height:1.1;font-weight:700;letter-spacing:-.02em}
  /* Подпись прижата к низу и отбита лаймовой линейкой — она же заменяет
     прежнюю нижнюю полосу, которая не доживала до скриншота. */
  .sign{
    display:flex;align-items:center;gap:12px;margin-top:auto;
    padding-top:22px;border-top:3px solid ${BRAND.accent};
    font-size:20px;color:${BRAND.muted};white-space:nowrap;
  }
  .sign b{color:${BRAND.text};font-weight:700}
  ${extraCss}
  </style></head><body>
    <div class="glow g1"></div><div class="glow g2"></div>
    ${inner}
  </body></html>`;
}

const signature = '<div class="sign"><b>Даниил Карацапов</b> · карацапов-даниил-маркетинг.рф</div>';

/* ── Тип: обложка ───────────────────────────────────────────────────────── */
function cover({ eyebrow, title, withPhoto = true }, w, h) {
  const photo = withPhoto && portrait
    ? `<div class="photo"><img src="${portrait}" alt=""></div>` : '';
  return shell(w, h, `
    <div style="display:flex;flex:1;position:relative">
      <div class="pad" style="flex:1;min-width:0">
        <div class="main">
          <div class="eyebrow">${esc(eyebrow)}</div>
          <h1>${esc(title).replace(/\n/g, '<br>')}</h1>
        </div>
        ${signature}
      </div>
      ${photo}
    </div>`, `
    /* Кегль заголовка привязан к высоте кадра: обложка Дзена (1600×900) вдвое
       крупнее сайтовой, и фиксированный размер оставлял её полупустой. */
    h1{font-size:${Math.round(h / 11)}px}
    .eyebrow{font-size:${Math.round(h / 30)}px}
    .photo{width:${Math.round(w * 0.33)}px;flex:none;position:relative;background:#111;overflow:hidden}
    .photo img{width:100%;height:100%;object-fit:cover;object-position:center 20%}
    .photo::after{content:"";position:absolute;inset:0;
      background:linear-gradient(90deg,${BRAND.bg} 0%,rgba(8,8,10,.55) 22%,transparent 62%)}
  `);
}

/* ── Тип: цифры ─────────────────────────────────────────────────────────
   Крупные показатели. Больше четырёх на карточку не ставим — перестают
   читаться в ленте с телефона. */
function stats({ title, items }, w, h) {
  if (items.length > 4) throw new Error('stats: максимум 4 показателя на карточку');
  const cells = items.map(([v, l]) => `
    <div class="cell">
      <div class="v">${esc(v)}</div>
      <div class="l">${esc(l)}</div>
    </div>`).join('');
  return shell(w, h, `
    <div class="pad">
      <div class="main">
        <h1 style="font-size:40px">${esc(title)}</h1>
        <div class="grid">${cells}</div>
      </div>
      ${signature}
    </div>`, `
    .grid{display:grid;grid-template-columns:repeat(${items.length > 2 ? 2 : items.length},1fr);
      gap:34px 44px}
    .cell{border-left:4px solid ${BRAND.accent};padding-left:24px}
    .v{font-size:64px;font-weight:700;line-height:1;letter-spacing:-.02em}
    .l{font-size:22px;color:${BRAND.muted};margin-top:12px;line-height:1.35}
  `);
}

/* ── Тип: шаги ──────────────────────────────────────────────────────────── */
function steps({ title, items }, w, h) {
  const rows = items.map((t, i) => `
    <div class="row">
      <div class="n">${i + 1}</div>
      <div class="t">${esc(t)}</div>
    </div>`).join('');
  return shell(w, h, `
    <div class="pad">
      <div class="main">
        <h1 style="font-size:40px">${esc(title)}</h1>
        <div class="rows">${rows}</div>
      </div>
      ${signature}
    </div>`, `
    .rows{display:flex;flex-direction:column;gap:0}
    .row{display:flex;gap:24px;align-items:center;padding:20px 0;
      border-bottom:1px solid ${BRAND.line}}
    .row:last-child{border-bottom:none}
    .n{width:52px;height:52px;border-radius:50%;flex:none;
      background:${BRAND.accent};color:${BRAND.ink};
      display:flex;align-items:center;justify-content:center;
      font-size:24px;font-weight:700}
    .t{font-size:27px;line-height:1.3}
  `);
}

/* ── Тип: сравнение двух колонок ────────────────────────────────────────── */
function compare({ title, left, right }, w, h) {
  const col = (c, accent) => `
    <div class="col${accent ? ' hi' : ''}">
      <div class="head">${esc(c.head)}</div>
      <div class="items">${c.items.map((i) =>
        `<div class="i"><span class="m">${accent ? '✓' : '✕'}</span>${esc(i)}</div>`).join('')}</div>
    </div>`;
  return shell(w, h, `
    <div class="pad">
      <div class="main">
        <h1 style="font-size:40px">${esc(title)}</h1>
        <div class="cols">${col(left, false)}${col(right, true)}</div>
      </div>
      ${signature}
    </div>`, `
    .cols{display:grid;grid-template-columns:1fr 1fr;gap:28px}
    .col{background:${BRAND.card};border:1px solid ${BRAND.line};
      border-radius:18px;padding:32px 30px}
    .col.hi{border-color:rgba(182,240,30,.35)}
    .head{font-size:26px;font-weight:700;margin-bottom:22px}
    .col.hi .head{color:${BRAND.accent}}
    .items{display:flex;flex-direction:column;gap:16px}
    .i{display:flex;gap:14px;font-size:21px;line-height:1.35;color:${BRAND.muted}}
    .m{color:${BRAND.accent};font-weight:700;flex:none}
    .col:not(.hi) .m{color:#6e6e73}
  `);
}

/* ── Тип: чек-лист / тезисы ─────────────────────────────────────────────── */
function checklist({ title, items, negative = false }, w, h) {
  const rows = items.map((t) => `
    <div class="i"><span class="m">${negative ? '✕' : '✓'}</span>${esc(t)}</div>`).join('');
  return shell(w, h, `
    <div class="pad">
      <div class="main">
        <h1 style="font-size:40px">${esc(title)}</h1>
        <div class="items">${rows}</div>
      </div>
      ${signature}
    </div>`, `
    .items{display:flex;flex-direction:column;gap:18px}
    .i{display:flex;gap:18px;font-size:25px;line-height:1.35;align-items:flex-start}
    .m{width:38px;height:38px;border-radius:50%;flex:none;
      display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:700;
      background:${negative ? 'rgba(255,90,80,.14)' : 'rgba(182,240,30,.14)'};
      border:1px solid ${negative ? 'rgba(255,90,80,.4)' : 'rgba(182,240,30,.4)'};
      color:${negative ? '#ff7a70' : BRAND.accent};margin-top:2px}
  `);
}

/* ── Тип: цитата / тезис ────────────────────────────────────────────────── */
function quote({ text, note }, w, h) {
  return shell(w, h, `
    <div class="pad">
      <div class="main">
        <div class="q">${esc(text)}</div>
        ${note ? `<div class="note">${esc(note)}</div>` : ''}
      </div>
      ${signature}
    </div>`, `
    .q{font-size:46px;line-height:1.25;font-weight:700;letter-spacing:-.01em;
      border-left:6px solid ${BRAND.accent};padding-left:34px;max-width:940px}
    .note{font-size:23px;color:${BRAND.muted};margin-top:26px;padding-left:40px;max-width:860px;line-height:1.45}
    
  `);
}

/* ── Тип: аватарка ──────────────────────────────────────────────────────
   Квадрат, который площадки обрезают в круг. Отсюда два ограничения: всё
   значимое держим внутри вписанной окружности (углы срежутся) и не ставим
   мелких деталей — в ленте аватарка около 40 пикселей, там читается один
   крупный знак и не более двух букв.

   Собственная разметка вместо общей обвязки: подпись, свечения и отбивка
   снизу здесь не нужны, а поля другие. */
const PLANE_PATHS = `<path d="M5 5L13.1505 42L27.1012 29.4506L12.6396 13.0136L34.6486 25.502L46 20.4601L5 5Z" fill="CLR"/><path d="M35 29.0967L30.2839 45V29.6413L24.6612 23L35 29.0967ZM23 39.4725L27.4277 45V35.3329L23 39.4725Z" fill="CLR"/>`;

function avatar({ variant = 'plane-dark', text = 'ДК' }, w, h) {
  const looks = {
    'plane-dark':  { bg: BRAND.bg,     mark: BRAND.accent, ring: 'rgba(182,240,30,.30)' },
    'plane-lime':  { bg: BRAND.accent, mark: BRAND.ink,    ring: 'rgba(0,0,0,.18)' },
    'monogram':    { bg: BRAND.bg,     mark: BRAND.accent, ring: 'rgba(182,240,30,.30)' },
  };
  const look = looks[variant];
  if (!look) throw new Error(`avatar: неизвестный вариант «${variant}»`);

  const body = variant === 'monogram'
    ? `<div class="mono">${esc(text)}</div>`
    : `<svg class="plane" viewBox="0 0 50 50" fill="none">${PLANE_PATHS.replaceAll('CLR', look.mark)}</svg>`;

  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html{height:100%}
  body{
    width:${w}px;height:100%;overflow:hidden;background:${look.bg};
    font-family:"Liberation Sans","DejaVu Sans",sans-serif;
    display:flex;align-items:center;justify-content:center;position:relative;
  }
  /* Подсветка от угла — иначе плоская заливка выглядит как заглушка. */
  .glow{
    position:absolute;width:${Math.round(w * 0.9)}px;height:${Math.round(w * 0.9)}px;
    border-radius:50%;filter:blur(${Math.round(w * 0.09)}px);
    background:${variant === 'plane-lime' ? '#ffffff' : BRAND.accent};
    opacity:${variant === 'plane-lime' ? .18 : .13};
    top:${-Math.round(w * 0.34)}px;left:${-Math.round(w * 0.3)}px;
  }
  /* Кольцо по краю: на светлой ленте Дзена очерчивает границу аватарки. */
  .ring{
    position:absolute;inset:${Math.round(w * 0.022)}px;border-radius:50%;
    border:${Math.round(w * 0.011)}px solid ${look.ring};
  }
  /* Самолётик в исходном SVG стоит не по центру поля: масса смещена
     вверх-влево, и в круге это читается как перекос. Сдвигаем оптически. */
  .plane{
    width:${Math.round(w * 0.54)}px;height:${Math.round(w * 0.54)}px;position:relative;
    transform:translate(${Math.round(w * 0.022)}px, ${Math.round(w * 0.018)}px);
  }
  .mono{
    position:relative;color:${look.mark};
    font-size:${Math.round(w * 0.42)}px;font-weight:700;letter-spacing:-.02em;line-height:1;
  }
  </style></head><body>
    <div class="glow"></div>
    ${body}
    <div class="ring"></div>
  </body></html>`;
}

const TYPES = { cover, stats, steps, compare, checklist, quote, avatar };

/* ── Рендер ─────────────────────────────────────────────────────────────── */
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const sharpLib = (await import('sharp')).default;

/* Вьюпорт headless-Chromium ниже, чем --window-size, на постоянную величину
   (в текущей сборке — 87px). Из-за этого страница высотой 100% раскладывалась
   короче кадра и внизу картинки оставалась мёртвая полоса. Замеряем разницу
   один раз запуском страницы с прижатой к низу меткой, дальше рендерим с
   запасом и срезаем лишнее. Замер вместо константы — чтобы смена версии
   браузера не сломала все картинки молча. */
async function measureViewportOffset() {
  const probe = join(TMP, 'probe.html');
  const shot = join(TMP, 'probe.png');
  const H = 800;
  writeFileSync(probe, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0}html{height:100%}
    body{height:100%;background:#000;display:flex;flex-direction:column;overflow:hidden}
    .m{margin-top:auto;height:10px;background:#b6f01e}
    </style></head><body><div class="m"></div></body></html>`, 'utf8');
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--window-size=1200,${H}`, '--virtual-time-budget=1200',
    '--screenshot=' + shot, probe], { stdio: 'ignore' });

  const { data, info } = await sharpLib(shot).raw().toBuffer({ resolveWithObject: true });
  let last = -1;
  for (let y = 0; y < info.height; y++) {
    const i = (y * info.width + 600) * info.channels;
    if (data[i] > 140 && data[i + 1] > 200 && data[i + 2] < 90) last = y;
  }
  if (last < 0) throw new Error('не удалось замерить вьюпорт: метка не найдена на пробном рендере');
  return info.height - (last + 1);
}

const OFFSET = await measureViewportOffset();
console.log(`Поправка вьюпорта: ${OFFSET}px\n`);

/* Ищет лаймовую линейку над подписью в нижней четверти кадра: строку, где
   акцентным цветом закрашена почти вся ширина. Если её нет — подпись не
   поместилась и карточку надо перерисовать выше. */
async function hasSignatureRule(png, w, h) {
  const { data, info } = await sharpLib(png)
    .extract({ left: 0, top: 0, width: w, height: h })
    .raw().toBuffer({ resolveWithObject: true });
  const from = Math.floor(info.height * 0.72);
  for (let y = from; y < info.height; y++) {
    let hits = 0;
    for (let x = 0; x < info.width; x += 6) {
      const i = (y * info.width + x) * info.channels;
      if (data[i] > 140 && data[i + 1] > 200 && data[i + 2] < 90) hits++;
    }
    if (hits > (info.width / 6) * 0.7) return true;
  }
  return false;
}

const only = process.argv[2];
const queue = SPECS.filter((s) => !only || s.group === only);
if (!queue.length) {
  console.error(only ? `Группа «${only}» не найдена` : 'Список SPECS пуст');
  process.exit(1);
}

const sharp = sharpLib;
let n = 0;

for (const spec of queue) {
  const render = TYPES[spec.type];
  if (!render) throw new Error(`Неизвестный тип карточки: ${spec.type}`);
  const [w, h] = SIZES[spec.size || 'inline'] || SIZES.inline;

  const name = `${spec.group}-${spec.name}`;
  const htmlPath = join(TMP, name + '.html');
  const pngPath = join(TMP, name + '.png');

  /* Плотная карточка (шесть шагов, длинный чек-лист) не помещается в
     заданную высоту: содержимое выдавливает подпись за нижнюю границу кадра,
     и картинка выходит без неё. Считать высоту заранее не выйдет — она
     зависит от переносов строк, — поэтому проверяем результат и при промахе
     дорисовываем кадр выше. Подпись отбита лаймовой линейкой во всю ширину,
     её и ищем в нижней четверти. */
  let used = h;
  let ok = false;
  for (const candidate of [h, h + 180, h + 360]) {
    writeFileSync(htmlPath, render(spec, w, candidate), 'utf8');
    // Рендерим с запасом на поправку вьюпорта и срезаем его — так вёрстка
    // раскладывается ровно на candidate пикселей, а не короче кадра.
    execFileSync(CHROME, [
      '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--force-device-scale-factor=1', `--window-size=${w},${candidate + OFFSET}`,
      '--virtual-time-budget=3000',
      '--screenshot=' + pngPath, htmlPath,
    ], { stdio: 'ignore' });

    used = candidate;
    if (spec.type === 'cover' || spec.type === 'avatar'
      || await hasSignatureRule(pngPath, w, candidate)) { ok = true; break; }
  }
  if (!ok) {
    throw new Error(`${name}: содержимое не помещается даже в ${used}px — сократите текст в спеке`);
  }

  await sharp(pngPath)
    .extract({ left: 0, top: 0, width: w, height: used })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(OUT, name + '.jpg'));
  console.log(`  ${spec.type.padEnd(9)} ${w}×${used}${used !== h ? ' (подобрана)' : ''}  ${name}.jpg`);
  n++;
}

rmSync(TMP, { recursive: true, force: true });
console.log(`\nГотово: ${n} изображений в assets/blog/`);
