# Redis Queue & Cache System

This document describes how Redis is used in the application for caching, queuing, and session management.

## Overview

Redis is configured in production to handle:

- **Cache**: API response caching (crypto & stock data)
- **Queue**: Background job processing (emails, data fetching)
- **Session**: User session storage

## Configuration

### Environment Variables (.env.production)

```env
# Redis Connection
REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=null

# Use Redis for everything
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
```

### Redis Databases

Redis uses different database numbers for separation:

- **Database 0**: Default (queues, general use)
- **Database 1**: Cache storage
- **Database 2**: Sessions (recommended to add)

## Queue Jobs

### Available Jobs

1. **FetchCryptoData** - Fetches cryptocurrency data from external APIs
    - Methods: `getCryptoList`, `getCryptoDetail`, `getCryptoPrices`, `getTrendingCryptos`, `getCryptoChart`
    - Retries: 3 attempts with 60s backoff
    - Usage:
   ```php
   FetchCryptoData::dispatch('getCryptoList', ['vs_currency' => 'usd']);
   ```

2. **FetchStockData** - Fetches stock market data from external APIs
    - Methods: `getStockList`, `getStockQuote`, `getStockProfile`, `getMarketNews`, `getStockChart`
    - Retries: 3 attempts with 60s backoff
    - Usage:
   ```php
   FetchStockData::dispatch('getStockQuote', ['symbol' => 'AAPL']);
   ```

3. **RefreshCryptoCache** - Orchestrates refresh of all crypto data
    - Scheduled: Every 15 minutes
    - Dispatches multiple FetchCryptoData jobs

4. **RefreshStockCache** - Orchestrates refresh of all stock data
    - Scheduled: Every 15 minutes
    - Dispatches multiple FetchStockData jobs

### Email Queue

Email notifications are now queued for better performance:

```php
// In PropertyController.php
Mail::to($adminEmail)->queue(new NewInquiryNotification($inquiry));
```

## Scheduled Tasks

Configured in `bootstrap/app.php`:

```php
// Update raffle statuses every 5 minutes
$schedule->command('raffles:update-statuses')->everyFiveMinutes();

// Select raffle winners every hour
$schedule->command('raffles:select-winners')->hourly();

// Refresh crypto cache every 15 minutes
$schedule->job(new RefreshCryptoCache)->everyFifteenMinutes();

// Refresh stock cache every 15 minutes
$schedule->job(new RefreshStockCache)->everyFifteenMinutes();
```

## Queue Workers

### Supervisor Configuration

Location: `.docker/supervisord.prod.conf`

```ini
[program:laravel-worker]
command=php /var/www/html/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600 --timeout=300
numprocs=3
user=www-data
```

**Configuration:**

- **Workers**: 3 parallel processes
- **Sleep**: 3 seconds between jobs
- **Tries**: 3 attempts before marking as failed
- **Max Time**: Worker restarts after 1 hour
- **Timeout**: Jobs timeout after 5 minutes

### Scheduler Configuration

```ini
[program:laravel-scheduler]
command=/bin/bash -c "while true; do php /var/www/html/artisan schedule:run --verbose --no-interaction & sleep 60; done"
user=www-data
```

Runs every minute to check for scheduled tasks.

## Docker Configuration

### Exposed Port

Redis is exposed on port 6379 for external service access:

```yaml
redis:
  ports:
    - '${REDIS_PORT:-6379}:6379'
```

### Resource Limits

```yaml
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
  deploy:
    resources:
      limits:
        memory: 384M
      reservations:
        memory: 256M
```

**Memory Management:**

- Max Redis memory: 256MB
- Container memory limit: 384MB
- Eviction policy: LRU (Least Recently Used)

## External Service Access

To connect to Redis from another service:

### Same Docker Host

```bash
# Connection details
Host: localhost (or server IP)
Port: 6379
Password: null
```

### Different Docker Compose Stack

Add to your service's environment:

```yaml
environment:
  - REDIS_HOST=<server-ip>
  - REDIS_PORT=6379
```

### Example: Python Service

