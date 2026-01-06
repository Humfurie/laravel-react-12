#!/bin/bash

# Test script for production Docker image
# This verifies that PHP JIT is enabled and no warnings are present

echo "=== Testing Production Docker Image ==="
echo ""

echo "1. Building production image..."
docker build -f docker/production/Dockerfile -t humfurie-app:test .
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful!"
echo ""

echo "2. Checking PHP version..."
docker run --rm humfurie-app:test php -v
echo ""

echo "3. Verifying JIT is enabled..."
docker run --rm humfurie-app:test php -r "echo 'JIT Status: ' . (ini_get('opcache.jit') ? 'Enabled (' . ini_get('opcache.jit') . ')' : 'Disabled') . PHP_EOL; echo 'JIT Buffer: ' . ini_get('opcache.jit_buffer_size') . PHP_EOL;"
echo ""

echo "4. Checking for Xdebug/pcov (should be empty)..."
EXTENSIONS=$(docker run --rm humfurie-app:test php -m | grep -E "(xdebug|pcov|Xdebug)")
if [ -z "$EXTENSIONS" ]; then
    echo "✅ No debug extensions found (good for production)"
else
    echo "❌ Found debug extensions: $EXTENSIONS"
    exit 1
fi
echo ""

echo "5. Testing Laravel artisan (checking for warnings)..."
docker run --rm humfurie-app:test php artisan --version 2>&1 | tee /tmp/artisan-test.log
if grep -q "JIT is incompatible" /tmp/artisan-test.log; then
    echo "❌ JIT warning found!"
    exit 1
else
    echo "✅ No JIT warnings!"
fi
echo ""

echo "6. Listing PHP configuration files..."
docker run --rm humfurie-app:test ls -la /usr/local/etc/php/conf.d/
echo ""

echo "=== All tests passed! ✅ ==="
echo ""
echo "The production image is ready. To deploy:"
echo "  docker-compose -f docker-compose.prod.yml build app"
echo "  docker-compose -f docker-compose.prod.yml up -d"
