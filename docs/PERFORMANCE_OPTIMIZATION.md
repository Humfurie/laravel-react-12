# Performance Optimization Guide

## 🔴 Current Issues (1395ms+ Response Time)

Your site is **very slow** (observed 1395ms by Lighthouse). Breakdown:

- DNS lookup: 62ms ✅ Good
- Connection: 331ms ⚠️ Moderate
- **Time to first byte (TTFB): 2.79 seconds** ❌ **CRITICAL**
- Total load: 3.55 seconds ❌ Very Slow

**Target:** <200ms TTFB, <1s total load time

---

## 🔍 Root Causes

### 1. **Inertia SSR Not Running** ❌

Your config has SSR enabled:

```php
'ssr' => [
    'enabled' => true,
    'url' => 'http://127.0.0.1:13714',
]
```

But the SSR server is **not running** in production! This means:

- Laravel tries to connect to `http://127.0.0.1:13714`
- Connection fails (server doesn't exist)
- Falls back to client-side rendering
- **Adds 1-2 seconds of timeout delay** per request

### 2. **No Caching Strategy**

Your startup script clears cache on every request processing:

```bash
php artisan cache:clear  # ❌ Defeats the purpose of caching!
```

### 3. **Missing OPcache Configuration**

While OPcache is enabled, it's not optimized for production.

### 4. **No CDN for Static Assets**

All assets (JS, CSS, images) served from origin server.

### 5. **Database Query Performance**

Every page load queries database without Redis caching.

---

## ✅ Immediate Fixes

### Fix 1: Disable or Properly Enable SSR

#### Option A: Disable SSR (Quick Fix)

**File:** `config/inertia.php` or `.env.production`

```php
'ssr' => [
    'enabled' => false,  // Change this
    'url' => 'http://127.0.0.1:13714',
]
```

**Or in `.env.production`:**

```env
INERTIA_SSR_ENABLED=false
```

**Impact:** Immediate 1-2 second improvement ⚡

#### Option B: Enable SSR Properly (Better SEO)

**1. Update supervisord config:**

**File:** `.docker/supervisord.prod.conf`

```ini
[program:inertia-ssr]
process_name=%(program_name)s
command=node /var/www/html/bootstrap/ssr/ssr.mjs
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/html/storage/logs/ssr.log
```

**2. Build SSR bundle in Dockerfile:**

**File:** `docker/production/Dockerfile` (after `npm run build`)

```dockerfile
# Build frontend assets
RUN npm run build

# Build SSR bundle
RUN npm run build:ssr
```

**3. Update Inertia config:**

```php
'ssr' => [
    'enabled' => true,
    'url' => 'http://localhost:13714',  // Use localhost, not 127.0.0.1
]
```

---

### Fix 2: Remove Cache Clear from Startup

**File:** `.docker/startup.prod.sh`

```bash
# Cache configuration for better performance
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Remove this line! ❌
# php artisan cache:clear

echo "Laravel initialization complete!"
```

Only clear cache when:

- Deploying new code
- Debugging cache issues

---

### Fix 3: Optimize OPcache

**File:** `docker/production/Dockerfile`

```dockerfile
# Configure PHP for production
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.enable_cli=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.interned_strings_buffer=16" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.revalidate_freq=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.fast_shutdown=1" >> /usr/local/etc/php/conf.d/opcache.ini
```

**Changes:**

- `memory_consumption`: 128 → 256MB
- `interned_strings_buffer`: 8 → 16MB
- `max_accelerated_files`: 4000 → 10000
- `revalidate_freq`: 2 → 0 (never revalidate)
- **NEW:** `validate_timestamps=0` (no file checks in production)

---

### Fix 4: Add Response Caching

**File:** `app/Http/Kernel.php` or `bootstrap/app.php`

Add cache middleware for blog pages:

```php
Route::middleware(['cache.headers:public;max_age=3600'])->group(function () {
    Route::get('/blog', [BlogController::class, 'index']);
    Route::get('/blog/{blog}', [BlogController::class, 'show']);
});
```

---

### Fix 5: Enable Redis Cache

**Already configured!** Just ensure it's being used:

**Check `.env.production`:**

```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

---

### Fix 6: Database Query Optimization

**File:** `app/Http/Controllers/User/BlogController.php`

```php
public function index()
{
    $blogs = Cache::remember('blog_index', 3600, function () {
        return Blog::published()
            ->orderBy('published_at', 'desc')
            ->orderBy('sort_order', 'asc')
            ->paginate(12);
    });

    return Inertia::render('user/blog', [
        'blogs' => $blogs,
    ]);
}

public function show(Blog $blog)
{
    if (!$blog->isPublished()) {
        abort(404);
    }

    // Increment view count asynchronously
    dispatch(fn() => $blog->increment('view_count'));

    return Inertia::render('user/blog-post', [
        'blog' => $blog,
    ]);
}
```

---

## 🚀 Advanced Optimizations

### 1. Add Horizon for Queue Management

```bash
composer require laravel/horizon
```

**Benefits:**

- Better queue performance
- Job monitoring
- Auto-scaling workers

### 2. Use CDN for Static Assets

**Option A: Cloudflare (Free)**

1. Sign up at [Cloudflare](https://cloudflare.com)
2. Add your domain
3. Update nameservers
4. Enable:
    - Auto Minify (JS, CSS, HTML)
    - Brotli compression
    - Caching (Static + HTML)

**Expected improvement:** 50-70% faster asset loading

**Option B: BunnyCDN or CloudFront**

For better performance at low cost.

### 3. Database Indexing

**Check if indexes exist:**

```sql
-- Blog indexes
CREATE INDEX idx_blogs_status_published ON blogs(status, published_at);
CREATE INDEX idx_blogs_slug ON blogs(slug);

-- Experience indexes
CREATE INDEX idx_experiences_sort_order ON experiences(sort_order);
```

### 4. Enable HTTP/2 & HTTP/3

**Already enabled via Traefik!** Verify:

```bash
curl -I --http2 https://humfurie.org
```

### 5. Image Optimization

**Install imagick in Dockerfile:**

```dockerfile
RUN apt-get update && apt-get install -y \
    libmagickwand-dev --no-install-recommends \
    && pecl install imagick \
    && docker-php-ext-enable imagick
```

**Then use in upload controller:**

```php
$image = Image::make($request->file('image'))
    ->resize(1200, null, function ($constraint) {
        $constraint->aspectRatio();
        $constraint->upsize();
    })
    ->encode('webp', 85);
```

### 6. Lazy Loading & Code Splitting

**Already implemented with Vite!** Verify bundle size:

```bash
npm run build -- --report
```

---

## 📊 Performance Monitoring

### Add Laravel Telescope (Dev Only)

```bash
composer require laravel/telescope --dev
php artisan telescope:install
```

### Production Monitoring

**Option 1: New Relic (Free tier)**

**Option 2: Sentry Performance**

```bash
composer require sentry/sentry-laravel
```

**Option 3: Laravel Pulse (Built-in)**

```bash
composer require laravel/pulse
php artisan pulse:install
```

---

## 🎯 Expected Results After Fixes

### Current Performance

- TTFB: **2.79s** ❌
- Total: **3.55s** ❌
- Lighthouse: **~30-40** ❌

### After Quick Fixes (1-3)

- TTFB: **~400-600ms** ⚠️
- Total: **~1.2s** ⚠️
- Lighthouse: **~60-70** 🟡

### After All Optimizations

- TTFB: **<200ms** ✅
- Total: **<1s** ✅
- Lighthouse: **90+** 🟢

---

## 🔧 Implementation Order

### Phase 1: Critical (Do Now)

1. **Disable SSR or fix it properly** (1-2s improvement)
2. **Remove `cache:clear` from startup** (200-400ms improvement)
3. **Optimize OPcache** (100-200ms improvement)

### Phase 2: Important (This Week)

4. Add response caching
5. Cache database queries
6. Database indexes

### Phase 3: Advanced (When Traffic Grows)

7. CDN setup
8. Image optimization
9. Monitoring tools
10. Horizon for queues

---

## 🧪 Testing Performance

### Before Changes

```bash
# Test TTFB
curl -o /dev/null -s -w "Time: %{time_starttransfer}s\n" https://humfurie.org

# Lighthouse CLI
npm install -g @lhci/cli
lhci autorun --collect.url=https://humfurie.org
```

### After Changes

Run same tests and compare!

**Target metrics:**

- TTFB: <200ms
- FCP (First Contentful Paint): <1s
- LCP (Largest Contentful Paint): <2.5s
- CLS (Cumulative Layout Shift): <0.1
- Lighthouse Performance: >90

---

## 📝 Deployment Checklist

Before deploying optimizations:

- [ ] Backup database
- [ ] Test in staging environment
- [ ] Monitor error logs
- [ ] Have rollback plan ready
- [ ] Test all critical user flows
- [ ] Monitor performance metrics

---

## 🆘 Troubleshooting

### Still Slow After Fixes?

**Check:**

1. **Container resources:**
   ```bash
   docker stats
   ```

2. **Database slow queries:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec postgres \
     psql -U postgres -d laravel -c "SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"
   ```

3. **PHP-FPM processes:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app ps aux | grep php-fpm
   ```

4. **Nginx access logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs nginx | grep "request_time"
   ```

---

## 💡 Quick Wins Summary

| Fix                | Effort | Impact      | Time Saved |
|--------------------|--------|-------------|------------|
| Disable SSR        | 1 min  | 🔥 Critical | ~1-2s      |
| Remove cache:clear | 1 min  | 🔥 High     | ~300ms     |
| Optimize OPcache   | 5 min  | 🟡 Medium   | ~150ms     |
| Add query caching  | 15 min | 🟡 Medium   | ~200ms     |
| Enable CDN         | 30 min | 🔥 High     | ~500ms     |

**Total potential improvement: 2-3 seconds faster!** 🚀

---

## 📚 Resources

- [Laravel Performance](https://laravel.com/docs/12.x/deployment#optimization)
- [Inertia SSR](https://inertiajs.com/server-side-rendering)
- [Web.dev Performance](https://web.dev/performance/)
- [Redis Caching](https://laravel.com/docs/12.x/redis)

---

**Start with Phase 1 fixes for immediate 50-70% performance improvement!**
