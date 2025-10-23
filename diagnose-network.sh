#!/bin/bash

echo "===== Docker Network Diagnostics ====="
echo ""

echo "1. Checking iptables FORWARD chain (requires sudo):"
echo "   Run: sudo iptables -L FORWARD -n -v | head -20"
echo ""

echo "2. Checking if MicroK8s is interfering:"
microk8s status 2>/dev/null && echo "   MicroK8s is running - this may interfere with Docker networking"
echo ""

echo "3. Checking Docker bridge hairpin mode:"
BRIDGE_ID=$(docker network inspect laravel-react-12_laravel -f '{{.Id}}' | cut -c1-12)
echo "   Bridge: br-${BRIDGE_ID}"
bridge link show | grep "br-${BRIDGE_ID}" | head -3
echo ""

echo "4. Testing basic TCP connectivity:"
echo "   From host to postgres container on 172.20.0.3:5432..."
timeout 2 bash -c "echo > /dev/tcp/172.20.0.3/5432" 2>&1 && echo "   ✓ Host can reach postgres" || echo "   ✗ Host CANNOT reach postgres"
echo ""

echo "5. Checking Docker daemon configuration:"
cat /etc/docker/daemon.json 2>/dev/null || echo "   No custom daemon.json"
echo ""

echo "6. Suggested fixes:"
echo ""
echo "   Option 1: Restart Docker daemon (requires sudo)"
echo "   $ sudo systemctl restart docker"
echo "   $ docker compose -f docker-compose.prod.yml --env-file .env.production up -d"
echo ""
echo "   Option 2: Stop MicroK8s temporarily"
echo "   $ sudo microk8s stop"
echo "   $ docker compose -f docker-compose.prod.yml --env-file .env.production restart"
echo ""
echo "   Option 3: Flush and recreate Docker iptables rules (requires sudo)"
echo "   $ sudo iptables -F DOCKER-USER 2>/dev/null || true"
echo "   $ sudo systemctl restart docker"
echo ""
echo "   Option 4: Recreate the network from scratch"
echo "   $ docker compose -f docker-compose.prod.yml --env-file .env.production down"
echo "   $ docker network prune -f"
echo "   $ docker compose -f docker-compose.prod.yml --env-file .env.production up -d"
echo ""
echo "===== End of Diagnostics ====="
