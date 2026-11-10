#!/bin/bash
set -e

echo "=== [1/5] Organizing Frontend Files ==="
cd /home/ubuntu/athlon-user

if [ -d "/home/ubuntu/athlon-user/Athlon/athlon-user" ]; then
    echo "Found nested Next.js directory, moving to root..."
    cp -rn /home/ubuntu/athlon-user/Athlon/athlon-user/* /home/ubuntu/athlon-user/ 2>/dev/null || true
    cp -rn /home/ubuntu/athlon-user/Athlon/athlon-user/.[!.]* /home/ubuntu/athlon-user/ 2>/dev/null || true
    rm -rf /home/ubuntu/athlon-user/Athlon
fi

cat << 'EOF' > /home/ubuntu/athlon-user/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'athlon-user',
      script: 'server.js',
      cwd: '/home/ubuntu/athlon-user',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        INTERNAL_API_URL: 'http://127.0.0.1:5050'
      }
    }
  ]
};
EOF

chown -R ubuntu:ubuntu /home/ubuntu/athlon-user

echo "=== [2/5] Starting Frontend with PM2 ==="
pm2 delete athlon-user 2>/dev/null || true
pm2 start /home/ubuntu/athlon-user/ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

echo "=== [3/5] Configuring Nginx ==="
cat << 'EOF' | sudo tee /etc/nginx/sites-available/athlon.conf > /dev/null
# Frontend domain: athlon.co.in & www.athlon.co.in
server {
    listen 80;
    listen [::]:80;
    server_name athlon.co.in www.athlon.co.in;

    # Allow Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Static assets cache
    location /_next/static/ {
        alias /home/ubuntu/athlon-user/.next/static/;
        access_log off;
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /manifest.json {
        alias /home/ubuntu/athlon-user/public/manifest.json;
        add_header Cache-Control "public, max-age=3600";
    }

    location /icons/ {
        alias /home/ubuntu/athlon-user/public/icons/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location /images/ {
        alias /home/ubuntu/athlon-user/public/images/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Next.js Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}

# API Gateway domain: api.athlon.co.in
server {
    listen 80;
    listen [::]:80;
    server_name api.athlon.co.in;

    client_max_body_size 50M;

    # Allow Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Spring Boot Gateway
    location / {
        proxy_pass http://127.0.0.1:5050;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
EOF

sudo mkdir -p /var/www/html
sudo ln -sf /etc/nginx/sites-available/athlon.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "=== [4/5] Verification of Local Ports ==="
sleep 4
echo "Checking PM2..."
pm2 status
echo "Testing Next.js port 3000..."
curl -I http://127.0.0.1:3000 || echo "Port 3000 check failed"
echo "Testing Gateway port 5050..."
curl -I http://127.0.0.1:5050/actuator/health || echo "Port 5050 health check"

echo "=== [5/5] Attempting SSL with Certbot ==="
sudo certbot --nginx -d athlon.co.in -d www.athlon.co.in -d api.athlon.co.in --non-interactive --agree-tos -m admin@athlon.co.in --redirect || echo "Certbot DNS verification will succeed once DNS propagates fully"
