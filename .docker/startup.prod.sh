#!/bin/bash

# Exit on any error
set -e

echo "Starting Laravel production initialization..."

# Wait for database to be ready
echo "Waiting for database..."
until php artisan db:show 2>/dev/null; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "Database is ready!"

# Run migrations (safe with --force in production)
echo "Running migrations..."
php artisan migrate --force --no-interaction

# Create storage symlink (idempotent - safe to run multiple times)
echo "Creating storage symlink..."
php artisan storage:link --force

# Cache configuration for better performance
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear any stale caches
echo "Clearing old caches..."
php artisan cache:clear

echo "Laravel initialization complete!"

# Start supervisord
echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
