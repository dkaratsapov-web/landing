/* build-kp.mjs — собирает самодостаточные HTML коммерческих предложений.
   Подставляет два куска: шрифт Nunito в base64 и общую вёрстку полос из
   kp-base.css. Файл на выходе открывается и печатается одинаково на любой
   машине без интернета, а в исходнике каждого КП остаётся только его
   содержание и то, что специфично именно для него.

   Плейсхолдеры в исходнике: FONTS и BASE внутри комментариев CSS.
   Собирает все *.src.html в каталоге; имя результата — без .src. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const font = readFileSync('nunito-embed.css', 'utf8');
const base = readFileSync('kp-base.css', 'utf8');
const MARKS = [['FONTS', font], ['BASE', base]];

for (const src of readdirSync('.').filter(f => f.endsWith('.src.html')).sort()) {
  let html = readFileSync(src, 'utf8');
  for (const [name, value] of MARKS) {
    const mark = '/*' + name + '*/';
    if (!html.includes(mark)) throw new Error(`${src}: нет плейсхолдера ${name}`);
    html = html.replace(mark, value);
  }
  const out = src.replace('.src.html', '.html');
  writeFileSync(out, html);
  console.log(`${out} готов`);
}
