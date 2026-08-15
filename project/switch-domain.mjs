/* switch-domain.mjs — перевод сайта на другой домен.

   Домен зашит в полусотне мест: канонические адреса и og:url на шести
   исторических страницах, идентификаторы в микроразметке, robots.txt,
   подписи на генерируемых картинках, тексты для Дзена и VC. Менять это
   руками — гарантированный пропуск пары вхождений, а забытый канонический
   адрес на старый домен отправляет вес на площадку, которой больше нет.

   Запуск (сначала всегда вхолостую):
     node project/switch-domain.mjs karatsapov.ru --dry
     node project/switch-domain.mjs karatsapov.ru

   Что делает: заменяет и punycode-хост, и человекочитаемое написание во всех
   отслеживаемых файлах. Кириллический домен в вёрстке встречается в двух
   видах, и заменять надо оба.

   Чего НЕ делает: не трогает DNS, не настраивает редиректы со старого домена
   и не переносит права в вебмастерах. Это внешние шаги, см. README.
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

/* Что меняем. Старый домен в двух написаниях: punycode (в адресах) и
   кириллицей (в видимом тексте и подписях на картинках). */
const OLD_PUNY = 'xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai';
const OLD_HUMAN = 'карацапов-даниил-маркетинг.рф';

const target = process.argv[2];
const dry = process.argv.includes('--dry');

if (!target || target.startsWith('--')) {
  console.error('Укажите новый домен: node project/switch-domain.mjs karatsapov.ru [--dry]');
  process.exit(1);
}
if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(target)) {
  console.error(`«${target}» не похож на домен. Ожидается вид karatsapov.ru`);
  process.exit(1);
}

/* Файлы берём из git, а не обходом каталога: так под замену не попадут
   dist/, node_modules и прочее невошедшее в репозиторий. */
const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(Boolean)
  .filter((f) => /\.(mjs|jsx|js|html|txt|json|md|css)$/.test(f))
  // dist/ — результат сборки, он перезапишется из исходников. Править его
  // бессмысленно и вводит в заблуждение при проверке диффа.
  .filter((f) => !f.startsWith('dist/'))
  // Сам скрипт: в нём старый домен лежит в константах OLD_*. Если позволить
  // заменить их, после первого же запуска скрипт начнёт считать «старым»
  // новый домен и молча перестанет находить то, что должен. Историю переездов
  // правим руками.
  .filter((f) => !f.endsWith('switch-domain.mjs'));

let touched = 0, replacements = 0;

for (const rel of tracked) {
  const abs = join(ROOT, rel);
  let src;
  try { src = readFileSync(abs, 'utf8'); } catch { continue; }

  const before = src;
  src = src.split(OLD_PUNY).join(target);
  src = src.split(OLD_HUMAN).join(target);
  if (src === before) continue;

  const n = (before.split(OLD_PUNY).length - 1) + (before.split(OLD_HUMAN).length - 1);
  replacements += n;
  touched++;
  console.log(`  ${dry ? '[вхолостую] ' : ''}${rel} — ${n}`);
  if (!dry) writeFileSync(abs, src, 'utf8');
}

console.log(`\n${dry ? 'Будет заменено' : 'Заменено'}: ${replacements} вхождений в ${touched} файлах`);

if (!dry) {
  console.log(`
Дальше вручную:
  1. node project/gen-og.mjs                    — перерисовать OG-карточки с новой подписью
  2. node project/gen-illustrations.mjs          — перерисовать иллюстрации статей
  3. ILL_SPECS=../external-content/illustrations-external.mjs \\
     ILL_OUT=external-content/images \\
     node project/gen-illustrations.mjs          — картинки для Дзена и VC
  4. npm run build && проверить dist/CNAME       — должен содержать ${target}
  5. Коммит и деплой
  6. Внешние шаги: DNS, редиректы со старого домена, переезд в вебмастерах`);
}
