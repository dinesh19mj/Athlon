#!/bin/bash
set -e

echo "=== [1/4] Installing PostgreSQL ==="
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib

echo "=== [2/4] Creating Database & User ==="
sudo -u postgres psql -c "CREATE USER dbmasteruser WITH PASSWORD 'Aws#Db&2026' SUPERUSER CREATEDB CREATEROLE REPLICATION;" || sudo -u postgres psql -c "ALTER USER dbmasteruser WITH PASSWORD 'Aws#Db&2026' SUPERUSER CREATEDB CREATEROLE REPLICATION;"
sudo -u postgres psql -c "CREATE DATABASE athlon OWNER dbmasteruser;" || echo "Database athlon already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE athlon TO dbmasteruser;"
sudo -u postgres psql -d athlon -c "GRANT ALL ON SCHEMA public TO dbmasteruser; ALTER SCHEMA public OWNER TO dbmasteruser;"

echo "=== [3/4] Enabling Remote Connections in PostgreSQL ==="
PG_CONF=$(find /etc/postgresql/ -name postgresql.conf)
PG_HBA=$(find /etc/postgresql/ -name pg_hba.conf)

# Set listen_addresses to '*'
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"

# Append allow-all remote connections to pg_hba.conf if not already present
if ! grep -q "0.0.0.0/0" "$PG_HBA"; then
    echo "host    all             all             0.0.0.0/0               scram-sha-256" | sudo tee -a "$PG_HBA"
    echo "host    all             all             ::/0                    scram-sha-256" | sudo tee -a "$PG_HBA"
fi

sudo systemctl restart postgresql
sudo systemctl enable postgresql

echo "=== [4/4] Verifying connection ==="
PGPASSWORD='Aws#Db&2026' psql -h 127.0.0.1 -U dbmasteruser -d athlon -c "SELECT version();"

echo "PostgreSQL setup completed successfully."

