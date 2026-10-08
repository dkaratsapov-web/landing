/* Собирает все слайды в один HTML и печатает его в PDF 1920×1080.
   Базовые размеры заголовков и отступы повторяют те, что задаёт
   рантайм презентации, — иначе браузерные значения по умолчанию
   разъедут вёрстку. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const DIR = dirname(fileURLToPath(import.meta.url));
const deck = JSON.parse(readFileSync(`${DIR}/project/deck.json`, 'utf8'));
const slides = deck.order.map((id) => readFileSync(`${DIR}/project/slides/${id}.html`, 'utf8'));

/* Шрифты. Обычно Chromium забирает их с Google Fonts сам. Но если он лишён
   выхода в сеть (так собиралась эта версия), положите рядом fonts/local.css
   со скачанными @font-face и путями к локальным woff2 — скрипт подхватит его
   и подставит вместо ссылок. Без шрифтов PDF соберётся на Arial, и кириллица
   в заголовках будет выглядеть не так, как в презентации. */
const localCss = `${DIR}/fonts/local.css`;
const links = existsSync(localCss)
  ? '<style>' + readFileSync(localCss, 'utf8') + '</style>'
  : Object.values(deck.faces).map((f) => `<link rel="stylesheet" href="${f.href}">`).join('\n');

const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8">
<title>${deck.title}</title>
${links}
<style>
  @page { size: 1920px 1080px; margin: 0 }
  * { box-sizing: border-box }
  html, body { margin: 0; padding: 0; background: #0A0A0C }
  section { width: 1920px; height: 1080px; position: relative; overflow: hidden; break-after: page }
  section:last-of-type { break-after: auto }
  h1, h2, h3, p, ul, ol, table, hr { margin: 0 }
  h1 { font-size: 96px; font-weight: 600; line-height: 1.1 }
  h2 { font-size: 64px; font-weight: 600; line-height: 1.15 }
  h3 { font-size: 44px; font-weight: 600; line-height: 1.2 }
  p  { font-size: 32px; font-weight: 400; line-height: 1.4 }
  ul, ol { padding-left: 1.3em }
  table { border-collapse: collapse; width: 100% }
  td, th { padding: 0.35em 0.6em; border-bottom: 1px solid rgba(255,255,255,0.10); text-align: left }
  hr { border: 0 }
  aside { display: none }
</style></head><body>
${slides.join('\n')}
</body></html>`;

writeFileSync(`${DIR}/.print.html`, html);

const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(`file://${DIR}/.print.html`, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(2500);
const loaded = await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight));
console.log('шрифты загружены:', [...new Set(loaded.map(s => s.split(' ')[0]))].join(', ') || 'НИ ОДНОГО');
await p.pdf({ path: `${DIR}/../Карацапов-презентация.pdf`, width: '1920px', height: '1080px', printBackground: true, pageRanges: '1-10' });
await b.close();
console.log('готово');
