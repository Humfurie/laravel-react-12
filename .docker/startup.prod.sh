#!/bin/sh

# Exit on any error
set -e

echo "Starting Laravel production initialization..."

# Enable nginx site configuration
if [ ! -L /etc/nginx/sites-enabled/default ]; then
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
fi

# Wait for database to be ready
echo "Waiting for database..."
until php artisan db:show 2>/dev/null; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "Database is ready!"

# Run migrations only if needed (check if migrations table exists and has pending migrations)
echo "Checking for pending migrations..."
if php artisan migrate:status 2>/dev/null | grep -q "Pending"; then
    echo "Running migrations..."
    php artisan migrate --force --no-interaction
else
    echo "No pending migrations. Skipping..."
fi

# Create storage symlink (idempotent - safe to run multiple times)
echo "Creating storage symlink..."
php artisan storage:link --force

# Cache configuration for better performance
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache  # Cache Blade views (includes email templates, error pages)
php artisan event:cache 2>/dev/null || echo "Event caching not available"  # Laravel 11+

# Warm homepage caches to prevent cold cache slowdowns on first request
echo "Warming homepage caches..."
php artisan cache:warm-homepage --force || echo "Cache warming failed - will warm on first request"

# NOTE: Do NOT clear cache in production - it defeats the purpose!
# Only clear cache when deploying new code or debugging

echo "Laravel initialization complete!"

# Start supervisord
echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
