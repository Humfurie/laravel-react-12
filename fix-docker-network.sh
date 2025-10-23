#!/bin/bash

echo "===== Fixing Docker Network Issue ====="
echo ""
echo "This script will:"
echo "1. Stop all containers"
echo "2. Restart Docker daemon (flushes iptables rules)"
echo "3. Restart containers"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "Step 1: Stopping containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production down

echo ""
echo "Step 2: Restarting Docker daemon (requires sudo)..."
sudo systemctl restart docker

echo ""
echo "Waiting for Docker to be ready..."
sleep 5

echo ""
echo "Step 3: Starting containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

echo ""
echo "Step 4: Monitoring app logs..."
echo "Waiting 10 seconds for initialization..."
sleep 10

echo ""
docker compose -f docker-compose.prod.yml --env-file .env.production logs app --tail 30

echo ""
echo "===== Done ====="
echo ""
echo "If you still see 'Database is unavailable' errors, run:"
echo "  docker compose -f docker-compose.prod.yml --env-file .env.production logs app --follow"
