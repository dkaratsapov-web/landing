# Коммерческие предложения

Одностраничные КП под конкретного клиента: печатный A4, три полосы,
самодостаточный HTML (шрифт вшит в base64) и PDF из него.

## Сборка

```bash
node build-kp.mjs                       # подставляет шрифт → kp-plainglobal.html
/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf=kp-plainglobal.pdf --virtual-time-budget=8000 \
  file://$PWD/kp-plainglobal.html
```

Правится только `kp-plainglobal.src.html`; собранный `kp-plainglobal.html`
перезаписывается сборкой.

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
| `kp-plainglobal.src.html` | исходник, здесь правим |
| `kp-plainglobal.html` | собранный самодостаточный файл |
| `kp-plainglobal.pdf` | то, что отправляется клиенту |
| `preview-1..3.png` | превью полос |
| `nunito-embed.css` | Nunito (cyrillic + latin, 400/600/700/800) в base64 |
