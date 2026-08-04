#!/bin/bash
echo -e '[Unit]\nDescription=Gateway Service\nAfter=network.target\n\n[Service]\nUser=ubuntu\nExecStart=/usr/bin/java -jar /home/ubuntu/services/GATEWAYSERVICE-0.0.1-SNAPSHOT.jar\nSuccessExitStatus=143\nRestart=always\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target' | sudo tee /etc/systemd/system/gatewayservice.service
echo -e '[Unit]\nDescription=Identity Service\nAfter=network.target\n\n[Service]\nUser=ubuntu\nExecStart=/usr/bin/java -jar /home/ubuntu/services/IDENTITYSERVICE-0.0.1-SNAPSHOT.jar\nSuccessExitStatus=143\nRestart=always\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target' | sudo tee /etc/systemd/system/identityservice.service
echo -e '[Unit]\nDescription=Tournament Service\nAfter=network.target\n\n[Service]\nUser=ubuntu\nExecStart=/usr/bin/java -jar /home/ubuntu/services/TOURNAMENTSERVICE-0.0.1-SNAPSHOT.jar\nSuccessExitStatus=143\nRestart=always\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target' | sudo tee /etc/systemd/system/tournamentservice.service

sudo systemctl daemon-reload
sudo systemctl enable authservice gatewayservice identityservice tournamentservice
sudo systemctl restart authservice gatewayservice identityservice tournamentservice
