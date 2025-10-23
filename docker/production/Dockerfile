FROM php:8.4-fpm

# Set working directory
WORKDIR /var/www/html

# Configure DNS for better network reliability
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libzip-dev \
    libpq-dev \
    zip \
    unzip \
    supervisor \
    nginx \
    ca-certificates \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_pgsql pdo_mysql mbstring exif pcntl bcmath gd zip opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Node.js 20 LTS with retry
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure PHP for production with aggressive OPcache
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.enable_cli=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.interned_strings_buffer=16" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.revalidate_freq=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.fast_shutdown=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "realpath_cache_size=4096K" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "realpath_cache_ttl=600" >> /usr/local/etc/php/conf.d/opcache.ini

# Install Composer with retry logic
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    || (sleep 5 && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer) \
    && chmod +x /usr/local/bin/composer

# Configure Composer for better network handling
RUN composer config -g repos.packagist composer https://packagist.org \
    && composer config -g process-timeout 600

# Copy composer files first for better Docker layer caching
COPY composer.json composer.lock /var/www/html/

# Install PHP dependencies with better error handling
RUN composer install \
    --optimize-autoloader \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --prefer-dist \
    --verbose \
    || composer install \
        --optimize-autoloader \
        --no-dev \
        --no-scripts \
        --no-interaction \
        --prefer-dist \
        --verbose

# Copy package files for Node dependencies
COPY package.json package-lock.json /var/www/html/

# Configure npm for better reliability
RUN npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-retries 5

# Install Node.js dependencies with retry logic
RUN npm ci --include=optional --verbose \
    || npm ci --include=optional --verbose

# Copy the rest of application files
COPY . /var/www/html

# Build frontend assets (including SSR bundle)
RUN npm run build:ssr

# Verify SSR bundle was created
RUN ls -la /var/www/html/bootstrap/ssr/ && \
    test -f /var/www/html/bootstrap/ssr/ssr.mjs || (echo "SSR bundle not found!" && exit 1)

# Remove dev dependencies after build
RUN npm prune --production

# Generate optimized class loader
RUN composer dump-autoload --optimize --classmap-authoritative

# Run post-autoload-dump scripts
RUN php artisan package:discover --ansi || true

# Create storage directories first (before setting permissions)
RUN mkdir -p storage/logs \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/app/public \
    bootstrap/cache

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache \
    && chmod -R 775 storage

# Make startup script executable
RUN chmod +x /var/www/html/.docker/startup.prod.sh

EXPOSE 80

CMD ["/var/www/html/.docker/startup.prod.sh"]