```python
import redis

r = redis.Redis(
    host='your-server-ip',
    port=6379,
    db=0,
    decode_responses=True
)

# Get cached data
crypto_data = r.get('crypto_list_...')
```

### Example: Node.js Service

```javascript
const redis = require('redis');

const client = redis.createClient({
    host: 'your-server-ip',
    port: 6379
});

client.get('crypto_list_...', (err, data) => {
    console.log(data);
});
```

## Monitoring

### Check Queue Status

```bash
# SSH into app container
docker exec -it <app-container> bash

# Check queue size
php artisan queue:work redis --once

# Monitor queue in real-time
php artisan queue:listen redis
```

### Check Redis Keys

```bash
# SSH into redis container
docker exec -it <redis-container> redis-cli

# List all keys
KEYS *

# Get cache stats
INFO stats

# Monitor commands in real-time
MONITOR
```

### View Worker Logs

```bash
# Worker logs
docker exec -it <app-container> tail -f /var/www/html/storage/logs/worker.log

# Scheduler logs
docker exec -it <app-container> tail -f /var/www/html/storage/logs/scheduler.log
```

## Troubleshooting

### Queue Not Processing

1. Check if workers are running:
   ```bash
   docker exec -it <app-container> supervisorctl status
   ```

2. Restart workers:
   ```bash
   docker exec -it <app-container> supervisorctl restart laravel-worker:*
   ```

### Failed Jobs

Failed jobs are stored in the `failed_jobs` table:

```bash
# List failed jobs
php artisan queue:failed

# Retry all failed jobs
php artisan queue:retry all

# Retry specific job
php artisan queue:retry <job-id>

# Clear failed jobs
php artisan queue:flush
```

### Cache Issues

```bash
# Clear all cache
php artisan cache:clear

# Clear specific cache key
php artisan tinker
>>> Cache::forget('crypto_list_...');
```

### Redis Connection Issues

1. Check if Redis is running:
   ```bash
   docker ps | grep redis
   ```

2. Test connection:
   ```bash
   docker exec -it <redis-container> redis-cli ping
   # Should return: PONG
   ```

3. Check Laravel can connect:
   ```bash
   php artisan tinker
   >>> Redis::connection()->ping();
   # Should return: "PONG"
   ```

## Performance Optimization

### Current Cache Strategy

- **Crypto Data**: Cached for duration defined in `CryptoService::CACHE_DURATION`
- **Stock Data**: Cached for duration defined in `StockService::CACHE_DURATION`
- **Automatic Refresh**: Background jobs refresh cache every 15 minutes

### Benefits

1. **Reduced API Calls**: External API calls are cached, reducing costs and rate limits
2. **Faster Response**: Cache hits return instantly from Redis
3. **Background Processing**: Heavy operations don't block user requests
4. **Scalability**: Queue workers can be scaled independently

### Future Improvements

1. Add Redis Sentinel for high availability
2. Implement cache tagging for better invalidation
3. Add Redis clustering for horizontal scaling
4. Implement rate limiting using Redis
5. Add dedicated session Redis database

## Security Considerations

### Production Security

1. **Set Redis Password**:
   ```yaml
   redis:
     command: redis-server --requirepass your-strong-password
   ```

2. **Update .env.production**:
   ```env
   REDIS_PASSWORD=your-strong-password
   ```

3. **Firewall Rules**:
    - Only allow Redis connections from trusted IPs
    - Use internal Docker networks when possible

4. **Disable Dangerous Commands**:
   ```yaml
   redis:
     command: redis-server --rename-command FLUSHDB "" --rename-command FLUSHALL ""
   ```

## Deployment

After making changes:

```bash
# Rebuild production image
docker-compose -f docker-compose.prod.yml build

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# Verify workers are running
docker-compose -f docker-compose.prod.yml exec app supervisorctl status
```

## Additional Resources

- [Laravel Queues Documentation](https://laravel.com/docs/queues)
- [Laravel Task Scheduling](https://laravel.com/docs/scheduling)
- [Redis Documentation](https://redis.io/documentation)
- [Supervisor Documentation](http://supervisord.org/)
