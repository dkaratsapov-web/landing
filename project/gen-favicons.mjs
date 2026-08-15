/* gen-favicons.mjs — растровые иконки сайта из favicon.svg.

   Зачем. Яндекс.Вебмастер выдавал две рекомендации: «файл favicon недоступен
   для робота» и «добавьте favicon в формате SVG или размером 120×120».
   На сайте был только SVG, объявленный через <link rel="icon">. Робот
   Яндекса при этом ходит и напрямую за /favicon.ico по корню сайта, и
   отдельно просит растр 120×120 — одного SVG ему мало.

   Что генерируется:
     favicon.ico        — 16/32/48 в одном файле, лежит в корне: туда робот
                          стучится без всяких <link>
     favicon-120.png    — ровно тот размер, который просит Вебмастер
     apple-touch-icon.png — 180×180 для iOS

   Фон непрозрачный, цвет полотна сайта: на прозрачном лаймовый самолётик
   пропадал на светлых вкладках и в панелях, которые подкладывают белое.

   Запуск: node project/gen-favicons.mjs
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const SVG = readFileSync(join(HERE, 'favicon.svg'));
const BG = { r: 0x08, g: 0x08, b: 0x0a, alpha: 1 };

/* Поля вокруг знака: вплотную к краю иконка выглядит обрезанной, особенно
   когда браузер скругляет её на вкладке. */
const PAD = 0.16;

async function png(size) {
  const inner = Math.round(size * (1 - PAD * 2));
  const mark = await sharp(SVG, { density: 512 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/* ICO собираем руками: sharp его не пишет, а тащить зависимость ради
   шестидесяти байт заголовка незачем. Начиная с Vista внутрь ICO кладут
   готовый PNG — это понимают все браузеры и роботы. */
function ico(images) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);              // reserved
  head.writeUInt16LE(1, 2);              // type: icon
  head.writeUInt16LE(images.length, 4);  // count

  let offset = 6 + images.length * 16;
  const dir = [];
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);                  // палитра не используется
    e.writeUInt8(0, 3);                  // reserved
    e.writeUInt16LE(1, 4);               // цветовые плоскости
    e.writeUInt16LE(32, 6);              // бит на пиксель
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    dir.push(e);
    offset += data.length;
  }
  return Buffer.concat([head, ...dir, ...images.map((i) => i.data)]);
}

const sizes = [16, 32, 48];
const parts = [];
for (const size of sizes) parts.push({ size, data: await png(size) });

writeFileSync(join(HERE, 'favicon.ico'), ico(parts));
writeFileSync(join(HERE, 'favicon-120.png'), await png(120));
writeFileSync(join(HERE, 'apple-touch-icon.png'), await png(180));

console.log('Иконки: favicon.ico (16/32/48), favicon-120.png, apple-touch-icon.png');
