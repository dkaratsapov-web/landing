#!/usr/bin/env bash
#
# setup-vps.sh — подготовка сервера к раздаче сайта.
#
# Запускать на сервере, один раз, от пользователя с sudo:
#   curl -fsSL https://raw.githubusercontent.com/dkaratsapov-web/landing/main/deploy/setup-vps.sh | sudo bash
# или, если репозиторий уже склонирован:
#   sudo bash deploy/setup-vps.sh
#
# Что делает: ставит nginx и certbot, создаёт каталоги, кладёт конфиг сайта,
# проверяет синтаксис и перезагружает nginx. Сертификат НЕ выпускает — это
# делается отдельным шагом после переключения DNS, иначе проверка домена не
# пройдёт: Let's Encrypt должен достучаться до этого сервера по имени.
#
# Скрипт можно запускать повторно: он ничего не ломает и не дублирует.

set -euo pipefail

DOMAIN="karatsapov.ru"
SITE_ROOT="/var/www/landing"
ACME_ROOT="/var/www/acme"
CONF_NAME="$DOMAIN"
RAW="https://raw.githubusercontent.com/dkaratsapov-web/landing/main/deploy/nginx-karatsapov.conf"

say() { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31mОшибка:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Запускайте через sudo."

# ── 1. Пакеты ────────────────────────────────────────────────────────────
say "Ставлю nginx и certbot"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx curl

# ── 2. Каталоги ──────────────────────────────────────────────────────────
say "Создаю каталоги"
mkdir -p "$SITE_ROOT" "$ACME_ROOT"
chown -R www-data:www-data "$ACME_ROOT"

# Заглушка на случай, если деплой ещё не отработал: пустой каталог заставил
# бы nginx отдавать 403, и было бы непонятно, сервер сломан или файлов нет.
if [ ! -f "$SITE_ROOT/index.html" ]; then
  cat > "$SITE_ROOT/index.html" <<'HTML'
<!doctype html><meta charset="utf-8"><title>Сервер готов</title>
<body style="font:16px/1.6 system-ui;max-width:38em;margin:15vh auto;padding:0 1em">
<h1>Сервер готов, сайта ещё нет</h1>
<p>nginx работает и раздаёт каталог <code>/var/www/landing</code>, но файлы
сайта туда пока не приехали.</p>
<p>Запустите в GitHub Actions воркфлоу <b>Deploy to VPS</b> и обновите
страницу.</p>
HTML
  chown -R www-data:www-data "$SITE_ROOT"
  say "Файлов сайта пока нет — положил заглушку"
fi

# ── 3. Размер корзины для имён ───────────────────────────────────────────
# Конфиг обслуживает и старый кириллический домен, а его имя в punycode
# занимает 48 символов. По умолчанию nginx отводит под имена корзину в 64
# байта и на длинных именах падает с «could not build server_names_hash».
# Директива живёт только в блоке http, из конфига сайта её не задать.
say "Проверяю server_names_hash_bucket_size"
if grep -q server_names_hash_bucket_size /etc/nginx/nginx.conf; then
  sed -i 's|^\s*#\?\s*server_names_hash_bucket_size.*|\tserver_names_hash_bucket_size 128;|' /etc/nginx/nginx.conf
else
  sed -i '/^http {/a \\tserver_names_hash_bucket_size 128;' /etc/nginx/nginx.conf
fi

# ── 4. Конфиг ────────────────────────────────────────────────────────────
say "Кладу конфиг nginx"
if [ -f "$(dirname "$0")/nginx-karatsapov.conf" ]; then
  cp "$(dirname "$0")/nginx-karatsapov.conf" "/etc/nginx/sites-available/$CONF_NAME"
else
  curl -fsSL "$RAW" -o "/etc/nginx/sites-available/$CONF_NAME"
fi

ln -sf "/etc/nginx/sites-available/$CONF_NAME" "/etc/nginx/sites-enabled/$CONF_NAME"

# Стандартный сайт nginx перехватывает все запросы без совпадения по имени
# и показывает страницу «Welcome to nginx» вместо нашей.
rm -f /etc/nginx/sites-enabled/default

# ── 5. Проверка и запуск ─────────────────────────────────────────────────
say "Проверяю синтаксис"
nginx -t

systemctl enable nginx >/dev/null 2>&1 || true
systemctl reload nginx || systemctl restart nginx

# ── 6. Самопроверка ──────────────────────────────────────────────────────
say "Проверяю, что сайт отдаётся локально"
code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $DOMAIN" http://127.0.0.1/)
if [ "$code" = "200" ]; then
  printf '   http://%s локально отвечает 200 ✓\n' "$DOMAIN"
else
  printf '   локальный ответ: %s — посмотрите /var/log/nginx/error.log\n' "$code"
fi

ip=$(curl -s --max-time 5 https://api.ipify.org || echo '')

cat <<EOF

────────────────────────────────────────────────────────────
Готово. Сервер раздаёт сайт по http.

Внешний адрес сервера: ${ip:-не определился, посмотрите в панели}

Что дальше:

1. В панели reg.ru поменяйте записи домена $DOMAIN:
     A   @     → ${ip:-IP этого сервера}
     A   www   → ${ip:-IP этого сервера}
   Старые четыре адреса GitHub Pages (185.199.108–111.153) удалить,
   запись CNAME для www — тоже.

2. Дождитесь, пока изменения разойдутся:
     nslookup $DOMAIN 8.8.8.8
   Когда в ответе будет адрес этого сервера — идите дальше.

3. Выпустите сертификат:
     sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN
   На вопрос про редирект отвечайте «2» (Redirect) — certbot сам добавит
   переход с http на https.

4. Проверьте автопродление:
     sudo certbot renew --dry-run

Подробности и что делать, если что-то пошло не так, — deploy/PEREEZD.md
────────────────────────────────────────────────────────────
EOF
