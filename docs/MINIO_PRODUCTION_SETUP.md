# MinIO Production Setup Guide (Internal Configuration)

## Summary of Changes

✅ **Redis Status**: Already configured and functional in production
✅ **MinIO Status**: Now added to `docker-compose.prod.yml` as **internal service**

## What Was Added

### 1. MinIO Service in `docker-compose.prod.yml`

- **Network**: Internal only (laravel network)
- **NOT exposed** publicly via Traefik
- **Access**: Through nginx proxy at `https://humfurie.org/storage/`
- **Persistent Storage**: `minio-data` volume
- **Memory Limits**: 512MB max, 256MB reserved
- **Health Checks**: Enabled
- **Security**: Internal network only, no direct public access

### 2. Nginx Configuration

Added proxy configuration in `.docker/nginx.prod.conf`:

- Proxies `/storage/*` requests to MinIO internally
- Strips MinIO headers for security
- Adds caching headers for performance
- No direct MinIO access from outside

### 3. Required Changes to `.env.production`

Add these lines to your `.env.production` file:

```env
# Change filesystem disk to MinIO
FILESYSTEM_DISK=minio

# MinIO Configuration (Internal Only - Not Publicly Accessible)
MINIO_ROOT_USER=your-secure-username
MINIO_ROOT_PASSWORD=your-very-strong-password-min-8-chars
MINIO_ACCESS_KEY=your-secure-username
MINIO_SECRET_KEY=your-very-strong-password-min-8-chars
MINIO_BUCKET=laravel-uploads
MINIO_REGION=us-east-1
MINIO_ENDPOINT=http://minio:9000
MINIO_URL=https://humfurie.org/storage
```

**⚠️ IMPORTANT SECURITY NOTES:**

- **DO NOT** use `sail/password` in production!
- Use a strong password (minimum 8 characters, mix of letters/numbers/symbols)
- Keep these credentials secure and never commit them to Git
- `MINIO_ROOT_USER` and `MINIO_ACCESS_KEY` should be the same
- `MINIO_ROOT_PASSWORD` and `MINIO_SECRET_KEY` should be the same

## DNS Configuration Required

**No additional DNS records needed!** 🎉

Since MinIO is internal and accessed through your main domain, you only need your existing DNS:

- `humfurie.org` (already configured)
- `www.humfurie.org` (already configured)

Images will be served from `https://humfurie.org/storage/...`

## Deployment Steps

### 1. Update Environment Variables

```bash
# On your production server
cd /path/to/your/app
nano .env.production
```

Add the MinIO configuration shown above with your secure credentials.

### 2. Pull Latest Changes

```bash
git pull origin master  # or your production branch
```

### 3. Rebuild and Deploy

```bash
# Build the new image with updated code
docker-compose -f docker-compose.prod.yml build app

# Start all services (including MinIO)
docker-compose -f docker-compose.prod.yml up -d

# Check all services are running
docker-compose -f docker-compose.prod.yml ps
```

### 4. Create MinIO Bucket

After MinIO starts, create the bucket with proper permissions:

```bash
# Execute the setup command inside the app container
docker-compose -f docker-compose.prod.yml exec app php artisan minio:setup
```

You should see:

```
Setting up MinIO bucket...
Creating bucket: laravel-uploads
✅ Bucket 'laravel-uploads' created successfully with public read access.
```

### 5. Verify MinIO is Working

Test the internal endpoint:

```bash
# From inside the app container
docker-compose -f docker-compose.prod.yml exec app curl http://minio:9000/minio/health/live

# MinIO Console is NOT accessible from outside
# It's only available on the internal network for security
# If you need admin access, use port forwarding:
ssh -L 9001:localhost:9001 your-server
# Then access http://localhost:9001 on your local machine
```

## Post-Deployment Verification

### 1. Check Services Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

All services should show "Up (healthy)":

- ✅ app
- ✅ postgres
- ✅ redis
- ✅ minio
- ✅ ssr

### 2. Check Nginx Proxy

```bash
# Test the storage proxy from outside
curl -I https://humfurie.org/storage/

# Check nginx logs
docker-compose -f docker-compose.prod.yml logs app | grep storage
```

### 3. Test Image Upload

1. Login to your Laravel app
2. Upload an image (blog, property, experience, etc.)
3. Check the image URL - it should start with `https://humfurie.org/storage/`
4. Verify the image loads in your browser

### 4. Access MinIO Console (Optional)

MinIO console is not publicly accessible for security. If you need access:

```bash
# SSH tunnel from your local machine
ssh -L 9001:minio:9001 your-server

# Or expose temporarily via docker (NOT recommended for production)
# Add to minio service in docker-compose.prod.yml:
# ports:
#   - "127.0.0.1:9001:9001"
```

