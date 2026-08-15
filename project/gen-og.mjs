/* gen-og.mjs — генератор OG-карточек (1200×630) для превью ссылок в Telegram,
   VK и соцсетях.

   Запуск:  node project/gen-og.mjs
   Результат: project/assets/og/<slug>.jpg + project/assets/og-cover.jpg

   Рендерим headless-Chromium'ом, а не sharp'ом: нужен нормальный перенос строк
   и композиция, а не наклейка текста на картинку. Скрипт разовый — карточки
   лежат в репозитории, сборка их просто копирует вместе с assets/.

   Шрифт: Liberation Sans. Фирменный Nunito живёт на CDN, а тянуть его в
   генератор ради одной картинки смысла нет — в превью разница не читается.
*/
import { writeFileSync, mkdirSync, readFileSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(HERE, 'assets');
const OUT = join(ASSETS, 'og');
const TMP = join(HERE, '.og-tmp');

const CHROME = process.env.CHROME_BIN
  || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/* Карточки: slug → что написать. eyebrow — надстрочник, title — крупная строка. */
const CARDS = [
  { slug: 'index', eyebrow: 'Частный интернет-маркетолог', title: 'Маркетинг, который\nделаю я сам' },
  { slug: 'kontekstnaya-reklama', eyebrow: 'Яндекс Директ', title: 'Контекстная реклама,\nкоторая приносит клиентов' },
  { slug: 'targetirovannaya-reklama', eyebrow: 'VK Ads', title: 'Таргетированная\nреклама' },
  { slug: 'geo-servisy', eyebrow: 'Яндекс Карты · 2ГИС · Яндекс Бизнес', title: 'Клиенты\nиз карт' },
  { slug: 'razrabotka-sajtov', eyebrow: 'Разработка', title: 'Сайт, который\nпродаёт' },
  { slug: 'keysy', eyebrow: 'Кейсы · доказательства', title: 'Результат\nв цифрах' },
  { slug: 'contacts', eyebrow: 'Контакты', title: 'Обсудим\nвашу задачу' },
  { slug: 'about', eyebrow: 'Обо мне', title: 'Даниил Карацапов —\nмаркетолог' },
  { slug: 'ceny', eyebrow: 'Стоимость', title: 'Прозрачный\nпрайс' },
  { slug: 'blog', eyebrow: 'Блог', title: 'Разборы\nпо маркетингу' },
];

const portraitData = (() => {
  const p = join(ASSETS, 'portrait.jpg');
  if (!existsSync(p)) return null;
  return 'data:image/jpeg;base64,' + readFileSync(p).toString('base64');
})();

function cardHtml({ eyebrow, title }) {
  const lines = title.split('\n').map((l) => `<span>${l}</span>`).join('');
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px;overflow:hidden}
  body{
    background:#08080a; color:#eaeaee;
    font-family:"Liberation Sans","DejaVu Sans",sans-serif;
    display:flex; align-items:center; position:relative;
  }
  .glow{position:absolute;border-radius:50%;filter:blur(90px);opacity:.5}
  .g1{width:520px;height:520px;background:#b6f01e;top:-220px;left:-160px;opacity:.16}
  .g2{width:420px;height:420px;background:#b6f01e;bottom:-200px;left:380px;opacity:.09}
  .txt{position:relative;padding:0 48px 0 60px;flex:1;min-width:0}
  .eyebrow{
    color:#b6f01e; font-size:23px; font-weight:700;
    letter-spacing:.09em; text-transform:uppercase; margin-bottom:26px;
  }
  h1{font-size:66px;line-height:1.07;font-weight:700;letter-spacing:-.02em;display:flex;flex-direction:column}
  .foot{
    display:flex;align-items:center;gap:13px;margin-top:38px;
    font-size:22px;color:#9a9aa4;white-space:nowrap;
  }
  .dot{width:9px;height:9px;border-radius:50%;background:#b6f01e;flex:none}
  .foot b{color:#eaeaee;font-weight:700}
  .photo{
    width:400px;height:630px;flex:none;position:relative;
    background:#111;overflow:hidden;
  }
  .photo img{width:100%;height:100%;object-fit:cover;object-position:center 22%}
  .photo::after{
    content:"";position:absolute;inset:0;
    background:linear-gradient(90deg,#08080a 0%,rgba(8,8,10,.55) 22%,transparent 60%);
  }
  .bar{position:absolute;left:0;bottom:0;width:100%;height:7px;background:#b6f01e;z-index:2}
  </style></head><body>
    <div class="glow g1"></div><div class="glow g2"></div>
    <div class="txt">
      <div class="eyebrow">${eyebrow}</div>
      <h1>${lines}</h1>
      <div class="foot"><span class="dot"></span><b>Даниил Карацапов</b> · карацапов-даниил-маркетинг.рф</div>
    </div>
    ${portraitData ? `<div class="photo"><img src="${portraitData}" alt=""></div>` : ''}
    <div class="bar"></div>
  </body></html>`;
}

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

for (const card of CARDS) {
  const htmlPath = join(TMP, card.slug + '.html');
  const pngPath = join(TMP, card.slug + '.png');
  writeFileSync(htmlPath, cardHtml(card), 'utf8');
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--window-size=1200,630',
    '--virtual-time-budget=3000',
    '--screenshot=' + pngPath, htmlPath,
  ], { stdio: 'ignore' });

  // PNG → JPG: превью в мессенджерах весит меньше и грузится быстрее.
  const sharp = (await import('sharp')).default;
  await sharp(pngPath).jpeg({ quality: 86, mozjpeg: true })
    .toFile(join(OUT, card.slug + '.jpg'));
  console.log('OG:', card.slug + '.jpg');
}

// og-cover.jpg — на него уже ссылаются /keysy/ и /razrabotka-sajtov/.
copyFileSync(join(OUT, 'index.jpg'), join(ASSETS, 'og-cover.jpg'));
rmSync(TMP, { recursive: true, force: true });
console.log('Готово:', CARDS.length + 1, 'файлов в assets/og/');
