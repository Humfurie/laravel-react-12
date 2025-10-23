FROM php:8.4-fpm

# Set working directory
WORKDIR /var/www/html

# Install only essential system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libonig-dev \
    libzip-dev \
    libpq-dev \
    unzip \
    supervisor \
    nginx \
    curl \
    && docker-php-ext-install -j$(nproc) pdo_pgsql mbstring exif pcntl bcmath gd zip opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Redis extension (lightweight)
RUN pecl channel-update pecl.php.net \
    && pecl install --onlyreqdeps redis \
    && docker-php-ext-enable redis \
    && rm -rf /tmp/pear

# Install Node.js 20 LTS (minimal)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure PHP OPcache for production
COPY <<EOF /usr/local/etc/php/conf.d/opcache.ini
opcache.enable=1
opcache.enable_cli=0
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=0
opcache.validate_timestamps=0
opcache.fast_shutdown=1
realpath_cache_size=4096K
realpath_cache_ttl=600
EOF

# Install Composer (2.x latest)
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Configure Composer and npm for faster downloads
RUN composer config -g process-timeout 300 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-retries 3

# Copy dependency files
COPY composer.json composer.lock package.json package-lock.json ./

# Install dependencies (parallel where possible)
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction \
    && npm ci --include=optional --omit=dev

# Copy application files
COPY . .

# Build assets
RUN npm run build:ssr \
    && npm prune --production

# Finalize Composer autoload
RUN composer dump-autoload --optimize --classmap-authoritative \
    && php artisan package:discover --ansi || true

# Create required directories
RUN mkdir -p storage/{logs,framework/{cache,sessions,views},app/public} bootstrap/cache

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x .docker/startup.prod.sh

EXPOSE 80

CMD [".docker/startup.prod.sh"]
