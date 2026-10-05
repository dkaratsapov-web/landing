# Коммерческие предложения

Одностраничные КП под конкретного клиента: печатный A4, три полосы,
самодостаточный HTML (шрифт вшит в base64) и PDF из него.

## Сборка

```bash
node build-kp.mjs                       # собирает все *.src.html в каталоге
/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf=kp-plainglobal.pdf --virtual-time-budget=8000 \
  file://$PWD/kp-plainglobal.html
```

Правятся только `*.src.html`; собранные `*.html` перезаписываются сборкой.

Общая вёрстка полос лежит в `kp-base.css` и подставляется вместо `/*BASE*/`,
шрифт — вместо `/*FONTS*/`. В исходнике каждого КП остаётся только содержание
и то, что специфично именно для него. Правка `kp-base.css` меняет все КП сразу —
после неё стоит перемерить запас снизу на каждом.

## Про вёрстку

Полоса — это `.page` с фиксированными 210×297 мм и `overflow:hidden`, поэтому
лишний контент не переносится на следующую страницу, а молча обрезается.
`.page > *{flex-shrink:0}` не даёт флексу вместо этого сплющить содержимое —
без него SVG со схемой ужимался вдвое и никакой ошибки при этом не возникало.
Перед выкладкой стоит померить запас снизу на каждой полосе:

```bash
cp kp-plainglobal.html /tmp/m.html
cat >> /tmp/m.html <<'JS'
<script>document.title=[...document.querySelectorAll('.page')].map(p=>{
  const l=p.lastElementChild.getBoundingClientRect(), r=p.getBoundingClientRect();
  return Math.round(r.bottom-l.bottom);}).join(',');</script>
JS
```

Нижний padding полосы — 14 мм ≈ 53 px, значит здоровые значения около 53.
Заметно меньше — контент лезет в поля.

## Файлы

| Файл | Что это |
| --- | --- |
| `kp-base.css` | общая вёрстка полос, одна на все КП |
| `nunito-embed.css` | Nunito (cyrillic + latin, 400/600/700/800) в base64 |
| `kp-plainglobal.*` | КП на сайт-каталог для PLAIN |
| `kp-shkola-dmitrovskiy.*` | КП на сайт и CRM для школы «Дмитровский» |
| `kp-diauto69-target.*` | КП на таргет в VK, Telegram и MAX для «ДиАвто69» |
| `preview-*.png`, `shkola-*.png` | превью полос |

Превью полос снимаются по одной: к собранному файлу дописывается

```html
<style>.page{display:none!important} .page:nth-of-type(2){display:flex!important}</style>
```

и делается скриншот в окне 794×1330. Кропать общий скриншот тоже можно, но
для этого нужен sharp, а он в окружении есть не всегда.
