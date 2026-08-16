/* pack.mjs — сборка архивов с материалами для площадок.

   Зачем. Архивы собирались руками, и это кончилось предсказуемо: статью №2
   для Дзена заменили, но txt-версия осталась от прежнего материала, а
   руководство по публикации существовало только внутри zip — в репозитории
   его не было вовсе. Проверить такое глазами нельзя, поэтому сборка стала
   скриптом.

   Раскладка внутри архива — по одной папке на статью, а не по типам файлов.
   Человек публикует статью целиком: ему нужны текст, обложка и картинки
   рядом, а не три папки, между которыми надо ходить.

   Имена внутри архива намеренно латиницей. Прежний архив хранил
   «КАК-ПУБЛИКОВАТЬ.md» без флага UTF-8, и в проводнике Windows он
   открывался кракозябрами.

   Запуск: node external-content/pack.mjs
*/
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from '../node_modules/jszip/lib/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));

/* Фиксированная дата на всех записях. Без неё zip меняется при каждой
   сборке, даже когда содержимое то же самое, и по diff'у не понять,
   поменялось ли что-то на самом деле. */
const STAMP = new Date('2026-01-01T00:00:00Z');

function packPlatform(platform, zipName) {
  const src = join(HERE, platform);
  if (!existsSync(src)) return null;

  const zip = new JSZip();
  const articles = readdirSync(src)
    .filter((f) => f.endsWith('.md') && f !== 'KAK-PUBLIKOVAT.md')
    .sort();

  const guide = join(src, 'KAK-PUBLIKOVAT.md');
  if (existsSync(guide)) {
    zip.file('KAK-PUBLIKOVAT.md', readFileSync(guide), { date: STAMP });
  }

  const report = [];
  for (const md of articles) {
    const slug = basename(md, '.md');
    const dir = zip.folder(slug);
    let n = 0;

    dir.file(md, readFileSync(join(src, md)), { date: STAMP });

    for (const [sub, ext] of [['docx', '.docx'], ['txt', '.txt']]) {
      const p = join(HERE, sub, platform, slug + ext);
      if (existsSync(p)) { dir.file(slug + ext, readFileSync(p), { date: STAMP }); n++; }
    }

    /* Картинки статьи опознаются по префиксу «<платформа>-<номер>-». Обложка
       уезжает в корень папки статьи с приставкой OBLOZHKA, остальные — в
       kartinki: обложка ставится в отдельное поле редактора, и путать её с
       иллюстрациями из тела текста не должно быть возможности. */
    const num = slug.slice(0, 2);
    const prefix = `${platform}-${num}-`;
    const imgs = readdirSync(join(HERE, 'images')).filter((f) => f.startsWith(prefix)).sort();
    const inner = dir.folder('kartinki');
    let pics = 0;
    for (const img of imgs) {
      const buf = readFileSync(join(HERE, 'images', img));
      if (img.includes('-cover.')) dir.file('OBLOZHKA-' + img, buf, { date: STAMP });
      else { inner.file(img, buf, { date: STAMP }); pics++; }
    }
    report.push(`  ${slug}: ${n} текстовых + обложка + ${pics} картинок`);
  }

  return { zip, report, count: articles.length, out: join(HERE, zipName) };
}

/* Площадка задаётся аргументом: `node external-content/pack.mjs vc`. По
   умолчанию собирается только Дзен — раскладка «папка на статью» пришла
   именно оттуда, а архив для VC исторически плоский, и молча перекладывать
   его на новую структуру значит ломать то, что человек уже скачал. */
const WANTED = process.argv.slice(2);
const PLATFORMS = [['dzen', 'dzen-materialy.zip'], ['vc', 'vc-materialy.zip']]
  .filter(([p]) => (WANTED.length ? WANTED.includes(p) : p === 'dzen'));

for (const [platform, name] of PLATFORMS) {
  const built = packPlatform(platform, name);
  if (!built) continue;
  const buf = await built.zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  writeFileSync(built.out, buf);
  console.log(`${name} — ${built.count} статей, ${(buf.length / 1024 / 1024).toFixed(2)} МБ`);
  built.report.forEach((r) => console.log(r));
}
