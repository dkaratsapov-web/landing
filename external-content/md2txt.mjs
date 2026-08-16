/* md2txt.mjs — статьи из Markdown в обычный текст.

   Зачем. В комплекте для площадок кроме .docx лежит .txt — на случай, когда
   Word под рукой нет, а вставить текст надо. Раньше эти файлы делались
   руками, и это ровно так и кончилось: статью №2 для Дзена заменили, а
   txt-версия осталась от прежнего материала. В архив уезжали два разных
   текста под одним номером.

   Теперь txt собирается из тех же .md, что и .docx. Правила разметки
   повторяют то, что уже сложилось в существующих файлах, — конвертер
   писался под них и сверялся с ними построчно.

   Запуск: node external-content/md2txt.mjs
*/
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'txt');

const MARK = (kind, file) =>
  `[ ${kind}: ${file} — вставить файл из папки images, эту строку удалить ]`;

/* Inline-разметка снимается целиком: в обычном тексте звёздочки и обратные
   кавычки — мусор, а ссылка разворачивается в «текст (адрес)», чтобы адрес
   не потерялся при копировании в редактор. */
function inline(s) {
  return s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1');
}

function convert(md) {
  const out = [];
  const push = (line) => {
    /* Пустые строки не дублируем: в исходнике их бывает по две подряд после
       выброшенных подписей, а в готовом тексте это выглядит как дыра. */
    if (line === '' && out[out.length - 1] === '') return;
    out.push(line);
  };

  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();

    /* Подписи к обложке и картинкам в текст не идут: они для редактора
       площадки, а не для читателя, и в существующих txt их нет. */
    if (/^\*Подпись( обложки)?:/.test(line)) continue;

    const cover = line.match(/^\*Обложка:\s*(.+?)\*$/);
    if (cover) { push(''); push(MARK('ОБЛОЖКА', cover[1].trim())); push(''); continue; }

    const pic = line.match(/^\*Картинка:\s*(.+?)\*$/);
    if (pic) { push(''); push(MARK('КАРТИНКА', pic[1].trim())); push(''); continue; }

    /* Заголовки любого уровня — обычной строкой. Разметку Markdown редакторы
       Дзена и VC не понимают, а решётки в тексте читаются как опечатка. */
    const head = line.match(/^#{1,6}\s+(.*)$/);
    if (head) { push(''); push(inline(head[1].trim())); push(''); continue; }

    /* Горизонтальная черта перед подписью автора. В обычном тексте её видно
       только длинным тире — так она и набрана в уже готовых файлах. */
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) { push(''); push('—'.repeat(60)); push(''); continue; }

    /* Таблицы. Строку-разделитель выбрасываем, ячейки склеиваем через тире:
       моноширинного выравнивания в редакторе всё равно не будет. */
    if (/^\s*\|/.test(line)) {
      if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) continue;
      const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => inline(c.trim()));
      push(cells.filter(Boolean).join(' — '));
      continue;
    }

    /* Маркированный список — дефис, как в уже готовых файлах: длинное тире
       в списке путается с тире внутри самих пунктов. Нумерованный остаётся
       со своими номерами. */
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) { push('- ' + inline(li[1])); continue; }

    const num = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (num) { push(num[1] + '. ' + inline(num[2])); continue; }

    const qt = line.match(/^>\s?(.*)$/);
    if (qt) { push(inline(qt[1])); continue; }

    push(inline(line));
  }

  /* Пустые строки по краям снимаем: заголовок начинает файл с первой
     строки, а в конце остаётся ровно один перевод. */
  while (out.length && out[0] === '') out.shift();
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n') + '\n';
}

let n = 0;
for (const platform of ['dzen', 'vc']) {
  const src = join(HERE, platform);
  let files;
  try { files = readdirSync(src).filter((f) => f.endsWith('.md')); } catch { continue; }
  const dir = join(OUT, platform);
  mkdirSync(dir, { recursive: true });
  for (const f of files) {
    const txt = convert(readFileSync(join(src, f), 'utf8'));
    writeFileSync(join(dir, f.replace(/\.md$/, '.txt')), txt, 'utf8');
    n++;
  }
  console.log(platform + ': ' + files.length + ' файлов');
}
console.log('Готово, всего ' + n);
