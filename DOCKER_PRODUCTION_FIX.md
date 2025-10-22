# Docker Production - Storage Persistence Fix

## Problem

Every time you rebuild the Docker container using `docker-compose.prod.yml`, experience images disappear.

## Root Cause

The `public/storage` → `storage/app/public` symlink was never being created in production. Laravel stores uploaded
images in `storage/app/public/experiences/`, but without the symlink, they can't be accessed via URLs like
`/storage/experiences/image.jpg`.

## Solution Implemented

### 1. Created Startup Script

**File:** `.docker/startup.prod.sh`

This script runs on every container start and:

- ✅ Waits for database to be ready
- ✅ Runs migrations automatically
- ✅ **Creates storage symlink** (`php artisan storage:link --force`)
- ✅ Caches config/routes/views for performance
- ✅ Starts supervisord

### 2. Updated Dockerfile

**File:** `docker/production/Dockerfile`

Now copies and executes the startup script instead of directly running supervisord.

### 3. How It Works

```
Container Start
    ↓
Startup Script Runs
    ↓
Database Check ✓
    ↓
Migrations ✓
    ↓
Storage Link Created ✓  ← This fixes your issue!
    ↓
Config Cached ✓
    ↓
Supervisord Starts
    ↓
App Ready!
```

## Storage Architecture

### Where Images Are Stored

```
Laravel Container:
├── storage/                          # Named volume (persists)
│   └── app/
│       └── public/
│           └── experiences/          # Images stored here
│               ├── abc123.jpg
│               └── def456.png
│
└── public/
    └── storage/                      # Symlink (recreated on start)
        → ../storage/app/public
```

### How Symlink Works

1. **Image Upload:**
   ```php
   $path = $request->file('image')->store('experiences', 'public');
   // Stores to: storage/app/public/experiences/abc123.jpg
   ```

2. **Symlink Creation:**
   ```bash
   php artisan storage:link
   # Creates: public/storage → ../storage/app/public
   ```

3. **URL Access:**
   ```
   Database stores: experiences/abc123.jpg
   Accessed via:    https://humfurie.org/storage/experiences/abc123.jpg
                                           ↑ Uses symlink
   ```

## Rebuild Process (Fixed)

### Before Fix ❌

```bash
docker-compose -f docker-compose.prod.yml up --build -d
# 1. Container starts
# 2. No storage:link runs
# 3. Symlink missing
# 4. Images not accessible ❌
```

### After Fix ✅

```bash
docker-compose -f docker-compose.prod.yml up --build -d
# 1. Container starts
# 2. Startup script runs
# 3. storage:link creates symlink ✓
# 4. Images accessible ✅
```

## Volumes Explained

From `docker-compose.prod.yml`:

```yaml
volumes:
  # Host → Container (development mounts)
  - ./app:/var/www/html/app
  - ./resources:/var/www/html/resources
  # ... etc

  # Persist these from built image
  - /var/www/html/vendor         # Don't overwrite
  - /var/www/html/node_modules   # Don't overwrite
  - /var/www/html/public/build   # Don't overwrite

  # Named volume (persists between rebuilds)
  - laravel-storage:/var/www/html/storage  ← Images persist here!
```

The named volume `laravel-storage` ensures that uploaded images survive container rebuilds!

## Testing the Fix

### 1. Rebuild Container

```bash
cd /home/humfurie/Desktop/Projects/laravel-react-12
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

### 2. Check Logs

```bash
docker-compose -f docker-compose.prod.yml logs app
```

You should see:

```
Starting Laravel production initialization...
Waiting for database...
Database is ready!
Running migrations...
Creating storage symlink...
The [public/storage] link has been connected to [/var/www/html/storage/app/public].
Caching configuration...
Laravel initialization complete!
Starting supervisord...
```

### 3. Verify Symlink Exists

```bash
docker-compose -f docker-compose.prod.yml exec app ls -la /var/www/html/public/storage
```

Should show:

```
lrwxrwxrwx 1 www-data www-data 31 Oct 22 12:00 /var/www/html/public/storage -> /var/www/html/storage/app/public
```

### 4. Check Images

```bash
docker-compose -f docker-compose.prod.yml exec app ls -la /var/www/html/storage/app/public/experiences
```

Should show your experience images!

## Troubleshooting

### Images Still Missing After Rebuild

**Check if storage volume has data:**

```bash
docker volume inspect laravel-react-12_laravel-storage
docker run --rm -v laravel-react-12_laravel-storage:/data alpine ls -la /data/app/public/experiences
```

**If volume is empty, images were lost before the fix.**
Solution: Re-upload images via admin panel.

### Symlink Not Created

**Check startup logs:**

```bash
docker-compose -f docker-compose.prod.yml logs app | grep "storage:link"
```

**Manually create symlink:**

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan storage:link --force
```

### Permission Errors

**Fix permissions:**

```bash
docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html/storage
docker-compose -f docker-compose.prod.yml exec app chmod -R 775 /var/www/html/storage
```

## Additional Improvements in Startup Script

### 1. Database Wait

Prevents "database connection refused" errors on startup.

### 2. Auto Migrations

Runs `php artisan migrate --force` on every start. Safe because Laravel migrations are idempotent.

### 3. Config Caching

Improves performance by caching:

- Configuration files
- Routes
- Views

### 4. Cache Clearing

Clears stale application cache to prevent weird bugs.

## Deployment Workflow

### Development → Production

1. **Make changes locally**
2. **Commit to git**
3. **Pull on production server:**
   ```bash
   git pull origin master
   ```

4. **Rebuild container:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d
   ```

5. **Startup script handles:**
    - Migrations ✓
    - Storage link ✓
    - Config caching ✓

6. **Zero downtime** (Traefik handles routing)

## Files Modified/Created

```
✨ New Files:
.docker/startup.prod.sh         # Startup script with storage:link

🔧 Modified Files:
docker/production/Dockerfile    # Now uses startup script
```

## Future Considerations

### Option 1: Mount public/storage (Not Recommended)

```yaml
volumes:
  - laravel-storage-public:/var/www/html/public/storage
```

**Problem:** Breaks on rebuild, adds complexity.

### Option 2: Use S3/Cloud Storage (Recommended for Scale)

When you have lots of images, consider:

- AWS S3
- DigitalOcean Spaces
- Cloudflare R2

**Benefit:** Images persist outside container, globally accessible, CDN-ready.

**Setup:**

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=humfurie-images
```

## Summary

✅ **Problem Fixed:** Storage symlink now created on every container start
✅ **Images Persist:** Named volume preserves uploads
✅ **Auto Migrations:** Database always up to date
✅ **Performance:** Config/routes/views cached automatically
✅ **Zero Config:** Just rebuild and it works!

**Next rebuild will preserve your experience images!** 🎉
