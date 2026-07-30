# lead-proxy — приём заявок без секретов на клиенте

Раньше токен Telegram-бота лежал в `project/lead-config.js` и отдавался каждому
посетителю сайта. Теперь браузер знает только адрес этого воркера, а токен
живёт в переменных окружения Cloudflare.

## Что сделать один раз

### 1. Отозвать старый токен

Старый токен нужно считать скомпрометированным — он был в публичном
JS-файле и в истории git.

```
@BotFather → /mybots → выбрать бота → API Token → Revoke current token
```

Скопируйте новый токен, он понадобится на шаге 3.

### 2. Задеплоить воркер

```bash
npm install -g wrangler
cd worker
wrangler login
wrangler deploy
```

Wrangler напечатает адрес вида `https://lead-proxy.<ваш-субдомен>.workers.dev`.

### 3. Положить секреты

```bash
wrangler secret put TG_TOKEN   # новый токен от @BotFather
wrangler secret put TG_CHAT    # chat_id группы, например -4686927278
```

Секреты не попадают ни в git, ни в бандл — только в окружение воркера.

### 4. Прописать адрес на сайте

В `project/lead-config.js`:

```js
window.LEAD_ENDPOINT = 'https://lead-proxy.<ваш-субдомен>.workers.dev';
```

Пересобрать и задеплоить:

```bash
npm run build
git add -A && git commit -m "feat: подключён прокси заявок" && git push
```

### 5. Проверить

```bash
curl -X POST https://lead-proxy.<ваш-субдомен>.workers.dev \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai' \
  -d '{"name":"Тест","phone":"+7 (999) 111-22-33","source":"curl"}'
```

Ожидаемый ответ — `{"ok":true}`, в Telegram приходит сообщение.

## Пока эндпойнт не настроен

`LEAD_ENDPOINT` пустой — и это безопасное состояние, а не поломка. Формы
не делают вид, что заявка ушла: вместо ложного «Заявка отправлена!»
показывается панель с кнопками «Отправить в WhatsApp» и «Написать в
Telegram», где текст заявки уже подставлен. Ни одна заявка не теряется молча.

## Защита

| Механизм | Где |
|---|---|
| Проверка `Origin` | `ALLOWED_ORIGINS` в `wrangler.toml` |
| Honeypot-поле `company` | скрытое поле в каждой форме; заполнено → заявка молча отбрасывается |
| Ограничение частоты | биндинг `RATE_LIMIT`, 5 заявок с IP за 60 секунд |
| Лимиты длины полей | константа `MAX` в `lead-proxy.js` |
| Проверка телефона | минимум 11 цифр |

Если убрать блок `[[unsafe.bindings]]` из `wrangler.toml`, воркер продолжит
работать — просто без ограничения частоты.

## Контракт

`POST /` с JSON:

```json
{
  "name": "Иван",
  "phone": "+7 (999) 111-22-33",
  "site": "example.ru",
  "comment": "Нужен Директ",
  "source": "Контекстная реклама",
  "page": "/kontekstnaya-reklama/",
  "company": ""
}
```

Ответ: `{"ok": true}` либо `{"ok": false, "error": "<код>"}`.

Коды ошибок: `forbidden_origin`, `bad_json`, `bad_phone`, `rate_limited`,
`telegram_unreachable`, `telegram_error`, `telegram_rejected`.
