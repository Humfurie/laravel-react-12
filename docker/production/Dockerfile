# ================================
# Stage 1: PHP Dependencies (MUST BE FIRST - needed by Node build)
# ================================
FROM composer:2.8 AS composer-builder

# Use PHP 8.4 platform to ensure compatible packages
ENV COMPOSER_PLATFORM_PHP=8.4

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
# Stage 2: Node Build Dependencies
# ================================
FROM node:20-alpine AS node-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev) for building
RUN npm ci --include=optional

# Copy vendor from composer-builder stage (needed for ziggy-js alias)
COPY --from=composer-builder /app/vendor ./vendor

# Copy source files needed for build
COPY resources ./resources
COPY public ./public
COPY vite.config.ts tsconfig.json tailwind.config.js .prettierrc ./

# Clean any existing build artifacts to avoid permission issues
RUN rm -rf public/build

# Build frontend assets including SSR
RUN npm run build:ssr

# ================================
# Stage 3: Final Production Image
# ================================
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

# Install build dependencies and runtime dependencies
RUN apk add --no-cache \
    # Build dependencies (needed for compilation) \
    autoconf \
    gcc \
    g++ \
    make \
    libc-dev \
    linux-headers \
    # Runtime dependencies \
    postgresql-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libwebp-dev \
    oniguruma-dev \
    icu-dev \
    nginx \
    supervisor \
    nodejs \
    npm \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        opcache \
        pcntl \
        bcmath \
        zip \
        gd \
        intl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del autoconf gcc g++ make libc-dev linux-headers \
    && rm -rf /tmp/* /var/cache/apk/*

# Copy PHP configuration for production
RUN echo '[PHP]' > /usr/local/etc/php/conf.d/php-production.ini \
    && echo 'post_max_size = 100M' >> /usr/local/etc/php/conf.d/php-production.ini \
    && echo 'upload_max_filesize = 100M' >> /usr/local/etc/php/conf.d/php-production.ini \
    && echo 'variables_order = EGPCS' >> /usr/local/etc/php/conf.d/php-production.ini \
    && echo 'memory_limit = 512M' >> /usr/local/etc/php/conf.d/php-production.ini \
    && echo 'opcache.enable=1' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.memory_consumption=128' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.max_accelerated_files=10000' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.validate_timestamps=0' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.jit=tracing' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.jit_buffer_size=100M' >> /usr/local/etc/php/conf.d/opcache.ini

# Copy Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Copy vendor from composer-builder stage
COPY --from=composer-builder /app/vendor ./vendor

# Copy built assets from node-builder stage
COPY --from=node-builder /app/public/build ./public/build
COPY --from=node-builder /app/bootstrap/ssr ./bootstrap/ssr
COPY --from=node-builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload --optimize --classmap-authoritative \
    && php artisan package:discover --ansi || true

# Remove any development PHP configurations that may have been copied
RUN rm -f /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && rm -f /usr/local/etc/php/conf.d/docker-php-ext-pcov.ini \
    && rm -rf docker/

# Create required directories and set permissions
RUN mkdir -p storage/{logs,framework/{cache,sessions,views},app/public} bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x .docker/startup.prod.sh \
    && mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled \
    && rm -f /etc/nginx/http.d/default.conf \
    && echo 'include /etc/nginx/sites-enabled/*;' >> /etc/nginx/http.d/laravel.conf

EXPOSE 80

CMD ["/var/www/html/.docker/startup.prod.sh"]
