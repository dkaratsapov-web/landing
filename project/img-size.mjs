/* img-size.mjs — размеры картинки из самого файла.

   Зачем. Браузер не знает пропорций картинки, пока её не загрузит, поэтому
   до загрузки отводит под неё нулевую высоту, а потом раздвигает текст.
   Это Cumulative Layout Shift — одна из трёх метрик Core Web Vitals, то
   есть фактор ранжирования, а не косметика. Лечится атрибутами width и
   height: по ним браузер резервирует место заранее.

   Почему из файла, а не руками в разметке. Замер по собранному сайту дал
   сто шестьдесят два изображения без размеров в семи разных шаблонах.
   Проставлять числа руками — гарантированно ошибиться и разъехаться при
   первой же замене картинки. Здесь размеры читаются из заголовка самого
   файла на сборке, поэтому врать не могут.

   Разбираем три формата, которые есть в проекте: JPEG, PNG, WebP. Формат
   определяется по сигнатуре, а не по расширению: .jpg, внутри которого
   лежит png, встречается чаще, чем хотелось бы. */
import { readFileSync } from 'node:fs';

export function imageSize(path) {
  let buf;
  try { buf = readFileSync(path); } catch { return null; }
  if (buf.length < 24) return null;

  /* PNG: сигнатура, потом чанк IHDR с шириной и высотой по смещению 16. */
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }

  /* WebP: RIFF-контейнер, дальше три разновидности — VP8, VP8L, VP8X. */
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8X') {
      return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
    }
    if (kind === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
    }
    if (kind === 'VP8 ') {
      return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    }
    return null;
  }

  /* JPEG: идём по маркерам до SOF, где лежат размеры. Пропускать секции
     нужно по объявленной длине — искать числа поиском по файлу нельзя,
     они встретятся в данных изображения. */
  if (buf.readUInt16BE(0) === 0xffd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }              // выравниваемся на маркер
      const marker = buf[i + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      const len = buf.readUInt16BE(i + 2);
      /* SOF0…SOF15, кроме DHT (c4), JPGA (c8) и DAC (cc) — они не про размер. */
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  return null;
}
