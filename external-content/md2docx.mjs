/* md2docx.mjs — статьи из Markdown в .docx для загрузки в редакторы площадок.

   Зачем: Markdown удобен для хранения в репозитории, но в редакторе Дзена и
   VC он не работает — разметка вставится текстом как есть. Word открывается
   везде, и из него копируется с сохранением жирного и заголовков.

   Метки картинок (*Картинка: файл.jpg*) остаются в тексте отдельной строкой
   и подсвечены — при публикации строку удаляют, а на её место ставят файл
   из папки images. Так место картинки не теряется при копировании.

   Запуск: node external-content/md2docx.mjs
*/
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
} from 'docx';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'docx');

/* Разбор inline-разметки: **жирный**, *курсив*, `код`. Возвращает TextRun'ы.
   Регулярка одна на все три случая, потому что порядок важен: **…** должен
   разбираться раньше, чем *…*, иначе двойные звёздочки съест курсив. */
function inlineRuns(text, baseOpts = {}) {
  const runs = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push(new TextRun({ ...baseOpts, text: text.slice(last, m.index) }));
    const tok = m[0];
    if (tok.startsWith('**')) {
      runs.push(new TextRun({ ...baseOpts, text: tok.slice(2, -2), bold: true }));
    } else if (tok.startsWith('`')) {
      runs.push(new TextRun({ ...baseOpts, text: tok.slice(1, -1), font: 'Consolas' }));
    } else if (tok.startsWith('[')) {
      // Ссылку разворачиваем в «текст (адрес)»: в Дзене и VC ссылки в теле
      // всё равно ставятся руками, а так адрес не теряется.
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      runs.push(new TextRun({ ...baseOpts, text: mm[1] }));
      if (!mm[2].startsWith('/')) {
        runs.push(new TextRun({ ...baseOpts, text: ` (${mm[2]})`, color: '777777' }));
      }
    } else {
      runs.push(new TextRun({ ...baseOpts, text: tok.slice(1, -1), italics: true }));
    }
    last = m.index + tok.length;
  }
  if (last < text.length) runs.push(new TextRun({ ...baseOpts, text: text.slice(last) }));
  return runs.length ? runs : [new TextRun({ ...baseOpts, text })];
}

function parse(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Таблица: строка с | и следующая — разделитель
    if (line.trim().startsWith('|') && (lines[i + 1] || '').includes('---')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].split('|').slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c.replace(/\s/g, '')))) rows.push(cells);
        i++;
      }
      const cols = rows[0].length;
      const colW = Math.floor(9360 / cols);
      out.push(new Table({
        columnWidths: Array(cols).fill(colW),
        rows: rows.map((cells, r) => new TableRow({
          children: cells.map((c) => new TableCell({
            width: { size: colW, type: WidthType.DXA },
            shading: r === 0
              ? { type: ShadingType.CLEAR, fill: 'F0F2E8' }
              : undefined,
            children: [new Paragraph({
              children: inlineRuns(c, r === 0 ? { bold: true } : {}),
              spacing: { before: 60, after: 60 },
            })],
          })),
        })),
      }));
      out.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      continue;
    }

    // Заголовки
    if (line.startsWith('## ')) {
      out.push(new Paragraph({
        children: inlineRuns(line.slice(3)),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 140 },
      }));
      i++; continue;
    }
    if (line.startsWith('# ')) {
      out.push(new Paragraph({
        children: inlineRuns(line.slice(2)),
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 220 },
      }));
      i++; continue;
    }

    // Горизонтальная черта
    if (/^---+$/.test(line.trim())) {
      out.push(new Paragraph({
        text: '',
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 1 } },
        spacing: { before: 200, after: 200 },
      }));
      i++; continue;
    }

    // Цитата
    if (line.startsWith('> ')) {
      out.push(new Paragraph({
        children: inlineRuns(line.slice(2), { italics: true, color: '555555' }),
        indent: { left: 400 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'B6F01E', space: 8 } },
        spacing: { before: 100, after: 100 },
      }));
      i++; continue;
    }

    // Списки
    if (/^[-*] /.test(line)) {
      out.push(new Paragraph({
        children: inlineRuns(line.slice(2)),
        bullet: { level: 0 },
        spacing: { after: 80 },
      }));
      i++; continue;
    }
    if (/^\d+\. /.test(line)) {
      out.push(new Paragraph({
        children: inlineRuns(line.replace(/^\d+\. /, '')),
        numbering: { reference: 'num', level: 0 },
        spacing: { after: 80 },
      }));
      i++; continue;
    }

    // Метка картинки — отдельным заметным блоком
    const img = /^\*(Обложка|Картинка): ([^*]+)\*$/.exec(line.trim());
    if (img) {
      out.push(new Paragraph({
        children: [new TextRun({
          text: `[ ${img[1].toUpperCase()}: ${img[2]} — вставить файл из папки images, эту строку удалить ]`,
          bold: true, color: '5C7A00',
        })],
        shading: { type: ShadingType.CLEAR, fill: 'F2F7E0' },
        spacing: { before: 160, after: 160 },
      }));
      i++; continue;
    }

    out.push(new Paragraph({
      children: inlineRuns(line),
      spacing: { after: 160, line: 300 },
    }));
    i++;
  }
  return out;
}

function build(mdPath, outPath) {
  const md = readFileSync(mdPath, 'utf8');
  const doc = new Document({
    numbering: {
      config: [{
        reference: 'num',
        levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START }],
      }],
    },
    styles: {
      default: {
        document: { run: { font: 'Georgia', size: 22 } },
        heading1: { run: { font: 'Georgia', size: 40, bold: true, color: '1A1A1A' } },
        heading2: { run: { font: 'Georgia', size: 28, bold: true, color: '1A1A1A' } },
      },
    },
    sections: [{
      properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
      children: parse(md),
    }],
  });
  return Packer.toBuffer(doc).then((buf) => {
    writeFileSync(outPath, buf);
    console.log('  ', basename(outPath));
  });
}

mkdirSync(join(OUT, 'dzen'), { recursive: true });
mkdirSync(join(OUT, 'vc'), { recursive: true });

for (const platform of ['dzen', 'vc']) {
  console.log(platform + ':');
  const dir = join(HERE, platform);
  /* Руководство по публикации — инструкция к архиву, а не статья.
     В zip оно кладётся из .md как есть, в Word его переводить незачем. */
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md') && x !== 'KAK-PUBLIKOVAT.md')) {
    await build(join(dir, f), join(OUT, platform, f.replace(/\.md$/, '.docx')));
  }
}
console.log('\nГотово:', OUT);
