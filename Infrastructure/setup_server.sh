#!/bin/bash
set -e

echo "=== [1/5] Setting up 2GB Swap ==="
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap created and enabled successfully."
else
    echo "Swapfile already exists."
fi

echo "=== [2/5] Installing OpenJDK 17, Nginx, Certbot ==="
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y openjdk-17-jre-headless nginx certbot python3-certbot-nginx curl ca-certificates gnupg

echo "=== [3/5] Installing Node.js LTS (v20) and PM2 ==="
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi

sudo npm install -g pm2

echo "=== [4/5] Creating application and upload directories ==="
mkdir -p /home/ubuntu/services
mkdir -p /home/ubuntu/athlon-user
mkdir -p /home/ubuntu/Uploads/Tournament/Poster
mkdir -p /home/ubuntu/Uploads/Championship/Poster
mkdir -p /home/ubuntu/Uploads/Athlon/User
mkdir -p /home/ubuntu/Uploads/Athlon/Organization
mkdir -p /home/ubuntu/Uploads/Athlon/Marketplace
chmod -R 775 /home/ubuntu/Uploads
chown -R ubuntu:ubuntu /home/ubuntu/services /home/ubuntu/athlon-user /home/ubuntu/Uploads

echo "=== [5/5] Verification ==="
java -version
node -v
npm -v
pm2 -v
nginx -v
free -h

