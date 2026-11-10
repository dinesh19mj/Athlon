#!/bin/bash
set -e

echo "=== [1/4] Copying JAR files to /home/ubuntu/services ==="
mkdir -p /home/ubuntu/services
cp /home/ubuntu/ATHLON/AUTHSERVICE/build/libs/AUTHSERVICE-0.0.1-SNAPSHOT.jar /home/ubuntu/services/
cp /home/ubuntu/ATHLON/GATEWAYSERVICE/build/libs/GATEWAYSERVICE-0.0.1-SNAPSHOT.jar /home/ubuntu/services/
cp /home/ubuntu/ATHLON/IDENTITYSERVICE/build/libs/IDENTITYSERVICE-0.0.1-SNAPSHOT.jar /home/ubuntu/services/
cp /home/ubuntu/ATHLON/TOURNAMENTSERVICE/build/libs/TOURNAMENTSERVICE-0.0.1-SNAPSHOT.jar /home/ubuntu/services/
cp /home/ubuntu/ATHLON/PAYMENTSERVICE/build/libs/PAYMENTSERVICE-0.0.1-SNAPSHOT.jar /home/ubuntu/services/
cp /home/ubuntu/ATHLON/MARKETPLACESERVICE/build/libs/MARKETPLACESERVICE-0.0.1-SNAPSHOT.jar /home/ubuntu/services/
ls -lh /home/ubuntu/services/

echo "=== [2/4] Creating Systemd Service Units ==="

create_service() {
    local svc_name=$1
    local jar_name=$2
    local port=$3
    cat <<EOF | sudo tee /etc/systemd/system/${svc_name}.service > /dev/null
[Unit]
Description=Athlon ${svc_name} (Port ${port})
After=network.target postgresql.service
Wants=postgresql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/services
ExecStart=/usr/bin/java -Xms128m -Xmx256m -Dspring.profiles.active=live -jar /home/ubuntu/services/${jar_name}
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
}

create_service authservice AUTHSERVICE-0.0.1-SNAPSHOT.jar 5051
create_service identityservice IDENTITYSERVICE-0.0.1-SNAPSHOT.jar 5052
create_service tournamentservice TOURNAMENTSERVICE-0.0.1-SNAPSHOT.jar 5053
create_service paymentservice PAYMENTSERVICE-0.0.1-SNAPSHOT.jar 5054
create_service marketplaceservice MARKETPLACESERVICE-0.0.1-SNAPSHOT.jar 5055
create_service gatewayservice GATEWAYSERVICE-0.0.1-SNAPSHOT.jar 5050

echo "=== [3/4] Enabling and Starting Services ==="
sudo systemctl daemon-reload
sudo systemctl enable authservice identityservice tournamentservice paymentservice marketplaceservice gatewayservice
sudo systemctl restart authservice identityservice tournamentservice paymentservice marketplaceservice gatewayservice

echo "=== [4/4] Verifying Service States ==="
sleep 5
sudo systemctl is-active authservice identityservice tournamentservice paymentservice marketplaceservice gatewayservice || true

