#!/bin/bash
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting Laravel application initialization..."

# Ensure we're in the correct directory
cd /var/www

# Copy initial storage structure if storage directory is empty or missing
if [ ! -d "/var/www/storage/app" ] || [ ! -d "/var/www/storage/framework" ] || [ ! -d "/var/www/storage/logs" ]; then
    log "Setting up storage directories..."
    cp -r /var/www/storage-init/* /var/www/storage/ 2>/dev/null || true
fi

# Set proper permissions for Laravel directories
log "Setting up permissions..."
chmod -R 755 /var/www/storage
chmod -R 755 /var/www/bootstrap/cache

# Clear and cache Laravel configuration
log "Optimizing Laravel..."
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations (uncomment if needed)
# log "Running database migrations..."
php artisan migrate

log "Laravel application initialization completed!"

# Execute the main command
log "Starting application with command: $@"
exec "$@"
