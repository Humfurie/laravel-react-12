# Deployment Guide

This document outlines the deployment configurations for different environments.

## Environment Configurations

### 1. Local Development (Laravel Sail)

**Environment**: `local`
**File**: `.env` (current)

**Image Storage Strategy**:

- Uses **MinIO** for S3-compatible object storage
- Public URL: `http://localhost:9200` (MinIO console accessible at :9201)
- Internal endpoint: `http://minio:9000`

**Configuration**:

```env
APP_ENV=local
APP_URL=http://localhost
FILESYSTEM_DISK=minio

# MinIO Configuration
MINIO_ROOT_USER=sail
MINIO_ROOT_PASSWORD=password
MINIO_ACCESS_KEY=sail
MINIO_SECRET_KEY=password
MINIO_BUCKET=laravel-uploads
MINIO_REGION=us-east-1
MINIO_ENDPOINT=http://minio:9000
MINIO_URL=http://localhost:9200
```

**Image URLs**:

- All images: `http://localhost:9200/laravel-uploads/images/*`

**Setup Steps** (First time only):

```bash
./vendor/bin/sail artisan minio:setup
```

**Access MinIO Console**:

- URL: `http://localhost:9201`
- Username: `sail`
- Password: `password`

---

### 2. Testing Environment (Docker Compose Test)

**Environment**: `testing`
**File**: `.env.testing.example` � copy to `.env` when deploying

**Image Storage Strategy**:

- Uses **MinIO** for S3-compatible object storage
- Public URL: `http://localhost:9200` (MinIO console accessible)
- Internal endpoint: `http://minio:9000`

**Configuration**:

```env
APP_ENV=testing
APP_URL=http://localhost
APP_PORT=8080
FILESYSTEM_DISK=minio

# MinIO Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=laravel-uploads
MINIO_REGION=us-east-1
MINIO_ENDPOINT=http://minio:9000
MINIO_URL=http://localhost:9200
```

**Image URLs**:

- All images: `http://localhost:9200/laravel-uploads/images/*`

**Docker Compose**: `docker-compose.test.yml`

---

### 3. Production Environment (Docker Compose Prod)

**Environment**: `production`
**File**: `.env.production.example` � copy to `.env` when deploying

**Image Storage Strategy**:

- Uses **MinIO** with **CDN subdomain**
- Public URL: `https://cdn.humfurie.org`
- Internal endpoint: `http://minio:9000`

**Configuration**:

```env
APP_ENV=production
APP_URL=https://humfurie.org
APP_PORT=30000
FILESYSTEM_DISK=minio

# MinIO Configuration
MINIO_ROOT_USER=your-minio-username
MINIO_ROOT_PASSWORD=your-strong-minio-password
MINIO_ACCESS_KEY=your-minio-username
MINIO_SECRET_KEY=your-strong-minio-password
MINIO_BUCKET=laravel-uploads
MINIO_REGION=us-east-1
MINIO_ENDPOINT=http://minio:9000
MINIO_URL=https://cdn.humfurie.org
```

**Image URLs**:

- All images: `https://cdn.humfurie.org/laravel-uploads/images/*`

**Docker Compose**: `docker-compose.prod.yml`

**DNS Configuration Required**:

- `cdn.humfurie.org` � Point to your server IP
- Set up reverse proxy (nginx) to route to MinIO:9000

---

## Seeder Behavior

The `ExpertiseSeeder` uploads images to MinIO in all environments:

```php
// Uploads to MinIO
Storage::disk('minio')->put($minioPath, $imageContent);

// Gets URL based on MINIO_URL environment variable
$expertiseData['image'] = Storage::disk('minio')->url($minioPath);
```

**Result URLs by Environment**:

- Local: `http://localhost:9200/laravel-uploads/images/techstack/laravel.webp`
- Testing: `http://localhost:9200/laravel-uploads/images/techstack/laravel.webp`
- Production: `https://cdn.humfurie.org/laravel-uploads/images/techstack/laravel.webp`

---

## Deployment Steps

### Testing Environment

1. Copy environment file:

```bash
cp .env.testing.example .env
```

2. Update credentials in `.env`

3. Start services:

```bash
docker-compose -f docker-compose.test.yml up -d
```

4. Setup MinIO bucket with public access:

```bash
docker-compose -f docker-compose.test.yml exec laravel.test php artisan minio:setup
```

5. Run migrations and seeders:

```bash
docker-compose -f docker-compose.test.yml exec laravel.test php artisan migrate --seed
```

6. Access MinIO console: `http://localhost:9201`
    - Username: `minioadmin`
    - Password: `minioadmin`

---

### Production Environment

1. Set up DNS:
    - Point `cdn.humfurie.org` to your server

2. Copy environment file:

```bash
cp .env.production.example .env
```

3. Update credentials in `.env`:
    - Generate new `APP_KEY`: `php artisan key:generate`
    - Set strong MinIO credentials
    - Update database password
    - Add FMP API key

4. Configure reverse proxy (nginx) for `cdn.humfurie.org`:

```nginx
server {
    listen 443 ssl;
    server_name cdn.humfurie.org;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

5. Start services:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

6. Setup MinIO bucket with public access:

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan minio:setup
```

7. Run migrations and seeders:

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --seed
```

8. Build frontend assets:

```bash
docker-compose -f docker-compose.prod.yml exec app npm run build
```

---

## Summary Table

| Environment      | APP_ENV      | Image Storage | MINIO_URL                                  | Image Access                                 |
|------------------|--------------|---------------|--------------------------------------------|----------------------------------------------|
| **Local (Sail)** | `local`      | MinIO         | `http://localhost:9200/laravel-uploads`    | `http://localhost:9200/laravel-uploads/*`    |
| **Testing**      | `testing`    | MinIO         | `http://localhost:9200/laravel-uploads`    | `http://localhost:9200/laravel-uploads/*`    |
| **Production**   | `production` | MinIO         | `https://cdn.humfurie.org/laravel-uploads` | `https://cdn.humfurie.org/laravel-uploads/*` |

---

## Notes

- **All environments** use MinIO for consistent S3-compatible storage
- **Local and Testing** use `localhost:9200` for MinIO access
- **Production** requires DNS setup for `cdn.humfurie.org` subdomain
- **Production** requires SSL certificate for HTTPS
- All environments use the same seeder code - URL changes automatically via `MINIO_URL` env var
- MinIO credentials should be changed from defaults in production
- MinIO Console accessible at port `9201` in all environments
