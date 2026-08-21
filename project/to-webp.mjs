/* to-webp.mjs — перевод снимков в WebP.

   Зачем. В assets 102 файла JPEG на 6 МБ против 10 файлов WebP на 1 МБ.
   WebP при том же визуальном качестве весит примерно вдвое-втрое меньше, а
   поддерживают его все браузеры, которые сегодня встречаются в статистике.
   Вес картинок — это Largest Contentful Paint, то есть снова Core Web
   Vitals, а не абстрактная «оптимизация».

   Что делает. Рядом с каждым .jpg кладёт .webp и переписывает ссылки в
   исходниках. Оригиналы остаются на диске: они нужны для Open Graph —
   часть соцсетей и мессенджеров до сих пор не показывает превью в WebP.

   Запуск разовый, руками: node project/to-webp.mjs [--dry]. В сборку не
   встроен намеренно — конвертация идёт секунды и повторять её на каждом
   билде незачем, а результат лежит в репозитории.
*/
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const ROOT = 'project';
const DRY = process.argv.includes('--dry');

/* Что остаётся в JPEG и почему.

   `/assets/og/` — карточки для соцсетей.
   `*-cover.jpg` — обложки статей: они же уходят в og:image, а часть
   мессенджеров и соцсетей до сих пор не показывает превью в WebP. Потерять
   превью при репосте дороже, чем сэкономить сто килобайт. */
const KEEP_JPEG = /(\/assets\/og\/|-cover\.jpe?g$)/;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(join(ROOT, 'assets'))
  .filter((p) => /\.jpe?g$/i.test(p) && !KEEP_JPEG.test(p.replace(/\\/g, '/')));

let saved = 0, made = 0;
for (const src of files) {
  const dst = src.replace(/\.jpe?g$/i, '.webp');
  if (existsSync(dst)) continue;
  const before = statSync(src).size;
  if (!DRY) {
    /* quality 82 — граница, за которой разница с оригиналом перестаёт быть
       заметной на фотографиях, но вес ещё падает существенно. */
    await sharp(src).webp({ quality: 82 }).toFile(dst);
  }
  const after = DRY ? Math.round(before * 0.45) : statSync(dst).size;
  saved += before - after;
  made++;
}
console.log(`${DRY ? '[примерка] ' : ''}сконвертировано: ${made}, экономия ≈ ${(saved / 1024 / 1024).toFixed(1)} МБ`);

/* Ссылки в исходниках. Меняем только те, для которых webp реально создан. */
/* Генераторы картинок не трогаем: пути в них — это то, что скрипт создаёт,
   а не то, что страница показывает. Подмена расширения там сломала бы саму
   генерацию. */
const SKIP_SOURCES = /(gen-og|gen-illustrations|illustrations|to-webp)\.mjs$/;
const sources = walk(ROOT)
  .filter((p) => /\.(html|mjs|jsx|css|json)$/.test(p) && !SKIP_SOURCES.test(p));
let touched = 0;
for (const p of sources) {
  let t = readFileSync(p, 'utf8');
  const before = t;
  t = t.replace(/([\w./-]*assets\/[\w./-]+)\.jpe?g/g, (m, base) => {
    if (KEEP_JPEG.test(('/' + m).replace(/\\/g, '/'))) return m;
    const file = join(ROOT, 'assets', m.split('assets/')[1].replace(/\.jpe?g$/i, '.webp'));
    return existsSync(file) ? `${base}.webp` : m;
  });
  if (t !== before) { touched++; if (!DRY) writeFileSync(p, t, 'utf8'); }
}
console.log(`${DRY ? '[примерка] ' : ''}файлов с обновлёнными ссылками: ${touched}`);
