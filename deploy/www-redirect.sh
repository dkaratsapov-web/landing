#!/usr/bin/env bash
#
# www-redirect.sh — переадресация www.karatsapov.ru на основной адрес.
#
# Зачем. После выпуска сертификата certbot оставил оба имени в одном
# server-блоке, и www отдаёт сайт напрямую с кодом 200. Для поисковика это
# два адреса с одинаковым содержимым: вес делится, а в выдаче может
# оказаться не тот вариант. Канонические адреса на страницах прописаны без
# www, и поисковик это учтёт, но постоянный редирект надёжнее подсказки.
#
# Почему отдельным скриптом, а не заменой конфига из репозитория. Конфиг
# после certbot содержит блоки с путями к сертификату, которых в исходном
# файле нет. Перезаписать файл целиком — значит снести их и уронить https.
# Поэтому правка точечная, с резервной копией и откатом.
#
# Запуск на сервере:
#   curl -fsSL https://raw.githubusercontent.com/dkaratsapov-web/landing/main/deploy/www-redirect.sh | sudo bash

set -euo pipefail

CONF="/etc/nginx/sites-available/karatsapov.ru"
[ -f "$CONF" ] || CONF="/etc/nginx/sites-available/landing"
[ -f "$CONF" ] || { echo "Не нашёл конфиг сайта в /etc/nginx/sites-available/"; exit 1; }

BACKUP="/root/nginx-$(basename "$CONF").before-www-redirect"

say() { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "Запускайте через sudo."; exit 1; }

if grep -q 'server_name www.karatsapov.ru;' "$CONF"; then
  say "Редирект уже настроен, ничего не делаю"
  exit 0
fi

say "Сохраняю копию в $BACKUP"
cp "$CONF" "$BACKUP"

# Восстановление при любой ошибке дальше: без этого неудачная правка
# оставила бы сайт без https до ручного вмешательства.
rollback() {
  printf '\n\033[1;31mОшибка. Возвращаю конфиг из копии.\033[0m\n'
  cp "$BACKUP" "$CONF"
  nginx -t && systemctl reload nginx
}
trap rollback ERR

say "Убираю www из основных блоков"
# Имена перечислены через пробел в одной строке — и в блоке с сертификатом,
# и в блоке редиректа с http, который создал certbot.
sed -i 's/server_name karatsapov\.ru www\.karatsapov\.ru;/server_name karatsapov.ru;/g' "$CONF"

say "Добавляю блоки для www"
cat >> "$CONF" <<'CONFIG'

# ── www → основной адрес ─────────────────────────────────────────────────
# Отдельными блоками, а не вторым именем в основном: сайт должен быть
# доступен по одному адресу, остальные — вести на него.
server {
    listen 80;
    listen [::]:80;
    server_name www.karatsapov.ru;
    return 301 https://karatsapov.ru$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name www.karatsapov.ru;

    # Сертификат тот же: он выпущен сразу на оба имени.
    ssl_certificate     /etc/letsencrypt/live/karatsapov.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/karatsapov.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://karatsapov.ru$request_uri;
}
CONFIG

say "Проверяю синтаксис"
nginx -t

systemctl reload nginx
trap - ERR

# systemctl reload возвращает управление сразу, а рабочие процессы nginx
# переключаются мгновением позже. Проверка сразу после перезагрузки успевает
# попасть на старые и показывает, что правка не сработала, хотя она в
# порядке. Ждём, пока www начнёт отвечать переадресацией.
say "Жду переключения рабочих процессов"
for _ in $(seq 1 10); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' https://www.karatsapov.ru)" = "301" ] && break
  sleep 1
done

say "Проверяю результат"
for u in "http://www.karatsapov.ru" "https://www.karatsapov.ru" "https://karatsapov.ru"; do
  printf '   %-32s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code} → %{redirect_url}' "$u")"
done

cat <<EOF

Готово. Ожидаемая картина:
  http://www.karatsapov.ru   301 → https://karatsapov.ru/
  https://www.karatsapov.ru  301 → https://karatsapov.ru/
  https://karatsapov.ru      200

Копия прежнего конфига: $BACKUP
Вернуть, если что: cp $BACKUP $CONF && nginx -t && systemctl reload nginx
EOF
