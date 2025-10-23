#!/bin/bash

echo "===== Comprehensive Docker Fix Script ====="
echo ""
echo "This script will:"
echo "1. Fix file permissions on public/build (requires sudo)"
echo "2. Fix iptables FORWARD rules (requires sudo)"
echo "3. Restart Docker daemon (requires sudo)"
echo "4. Rebuild and restart all containers"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "Step 1: Fixing public/build permissions..."
sudo chown -R humphrey:humphrey public/build

echo ""
echo "Step 2: Checking iptables FORWARD policy..."
sudo iptables -L FORWARD -n -v | head -5

echo ""
echo "Step 3: Setting iptables to ACCEPT FORWARD traffic..."
sudo iptables -P FORWARD ACCEPT
sudo iptables -F DOCKER-USER 2>/dev/null || true

echo ""
echo "Step 4: Restarting Docker daemon..."
sudo systemctl restart docker

echo ""
echo "Waiting for Docker to be ready..."
sleep 5

echo ""
echo "Step 5: Stopping existing containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production down

echo ""
echo "Step 6: Removing old images to force rebuild..."
docker rmi humfurie-app:latest 2>/dev/null || echo "No old image to remove"

echo ""
echo "Step 7: Building and starting containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

echo ""
echo "Step 8: Monitoring container health..."
echo "Waiting 15 seconds for initialization..."
sleep 15

echo ""
echo "Container status:"
docker compose -f docker-compose.prod.yml --env-file .env.production ps

echo ""
echo "App logs:"
docker compose -f docker-compose.prod.yml --env-file .env.production logs app --tail 30

echo ""
echo "===== Done ======"
echo ""
echo "If you still see errors, check logs with:"
echo "  docker compose -f docker-compose.prod.yml --env-file .env.production logs --follow"
