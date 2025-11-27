# Nginx MinIO Proxy - Production Deployment Guide

## Problem Solved

**Issue**: `https://humfurie.org/storage/path/to/image.webp` returns 404

**Root Cause**: Nginx static assets location was matching `.webp` files in `/storage/` paths BEFORE the `/storage/`
proxy location could handle them.

**Solution**: Reordered nginx location blocks and added negative lookahead to exclude `/storage/` from static assets.

## Configuration Changes

### File: `.docker/nginx.prod.conf`

**Critical Change**: `/storage/` location MUST come BEFORE static assets location.

```nginx
# Line 16-36: MinIO Proxy (MUST be before static assets)
location /storage/ {
    proxy_pass http://minio:9000/laravel-uploads/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Cache static files
    expires 1y;
    add_header Cache-Control "public, immutable";

    # Hide MinIO headers for security
    proxy_hide_header X-Amz-Request-Id;
    proxy_hide_header X-Amz-Id-2;
    proxy_hide_header X-Amz-Meta-Server-Side-Encryption;

    # Large file support
    proxy_buffering off;
    proxy_request_buffering off;
}

# Line 45-50: Static Assets (with negative lookahead to exclude /storage/)
location ~* ^/(?!storage/).*\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}
```

### Key Points:

1. **Order Matters**: `/storage/` location at line 17 comes before static assets at line 46
2. **Negative Lookahead**: `(?!storage/)` excludes `/storage/` from static assets regex
3. **Proxy Configuration**: Proxies to `http://minio:9000/laravel-uploads/`

## How It Works

### Request Flow:

```
User Request: https://humfurie.org/storage/images/techstack/laravel.webp
      ↓
Nginx receives request
      ↓
Checks location blocks in order:
  1. ✅ Matches: location /storage/
  2. ❌ Skipped: location ~* ^/(?!storage/).*\.webp$ (negative lookahead excludes /storage/)
      ↓
Proxies to: http://minio:9000/laravel-uploads/images/techstack/laravel.webp
      ↓
MinIO serves file (bucket policy allows public read)
      ↓
Nginx adds cache headers and returns to user
```

### Before Fix (Broken):

```
User Request: https://humfurie.org/storage/images/techstack/laravel.webp
      ↓
Nginx checks location blocks:
  1. ❌ Skipped: location /storage/ (at line 31, after static assets)
  2. ✅ Matches: location ~* .*\.webp$ (catches ALL .webp files)
      ↓
Tries to serve from: /var/www/html/public/storage/images/techstack/laravel.webp
      ↓
File not found → 404 Error
```

## Production Deployment Steps

### Step 1: Verify Current Configuration

```bash
# SSH into production server
ssh your-production-server

# Navigate to project
cd /path/to/laravel-react-12

# Check current nginx config
cat .docker/nginx.prod.conf | grep -n "location /storage/"
cat .docker/nginx.prod.conf | grep -n "location ~\*"
```

**Expected Output:**

- `/storage/` location should be around line 17
- Static assets location should be around line 46
- Static assets should have `(?!storage/)` negative lookahead

### Step 2: Pull Latest Changes

```bash
# Pull latest code (includes nginx.prod.conf fix)
git pull origin master

# Verify the fix is present
cat .docker/nginx.prod.conf | grep -A 5 "location /storage/"
```

### Step 3: Ensure MinIO Bucket Policy is Applied

```bash
# Run MinIO setup (applies public read policy)
docker-compose -f docker-compose.prod.yml exec app php artisan minio:setup
```

**Expected Output:**

```
Setting up MinIO bucket...
ℹ️  Bucket 'laravel-uploads' already exists.
Applying public read policy...
✅ Public read policy applied successfully!
```

### Step 4: Restart App Container (Reloads Nginx)

```bash
# Rebuild and restart app container (includes nginx)
docker-compose -f docker-compose.prod.yml up -d --force-recreate app

# Verify container is running
docker-compose -f docker-compose.prod.yml ps app
```

### Step 5: Test Proxy Configuration

```bash
# Run diagnostic command
docker-compose -f docker-compose.prod.yml exec app php artisan minio:test-proxy
```

**Expected Output:**

```
✅ All internal tests passed!
   Now test the public URL above to verify nginx proxy.
```

### Step 6: Test Public Access

From the `minio:test-proxy` output, copy the public URL and test it:

```bash
# Test from server
curl -I https://humfurie.org/storage/nginx-proxy-test.txt

# Expected: HTTP/2 200 OK
# Should NOT return: 404 Not Found or Access Denied
```

**Or test from browser:**

```
https://humfurie.org/storage/nginx-proxy-test.txt
```

Should display: "If you can see this, the proxy is working!"

### Step 7: Test Real Images

Test existing images in your database:

```bash
# Get an actual image URL from database
docker-compose -f docker-compose.prod.yml exec app php artisan tinker

# In tinker:
Expertise::first()->image
# Output: "https://humfurie.org/storage/images/techstack/laravel.webp"

exit
```

