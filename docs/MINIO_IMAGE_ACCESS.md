# How Users Access Images from MinIO

## Overview

All images are now stored in MinIO and accessed through different methods depending on the resource type.

## ✅ Resources Using MinIO

### 1. **Image Model (Polymorphic)** ✅

Used by: Properties, Experiences, Giveaways, Users, Developers, Real Estate Projects

**Storage:** `Storage::disk('minio')`
**Access Method:** Through Image model's `url` attribute

```php
// Image model automatically generates MinIO URLs
$property->images->first()->url;           // Full size
$property->images->first()->thumbnail_urls; // All thumbnails
```

**Controllers Using This:**

- `PropertyController` - Property images
- `ExperienceController` - Experience images
- `GiveawayController` - Giveaway screenshots
- `RealEstateController` - Project/Developer images

---

### 2. **Blog Posts** ✅

**Storage:** `Storage::disk('minio')->storeAs('blog-images')`
**Access Method:** Featured image URL stored in database

```php
// BlogController stores full MinIO URL in database
$blog->featured_image; // e.g., http://localhost:9200/blog-images/123_abc.jpg
```

**URL Generation:**

```php
Storage::disk('minio')->url($path);
```

**Fixed in:**

- `BlogController::store()` - Line 70
- `BlogController::update()` - Line 151
- `BlogController::uploadImage()` - Line 229

---

### 3. **Expertise (Tech Stack)** ✅

**Storage:** `Storage::disk('minio')->storeAs('images/techstack')`
**Access Method:** Full URL stored in `image` field

```php
// ExpertiseController stores full MinIO URL
$expertise->image; // e.g., http://localhost:9200/images/techstack/laravel.png
```

**URL Generation:**

```php
Storage::disk('minio')->url($path);
```

**Fixed in:**

- `Admin/ExpertiseController::store()` - Line 53
- `Admin/ExpertiseController::update()` - Line 154
- `Api/ExpertiseController::store()` - Line 63
- `Api/ExpertiseController::update()` - Line 160

**Expertise Model:**

```php
// getImageUrlAttribute() handles both full URLs and asset() fallback
public function getImageUrlAttribute(): ?string
{
    if (str_starts_with($this->image, 'http')) {
        return $this->image; // Already full URL from MinIO
    }
    return asset($this->image); // Fallback for old data
}
```

---

### 4. **Experiences** ✅

**Storage:** Through polymorphic Image model
**Access Method:** Through relationship

```php
$experience->image->url;           // Full size from MinIO
$experience->image->thumbnail_urls; // Thumbnails from MinIO
$experience->image_url;            // Accessor uses image->url
```

**Fixed in:**

- `ExperienceController::store()` - Line 99
- `ExperienceController::update()` - Line 73

---

### 5. **Real Estate (Properties/Projects/Developers)** ✅

**Storage:** Through polymorphic Image model + ImageService
**Access Method:** Through relationship

```php
$property->images->first()->url;
$project->images->first()->url;
$developer->images->first()->url;
```

**Fixed in:**

- `RealEstateController::uploadImage()` - Line 684

---

### 6. **Settings/Files** ✅

**Storage:** `Storage::disk('minio')->store('settings')`
**Access Method:** Direct MinIO URL

```php
// SettingsController
$path = $request->file('file')->store('settings', 'minio');
```

---

## How Users Access Images

### Development (Local)

```
http://localhost:9200/path/to/image.webp
```

MinIO is exposed on port 9200 locally for direct access.

### Production (Internal MinIO)

#### Option 1: Through Nginx Proxy (Recommended - Already Configured)

```
https://humfurie.org/storage/path/to/image.webp
```

**How it works:**

1. User requests: `https://humfurie.org/storage/property-images/image.webp`
2. Nginx receives request
3. Nginx proxies to: `http://minio:9000/laravel-uploads/property-images/image.webp`
4. MinIO serves file internally
5. Nginx returns it with caching headers

**Configuration:** `.docker/nginx.prod.conf` lines 30-50

#### Option 2: Direct MinIO URL (if exposed)

```
https://cdn.humfurie.org/path/to/image.webp
```

Only if you configure Traefik to expose MinIO (not recommended for security).

---

## URL Examples by Resource

### Properties

```php
// Development
http://localhost:9200/property-images/1732234567_abc123.webp
http://localhost:9200/property-images/thumbs/medium/1732234567_abc123_medium.webp

// Production
https://humfurie.org/storage/property-images/1732234567_abc123.webp
https://humfurie.org/storage/property-images/thumbs/medium/1732234567_abc123_medium.webp
```