Then access http://localhost:9001 and login with your credentials.

## URL Structure

Images will be accessible at:

```
https://humfurie.org/storage/property-images/1234567890_abc123.webp
https://humfurie.org/storage/blog-images/1234567890_xyz789.webp
https://humfurie.org/storage/experiences/1234567890_def456.webp
```

**How it works:**

1. User requests: `https://humfurie.org/storage/property-images/image.webp`
2. Nginx receives the request
3. Nginx proxies to: `http://minio:9000/laravel-uploads/property-images/image.webp`
4. MinIO serves the file internally
5. Nginx returns it to the user with caching headers

## Troubleshooting

### MinIO won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs minio

# Common issues:
# 1. Missing environment variables - check .env.production
# 2. Port conflicts - ensure 9000 and 9001 aren't used
# 3. Volume permissions - check minio-data volume
```

### Nginx proxy not working

```bash
# Check nginx configuration syntax
docker-compose -f docker-compose.prod.yml exec app nginx -t

# Reload nginx
docker-compose -f docker-compose.prod.yml exec app nginx -s reload

# Check nginx error logs
docker-compose -f docker-compose.prod.yml logs app | grep error
```

### Images not loading

1. Check internal MinIO health:
   ```bash
   docker-compose -f docker-compose.prod.yml exec app curl http://minio:9000/minio/health/live
   ```

2. Test nginx proxy:
   ```bash
   curl -I https://humfurie.org/storage/
   ```

3. Verify bucket exists:
   ```bash
   docker-compose -f docker-compose.prod.yml exec app php artisan tinker
   Storage::disk('minio')->exists('test.txt')
   ```

4. Check MINIO_URL in .env.production is `https://humfurie.org/storage`

### Can't access MinIO Console

This is normal - the console is not publicly accessible for security. Use SSH tunneling:

```bash
# From your local machine
ssh -L 9001:localhost:9001 your-server-user@your-server-ip

# Then access http://localhost:9001
```

## Migration from Public Storage (If Needed)

If you have existing images in `storage/app/public`, you can migrate them:

```bash
# Install MinIO client in your app container
docker-compose -f docker-compose.prod.yml exec app bash
apt-get update && apt-get install -y wget
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
mv mc /usr/local/bin/

# Configure MinIO client
mc alias set myminio http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Copy existing files
mc cp --recursive /var/www/html/storage/app/public/* myminio/laravel-uploads/
```

## Security Best Practices

1. **Strong Credentials**: Use complex passwords for MINIO_ROOT_USER and MINIO_ROOT_PASSWORD
2. **Regular Backups**: Backup the `minio-data` volume regularly
3. **Access Logs**: Monitor MinIO access via the console
4. **Bucket Policies**: Only the `laravel-uploads` bucket should be public
5. **Firewall**: Ensure only ports 80 and 443 are exposed publicly
6. **Updates**: Keep MinIO updated: `docker-compose -f docker-compose.prod.yml pull minio`

## Resource Monitoring

MinIO in production is configured with:

- **Memory Limit**: 512MB
- **Memory Reservation**: 256MB
- **Health Checks**: Every 30 seconds
- **Restart Policy**: unless-stopped

Monitor resource usage:

```bash
docker stats minio
```

## Backup Strategy

### Automated Daily Backups

Create a cron job to backup MinIO data:

```bash
# Add to crontab: crontab -e
0 2 * * * /usr/bin/docker run --rm -v minio-data:/data -v /backups:/backup alpine tar czf /backup/minio-$(date +\%Y\%m\%d).tar.gz /data
```

### Manual Backup

```bash
# Backup
docker run --rm -v minio-data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data

# Restore
docker run --rm -v minio-data:/data -v $(pwd):/backup alpine tar xzf /backup/minio-backup.tar.gz -C /
```

## Summary

✅ **Redis**: Fully functional in production
✅ **MinIO**: Internal service, not publicly exposed
✅ **Nginx Proxy**: Serves MinIO files through main domain
✅ **SSL**: Automatic via Traefik (existing setup)
✅ **Scalable**: Persistent storage with volume backups
✅ **Secure**: Internal network only, nginx-proxied access
✅ **No DNS Changes**: Uses existing domain

## Benefits of Internal MinIO

1. **Better Security**: MinIO not directly accessible from internet
2. **Simpler Setup**: No additional DNS/subdomains needed
3. **Unified Domain**: All content served from humfurie.org
4. **Better Caching**: Nginx handles caching/compression
5. **Lower Attack Surface**: One less service exposed publicly

Your images will now be served from `https://humfurie.org/storage/...`! 🚀