Test the URL:

```bash
curl -I https://humfurie.org/storage/images/techstack/laravel.webp
```

**Expected**: `HTTP/2 200 OK` with content-type `image/webp`

## Troubleshooting

### Issue: Still Getting 404

**Check 1: Nginx Configuration Order**

```bash
# Verify /storage/ comes before static assets
cat .docker/nginx.prod.conf | grep -n "location"
```

Lines should be in this order:

- Line ~17: `location /storage/`
- Line ~39: `location /build/`
- Line ~46: `location ~* ^/(?!storage/).*\.(css|js|...)`

**Check 2: Container Restarted?**

```bash
# Nginx only reloads config on container restart
docker-compose -f docker-compose.prod.yml restart app
```

**Check 3: File Exists in MinIO?**

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan tinker

Storage::disk('minio')->exists('images/techstack/laravel.webp')
# Should return: true
```

### Issue: Access Denied Error

**Solution**: Re-apply bucket policy

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan minio:setup
```

### Issue: Connection Refused

**Check MinIO is Running:**

```bash
docker-compose -f docker-compose.prod.yml ps minio
# Should show: Up (healthy)
```

**Restart MinIO:**

```bash
docker-compose -f docker-compose.prod.yml restart minio
```

## Environment Variables

Ensure `.env` on production has:

```env
FILESYSTEM_DISK=minio

# MinIO Configuration
MINIO_ROOT_USER=your-secure-username
MINIO_ROOT_PASSWORD=your-strong-password
MINIO_ACCESS_KEY=your-secure-username
MINIO_SECRET_KEY=your-strong-password
MINIO_BUCKET=laravel-uploads
MINIO_REGION=us-east-1
MINIO_ENDPOINT=http://minio:9000
MINIO_URL=https://humfurie.org/storage  # ← Critical for correct URLs
```

## URL Structure

### Development:

```
http://localhost:9200/images/techstack/laravel.webp
```

- Direct access to MinIO
- Port 9200 exposed

### Production:

```
https://humfurie.org/storage/images/techstack/laravel.webp
```

- Proxied through nginx
- MinIO not exposed to internet
- Single SSL certificate

## Testing Checklist

After deployment, verify:

- [ ] `minio:test-proxy` command passes all tests
- [ ] Test file accessible: `https://humfurie.org/storage/nginx-proxy-test.txt`
- [ ] Expertise images load: `https://humfurie.org/storage/images/techstack/laravel.webp`
- [ ] Property images load (check a property detail page)
- [ ] Blog featured images load (check blog posts)
- [ ] Experience company logos load (check experience cards)
- [ ] No console errors on frontend
- [ ] Images have proper cache headers (1 year expiry)

## Quick Deployment Script

```bash
#!/bin/bash
# deploy-minio-proxy.sh

echo "🚀 Deploying MinIO Proxy Fix..."

# Pull latest code
echo "📥 Pulling latest changes..."
git pull origin master

# Restart app container
echo "🔄 Restarting app container..."
docker-compose -f docker-compose.prod.yml up -d --force-recreate app

# Wait for container to be ready
echo "⏳ Waiting for container to start..."
sleep 5

# Apply MinIO bucket policy
echo "🔧 Applying MinIO bucket policy..."
docker-compose -f docker-compose.prod.yml exec app php artisan minio:setup

# Run diagnostic test
echo "🧪 Running diagnostic test..."
docker-compose -f docker-compose.prod.yml exec app php artisan minio:test-proxy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Test this URL in your browser:"
echo "   https://humfurie.org/storage/nginx-proxy-test.txt"
echo ""
echo "2. Verify existing images load correctly"
echo "3. Check frontend for any image loading errors"
```

Make it executable:

```bash
chmod +x deploy-minio-proxy.sh
./deploy-minio-proxy.sh
```

## Verification Commands

```bash
# 1. Check nginx config is correct
docker-compose -f docker-compose.prod.yml exec app cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /storage/"

# 2. Test internal MinIO connectivity
docker-compose -f docker-compose.prod.yml exec app curl -I http://minio:9000/laravel-uploads/nginx-proxy-test.txt

# 3. Check MinIO health
docker-compose -f docker-compose.prod.yml exec minio curl -I http://localhost:9000/minio/health/live

# 4. View app container logs
docker-compose -f docker-compose.prod.yml logs app --tail 50

# 5. View MinIO logs
docker-compose -f docker-compose.prod.yml logs minio --tail 50
```

## Summary

✅ **Fixed**: Nginx location block ordering
✅ **Fixed**: Static assets negative lookahead excludes /storage/
✅ **Tested**: Development proxy works perfectly
✅ **Ready**: For production deployment

**The fix ensures that all requests to `/storage/*` are proxied to MinIO instead of being treated as static files.**

Deploy these changes to production, restart the app container, and your image URLs will work correctly!