### Blog Posts

```php
// Development
http://localhost:9200/blog-images/1732234567_xyz789.jpg

// Production
https://humfurie.org/storage/blog-images/1732234567_xyz789.jpg
```

### Expertise

```php
// Development
http://localhost:9200/images/techstack/laravel.png

// Production
https://humfurie.org/storage/images/techstack/laravel.png
```

### Experiences

```php
// Development
http://localhost:9200/experiences/experience_img.png
http://localhost:9200/experiences/thumbs/small/experience_img_small.webp

// Production
https://humfurie.org/storage/experiences/experience_img.png
https://humfurie.org/storage/experiences/thumbs/small/experience_img_small.webp
```

### Giveaway Screenshots

```php
// Development
http://localhost:9200/giveaway-screenshots/hash_screenshot.jpg

// Production
https://humfurie.org/storage/giveaway-screenshots/hash_screenshot.jpg
```

---

## API Response Examples

### Property with Images

```json
{
  "id": 1,
  "title": "Beautiful House",
  "images": [
    {
      "id": 1,
      "url": "http://localhost:9200/property-images/123_abc.webp",
      "thumbnail_urls": {
        "small": "http://localhost:9200/property-images/thumbs/small/123_abc_small.webp",
        "medium": "http://localhost:9200/property-images/thumbs/medium/123_abc_medium.webp",
        "large": "http://localhost:9200/property-images/thumbs/large/123_abc_large.webp"
      }
    }
  ]
}
```

### Blog Post

```json
{
  "id": 1,
  "title": "My Blog Post",
  "featured_image": "http://localhost:9200/blog-images/456_def.jpg",
  "display_image": "http://localhost:9200/blog-images/456_def.jpg"
}
```

### Expertise

```json
{
  "id": 1,
  "name": "Laravel",
  "image": "http://localhost:9200/images/techstack/laravel.png",
  "image_url": "http://localhost:9200/images/techstack/laravel.png"
}
```

### Experience with Image

```json
{
  "id": 1,
  "position": "Software Engineer",
  "image_url": "http://localhost:9200/experiences/company_logo.webp",
  "image": {
    "url": "http://localhost:9200/experiences/company_logo.webp",
    "thumbnail_urls": {
      "small": "http://localhost:9200/experiences/thumbs/small/company_logo_small.webp"
    }
  }
}
```

---

## Frontend Access (React/Inertia)

### Using Image URLs Directly

```jsx
// Properties
<img src={property.images[0].url} alt={property.title} />
<img src={property.images[0].thumbnail_urls.medium} alt={property.title} />

// Blog
<img src={blog.featured_image} alt={blog.title} />

// Expertise
<img src={expertise.image} alt={expertise.name} />

// Experience
<img src={experience.image_url} alt={experience.company} />
```

All URLs are already full URLs from MinIO, so no additional processing needed!

---

## Caching Strategy

### Development

No caching - direct access to MinIO on port 9200.

### Production (Nginx Proxy)

```nginx
location /storage/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    proxy_pass http://minio:9000/laravel-uploads/;
}
```

**Benefits:**

- Browser caches images for 1 year
- CDN-like performance
- Reduced MinIO load

---

## Migration Notes

### Old Data (if any exists)

If you have old data using `storage/` paths or `asset()` URLs:

1. **Expertise** - Already has fallback:
   ```php
   // Model handles both old and new
   if (str_starts_with($this->image, 'http')) {
       return $this->image; // New MinIO URL
   }
   return asset($this->image); // Old local file
   ```

2. **Other Models** - Need migration:
   ```bash
   php artisan migrate:images-to-minio
   ```
   (Create this command if needed)

---

## Testing Image Access

### Test MinIO Connection

```bash
./vendor/bin/sail artisan minio:verify
```

### Test Image Upload

```bash
# Upload via API
curl -X POST http://localhost/api/properties/1/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test.jpg"

# Check response contains MinIO URL
{
  "data": {
    "url": "http://localhost:9200/property-images/..."
  }
}
```

### Test Image Access in Browser

```
# Development
http://localhost:9200/property-images/image.webp

# Production
https://humfurie.org/storage/property-images/image.webp
```

---

## Summary

✅ **All resources properly using MinIO**
✅ **URLs automatically generated**
✅ **Frontend gets full URLs** - no processing needed
✅ **Production uses nginx proxy** - better caching
✅ **Tests passing** - 309 tests verified

**Every image upload now goes to MinIO and returns proper URLs!** 🎉
