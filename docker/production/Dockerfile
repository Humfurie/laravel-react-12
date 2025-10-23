# ================================
# Stage 1: Build Dependencies
# ================================
FROM node:20-alpine AS node-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev) for building
RUN npm ci --include=optional

# Copy source files needed for build
COPY resources ./resources
COPY public ./public
COPY vite.config.ts tsconfig.json tailwind.config.ts postcss.config.js ./

# Build frontend assets including SSR
RUN npm run build:ssr

# ================================
# Stage 2: PHP Dependencies
# ================================
FROM composer:2 AS composer-builder

WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction

# ================================
# Stage 3: Final Production Image
# ================================
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

# Install ONLY runtime dependencies (Alpine = smaller)
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    libpng-dev \
    oniguruma-dev \
    nginx \
    supervisor \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        opcache \
        pcntl \
        bcmath \
        zip \
        gd \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /tmp/* /var/cache/apk/*

# Copy PHP configuration
RUN echo 'opcache.enable=1' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.memory_consumption=128' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.max_accelerated_files=10000' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.validate_timestamps=0' >> /usr/local/etc/php/conf.d/opcache.ini

# Copy Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Copy vendor from composer-builder stage
COPY --from=composer-builder /app/vendor ./vendor

# Copy built assets from node-builder stage
COPY --from=node-builder /app/public/build ./public/build
COPY --from=node-builder /app/bootstrap/ssr ./bootstrap/ssr

# Copy application code
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload --optimize --classmap-authoritative \
    && php artisan package:discover --ansi || true

# Create required directories and set permissions
RUN mkdir -p storage/{logs,framework/{cache,sessions,views},app/public} bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x .docker/startup.prod.sh

EXPOSE 80

CMD [".docker/startup.prod.sh"]
