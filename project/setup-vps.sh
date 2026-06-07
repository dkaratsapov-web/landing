#!/bin/bash
set -e

apt update && apt install -y nginx rsync nodejs npm

mkdir -p /var/www/landing
echo "<h1>VPS OK</h1>" > /var/www/landing/index.html

cat > /etc/nginx/sites-available/landing << 'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai www.xn-----6kcaabbmngo7aadrlotojgvup6c4e.xn--p1ai _;
    root /var/www/landing;
    index index.html;
    location / { try_files $uri $uri/ =404; }
    gzip on;
    gzip_types text/css application/javascript text/html;
}
NGINX

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/landing /etc/nginx/sites-enabled/landing
nginx -t && systemctl enable nginx && systemctl reload nginx

ssh-keygen -t ed25519 -f /root/deploy_key -N "" -C "github-actions" -q
mkdir -p /root/.ssh
cat /root/deploy_key.pub >> /root/.ssh/authorized_keys
chmod 700 /root/.ssh && chmod 600 /root/.ssh/authorized_keys

echo ""
echo "========================================"
echo "ГОТОВО! Скопируйте ключ ниже целиком:"
echo "========================================"
cat /root/deploy_key
echo "========================================"
