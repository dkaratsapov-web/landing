# Фоновые материалы (Higgsfield AI)

Сгенерированы в Higgsfield в стиле брендбука: тёмная база `#08080a`, лаймовый
акцент `#b6f01e`. Используются как **верхний** слой поверх кодовых CSS-подложек
(`.hero-gen` / `.aurora-layer` в `landing.css`). Если файл отсутствует — страница
показывает кодовый градиент, без «битых» картинок.

| Файл            | Назначение                         | Higgsfield job ID                      |
|-----------------|------------------------------------|----------------------------------------|
| `hero-bg.webp`  | подложка hero-секции (16:9)        | `9ad00526-1f11-412f-a3f8-91d218915ee4` |
| `aurora.webp`   | aurora-полоса блока «Аудит» (21:9) | `141fc830-2d76-4808-a21e-4c82469f6c6d` |

Исходники Higgsfield — PNG 1k (~1.5 МБ каждый). Для веба сконвертированы в WebP
q82 (~24 КБ и ~15 КБ, экономия ~98%) — мягкие градиенты не теряют качества.

## Перегенерация / замена

`scripts/fetch-higgsfield-bg.sh` скачивает исходные PNG из Higgsfield (нужен
egress на `*.cloudfront.net`). После скачивания конвертируйте в WebP:

```bash
node -e "const s=require('sharp');['hero-bg','aurora'].forEach(n=>\
  s('project/assets/bg/'+n+'.png').webp({quality:82}).toFile('project/assets/bg/'+n+'.webp'))"
NODE_PATH=/tmp/node_modules node project/build.mjs project dist
```
