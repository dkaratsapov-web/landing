# Аватарка для канала

Три варианта, 1080×1080. Дзен обрезает аватарку в круг — углы срезаются,
поэтому знак держится внутри вписанной окружности.

- `avatar-plane-dark.jpg`  — лаймовый самолётик на чёрном
- `avatar-plane-lime.jpg`  — чёрный самолётик на лайме
- `avatar-monogram.jpg`    — монограмма ДК

`preview-v-krugu.png` — как все три выглядят в круге при 260, 96 и 44 px
на белом фоне ленты.

Фото не использовал: на portrait.jpg телефон закрывает лицо, в кружке это
не читается совсем.

Перегенерировать: из корня репозитория
```
ILL_SPECS=../external-content/avatar/specs.mjs \
ILL_OUT=external-content/avatar \
node project/gen-illustrations.mjs
```
Текст монограммы меняется полем `text` в specs.mjs.
