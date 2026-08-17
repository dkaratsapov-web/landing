/* check-seams.mjs — проверка самой проверки.
 *
 * Зачем это нужно. Детектор полос на стыках (seam-detector.mjs) приходится
 * время от времени подкручивать: то он находил полосу в тонкой линии фонового
 * узора, то, наоборот, мог её проглядеть. Любая такая подкрутка — это риск
 * ослепить его насовсем, а узнаю я об этом не сразу: молчащая проверка
 * выглядит ровно как чистая страница. Дефект уже возвращался четырежды, и
 * трижды я отчитывался, что всё чисто.
 *
 * Поэтому здесь детектору подсовывают заведомые случаи и требуют правильного
 * ответа: три внедрённых дефекта он обязан найти, узор из тонких линий —
 * пропустить, а страница как есть должна быть чистой.
 *
 * Запуск: node project/check-seams.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findSeams, SHOT_CSS } from './seam-detector.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = 8129;

/* Playwright может стоять и локально, и глобально — как в check.mjs. */
async function load(name) {
  try { return await import(name); } catch { /* пробуем глобальный каталог */ }
  try {
    const { execSync } = await import('node:child_process');
    const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
    for (const entry of ['index.mjs', 'index.js']) {
      const f = join(root, name, entry);
      if (existsSync(f)) return await import(pathToFileURL(f).href);
    }
  } catch { /* нет и глобально */ }
  return null;
}
const pw = await load('playwright');
const sh = await load('sharp');
if (!pw || !sh) {
  console.log('check-seams: нужны playwright и sharp — пропускаю проверку.');
  process.exit(0);
}
const { chromium } = pw;
const sharp = sh.default || sh;

if (!existsSync(join(ROOT, 'index.html'))) {
  console.log('check-seams: нет dist/index.html — сначала `npm run build`.');
  process.exit(1);
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain',
  '.pdf': 'application/pdf', '.md': 'text/markdown' };
const server = createServer((req, res) => {
  let p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(PORT, r));

/* expect: сколько находок ждём — 'нет' или 'есть'. */
const CASES = [
  { name: 'страница как есть', expect: 'нет', css: '' },
  { name: 'тёмная полоса 70px на стыке', expect: 'есть',
    css: '.sec-edge{background:#000!important;height:70px!important}' },
  { name: 'светлая полоса 40px на стыке', expect: 'есть',
    css: '.sec-edge{background:#1a1a1e!important;height:40px!important}' },
  /* Ровно та причина, из-за которой полоса держалась дольше всего: у секций
     были собственные непрозрачные фоны, а у разделителя между ними — нет. */
  { name: 'непрозрачные фоны секций', expect: 'есть',
    css: '.sec.bg-b{background:#0d0d0f!important}' },
  /* А это не дефект: фоновый узор из тонких линий. Детектор обязан молчать. */
  { name: 'узор из тонких линий каждые 60px', expect: 'нет',
    css: 'main::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;'
      + 'background:repeating-linear-gradient(to bottom,transparent 0 58px,rgba(255,255,255,.07) 58px 60px)}' },
];

const browser = await chromium.launch();
let failed = 0;
for (const c of CASES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: SHOT_CSS + c.css });
  await page.waitForTimeout(250);
  const { data, info } = await sharp(await page.screenshot({ fullPage: true }))
    .raw().toBuffer({ resolveWithObject: true });
  const hits = findSeams(data, info);
  const got = hits.length ? 'есть' : 'нет';
  const ok = got === c.expect;
  if (!ok) failed++;
  console.log(`${ok ? '  ok  ' : '  ПРОВАЛ'} ${c.name.padEnd(34)} ждали: ${c.expect.padEnd(4)} нашли: ${hits.length}`
    + (hits.length ? `  напр. y=${hits[0].y} (${hits[0].side}), скачок ${hits[0].d.toFixed(1)}` : ''));
  await page.close();
}
await browser.close();
server.close();

if (failed) {
  console.log(`\ncheck-seams: провалено ${failed} из ${CASES.length}.`);
  console.log('Если провалились внедрённые дефекты — детектор ослеп, чинить его, а не вёрстку.');
  console.log('Если провалилась «страница как есть» — полоса вернулась на сайт.');
  process.exit(1);
}
console.log(`\ncheck-seams: ${CASES.length} из ${CASES.length} — детектор различает полосу и узор.`);
