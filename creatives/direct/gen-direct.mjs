/* gen-direct.mjs — квадратные креативы 1:1 под Яндекс Директ (РСЯ).

   Зачем отдельный генератор. Креативы для Телеграма в creatives/ сделаны
   1080×1350 и рассчитаны на то, что их разглядывают. В РСЯ картинку часто
   ужимают до трёхсот пикселей по ширине и показывают сбоку от чужой статьи:
   всё, что мельче заголовка, там просто не читается. Поэтому здесь свой
   макет — одна крупная мысль на кадр и минимум текста.

   Как. Вёрстка карточки на HTML, скриншот headless-Chromium, как в
   project/gen-illustrations.mjs. Шрифт Nunito вшит в base64: системного
   Nunito в окружении нет, а без него вёрстка уезжает на DejaVu.

   Запуск:  node creatives/direct/gen-direct.mjs
   Результат: creatives/direct/direct-1x1-<номер>-<имя>.png (1080×1080)
*/
import { writeFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = join(HERE, '.tmp');
const CHROME = process.env.CHROME_BIN
  || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SIZE = 1080;
const FONT = readFileSync(join(HERE, 'nunito-embed.css'), 'utf8');

/* Требования Яндекса к изображению в текстово-графическом объявлении:
   соотношение 1:1, сторона от 450 до 5000 px. 1080 — с запасом на ретину
   и при этом далеко от верхней границы по весу. */

const VARIANTS = [
  {
    name: 'zayavok-net',
    kicker: 'Яндекс Директ',
    head: 'Реклама есть.<br><em>Заявок нет.</em>',
    sub: 'Открою ваш кабинет и покажу, куда уходит бюджет',
    cta: 'Разбор за 30 минут',
  },
  {
    name: 'pod-klyuch',
    kicker: 'Частный маркетолог',
    head: 'Директ<br><em>под ключ</em>',
    sub: 'Настройка, ведение, аналитика. Бюджет — напрямую в Яндекс, кабинет ваш',
    cta: 'от 30 000 ₽ в месяц',
  },
  {
    name: 'nishi',
    layout: 'number',
    kicker: 'Опыт',
    big: '70+',
    head: 'ниш с измеримым результатом',
    sub: 'В digital с 2019 года. Три агентства, от специалиста до тимлида контекстологов',
    cta: 'Веду проекты лично',
  },
  {
    name: 'kuda-uhodit',
    kicker: 'Аудит кабинета',
    head: 'Куда уходит<br><em>ваш бюджет?</em>',
    sub: 'Минус-слова, цели в Метрике, площадки РСЯ — шесть мест, где обычно течёт',
    cta: 'Проверю бесплатно',
  },
  {
    name: 'pod-klyuch-marketing',
    kicker: 'Маркетинг под ключ',
    head: 'Сайт.<br>Реклама.<br><em>Аналитика.</em>',
    sub: 'Один человек отвечает за весь путь клиента — от клика до заявки',
    cta: 'Обсудить проект',
  },
];

const css = `
${FONT}
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${SIZE}px;height:${SIZE}px;overflow:hidden;}
.card{
  position:relative; width:${SIZE}px; height:${SIZE}px; overflow:hidden;
  background:#0a0b0a; color:#fff;
  font-family:"Nunito","Liberation Sans",sans-serif;
  padding:76px; display:flex; flex-direction:column; justify-content:center;
}
/* Мягкое лаймовое свечение из угла — единственный «эффект» в макете.
   Оно даёт кадру глубину и при сжатии до 300 px не превращается в кашу. */
.card::before{
  content:""; position:absolute; right:-260px; top:-260px;
  width:900px; height:900px; border-radius:50%;
  background:radial-gradient(circle,rgba(182,240,30,.26) 0%,rgba(182,240,30,0) 68%);
}
.card > *{position:relative;}
.brand{position:absolute; left:76px; top:76px; display:flex; align-items:center; gap:16px;}
.dot{width:16px; height:16px; border-radius:50%; background:#b6f01e;}
.brand span{
  font-size:26px; font-weight:800; letter-spacing:.16em; text-transform:uppercase;
}
.kicker{
  font-size:26px; font-weight:800; letter-spacing:.16em;
  text-transform:uppercase; color:#b6f01e; margin-bottom:26px;
}
h1{
  font-size:108px; line-height:.98; font-weight:800; letter-spacing:-0.04em;
}
h1 em{font-style:normal; color:#b6f01e;}
.sub{
  margin-top:32px; font-size:35px; line-height:1.35; color:#a3a6ac;
  font-weight:400; max-width:860px;
}
.cta{
  margin-top:44px; align-self:flex-start;
  background:#b6f01e; color:#0a0b0a; border-radius:999px;
  padding:22px 40px; font-size:31px; font-weight:800; letter-spacing:-0.01em;
}
/* Вариант с крупной цифрой: число работает вместо заголовка, поэтому
   заголовок уходит в подпись под ним. */
.big{font-size:280px; line-height:.86; font-weight:800; color:#b6f01e; letter-spacing:-0.05em;}
.big-cap{font-size:60px; line-height:1.1; font-weight:800; margin-top:14px; max-width:760px;}
.foot{
  position:absolute; left:76px; right:76px; bottom:76px;
  padding-top:26px; border-top:1px solid #24261f;
  font-size:26px; color:#7d8087; font-weight:600;
}
`;

function html(v) {
  const body = v.layout === 'number'
    ? `<div class="kicker">${v.kicker}</div>
       <div class="big">${v.big}</div>
       <div class="big-cap">${v.head}</div>
       <p class="sub">${v.sub}</p>
       <div class="cta">${v.cta}</div>`
    : `<div class="kicker">${v.kicker}</div>
       <h1>${v.head}</h1>
       <p class="sub">${v.sub}</p>
       <div class="cta">${v.cta}</div>`;
  return `<!doctype html><meta charset="utf-8"><style>${css}</style>
<div class="card">
  <div class="brand"><i class="dot"></i><span>Даниил Карацапов</span></div>
  ${body}
  <div class="foot">Частный маркетолог · Директ, VK Ads, сквозная аналитика</div>
</div>`;
}

mkdirSync(TMP, { recursive: true });
for (const [i, v] of VARIANTS.entries()) {
  const n = String(i + 1).padStart(2, '0');
  const src = join(TMP, `${v.name}.html`);
  const shot = join(TMP, `${v.name}.png`);
  writeFileSync(src, html(v));
  /* Окно берём выше кадра: у headless-Chromium вьюпорт стабильно ниже
     --window-size примерно на 87 px, и нижняя часть карточки просто не
     попадает в скриншот. Лишнее срезаем кропом. */
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--window-size=${SIZE},${SIZE + 200}`, '--virtual-time-budget=8000',
    `--screenshot=${shot}`, `file://${src}`,
  ], { stdio: 'ignore' });

  const out = join(HERE, `direct-1x1-${n}-${v.name}.png`);
  await sharp(shot).extract({ left: 0, top: 0, width: SIZE, height: SIZE }).toFile(out);
  const { size } = await sharp(out).metadata();
  console.log(`${n} ${v.name} → ${Math.round(size / 1024)} КБ`);
}
rmSync(TMP, { recursive: true, force: true });
