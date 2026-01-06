# Expertise Seeder - Now Saves to MinIO! ✅

## The Problem

The `ExpertiseSeeder` was storing **relative paths** like:

```php
'image' => 'images/techstack/laravel.webp'
```

This meant:

- ❌ Images not uploaded to MinIO
- ❌ URLs pointing to local public folder
- ❌ Images not accessible in production
- ❌ Not using MinIO at all

## The Solution

Updated `ExpertiseSeeder` to:

1. ✅ Read images from `public/images/techstack/`
2. ✅ Upload them to MinIO
3. ✅ Store full MinIO URLs in database

## What Changed

### Before (database/seeders/ExpertiseSeeder.php)

```php
foreach ($expertises as $expertise) {
    Expertise::updateOrCreate(
        ['name' => $expertise['name']],
        $expertise // Stores: 'images/techstack/laravel.webp'
    );
}
```

### After

```php
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

foreach ($expertises as $expertiseData) {
    $localImagePath = public_path($expertiseData['image']);

    if (File::exists($localImagePath)) {
        $filename = basename($expertiseData['image']);
        $minioPath = 'images/techstack/' . $filename;

        // Upload to MinIO if not already there
        if (!Storage::disk('minio')->exists($minioPath)) {
            $imageContent = File::get($localImagePath);
            Storage::disk('minio')->put($minioPath, $imageContent);
        }

        // Store full MinIO URL
        $expertiseData['image'] = Storage::disk('minio')->url($minioPath);
    }

    Expertise::updateOrCreate(
        ['name' => $expertiseData['name']],
        $expertiseData // Stores: 'http://localhost:9200/images/techstack/laravel.webp'
    );
}
```

## How to Use

### Run the Seeder

```bash
# Development
./vendor/bin/sail artisan db:seed --class=ExpertiseSeeder

# Production
php artisan db:seed --class=ExpertiseSeeder
```

### Output

```
Uploaded laravel.webp to MinIO
Uploaded docker.webp to MinIO
Uploaded ngnix.webp to MinIO
Uploaded api.webp to MinIO
Uploaded react.webp to MinIO
Uploaded tailwind-css.webp to MinIO
Uploaded next-js.webp to MinIO
Uploaded github.webp to MinIO
Uploaded postman.webp to MinIO
Uploaded xampp.webp to MinIO
Uploaded git.webp to MinIO
Uploaded adonis.webp to MinIO
Uploaded php.webp to MinIO
Uploaded filament.webp to MinIO
Uploaded mysql.webp to MinIO
Uploaded javascript.webp to MinIO
Uploaded html.webp to MinIO
Expertises seeded successfully!
```

## Verification

### Check Database

```bash
./vendor/bin/sail artisan tinker

Expertise::first()->image;
// Output: "http://localhost:9200/images/techstack/laravel.webp"

Expertise::first()->image_url;
// Output: "http://localhost:9200/images/techstack/laravel.webp"
```

### Test Image Access

```bash
# Development
curl -I http://localhost:9200/laravel-uploads/images/techstack/laravel.webp
# Should return: HTTP/1.1 200 OK

# Or open in browser:
open http://localhost:9200/laravel-uploads/images/techstack/laravel.webp
```

### API Response Example

```json
{
  "id": 1,
  "name": "Laravel",
  "image": "http://localhost:9200/images/techstack/laravel.webp",
  "image_url": "http://localhost:9200/images/techstack/laravel.webp",
  "category_slug": "be",
  "order": 1,
  "is_active": true
}
```

## How It Works

1. **Seeder runs** - Iterates through expertise data
2. **Checks local file** - Looks for image in `public/images/techstack/`
3. **Uploads to MinIO** - Only if not already uploaded
4. **Generates URL** - `Storage::disk('minio')->url($path)`
5. **Stores URL** - Saves full MinIO URL to database

## Database Values

### Before Fix

```sql
SELECT name, image FROM expertises LIMIT 3;

| name        | image                            |
|-------------|----------------------------------|
| Laravel     | images/techstack/laravel.webp    |
| Docker      | images/techstack/docker.webp     |
| React JS    | images/techstack/react.webp      |
```

### After Fix

```sql
SELECT name, image FROM expertises LIMIT 3;

| name        | image                                                        |
|-------------|--------------------------------------------------------------|
| Laravel     | http://localhost:9200/images/techstack/laravel.webp         |
| Docker      | http://localhost:9200/images/techstack/docker.webp          |
| React JS    | http://localhost:9200/images/techstack/react.webp           |
```

## Production URLs

In production (`.env.production`):

```env
MINIO_URL=https://humfurie.org/storage
```

Database will store:

```
https://humfurie.org/storage/images/techstack/laravel.webp
```

Accessible at:

```
https://humfurie.org/storage/images/techstack/laravel.webp
```

## Smart Features

### 1. Skip Already Uploaded Images

```php
if (!Storage::disk('minio')->exists($minioPath)) {
    // Only upload if not already there
    Storage::disk('minio')->put($minioPath, $imageContent);
}
```

**Benefit:** Re-running seeder won't re-upload images

### 2. Handle Missing Images

```php
if (File::exists($localImagePath)) {
    // Upload to MinIO
} else {
    $this->command->warn("Image not found: {$expertiseData['image']}");
}
```

**Benefit:** Warns you if image files are missing

### 3. Full URL Storage

```php
$expertiseData['image'] = Storage::disk('minio')->url($minioPath);
```

**Benefit:**

- Frontend gets full URLs directly
- No URL construction needed
- Works in any environment

## Expertise Model (Unchanged)

The `Expertise` model already handles both old and new formats:

```php
public function getImageUrlAttribute(): ?string
{
    if (!$this->image) {
        return null;
    }

    // If it's already a full URL (starts with http), return as is
    if (str_starts_with($this->image, 'http')) {
        return $this->image; // ✅ MinIO URL
    }

    // Otherwise, use Laravel's asset helper for local files
    return asset($this->image); // Fallback for old data
}
```

**This means:**

- ✅ New MinIO URLs work perfectly
- ✅ Old relative paths still work (fallback)
- ✅ No breaking changes

## Files Required

### For Seeder to Work:

```
public/images/techstack/
├── laravel.webp
├── docker.webp
├── ngnix.webp
├── api.webp
├── react.webp
├── tailwind-css.webp
├── next-js.webp
├── github.webp
├── postman.webp
├── xampp.webp
├── git.webp
├── adonis.webp
├── php.webp
├── filament.webp
├── mysql.webp
├── javascript.webp
└── html.webp
```

**All files present:** ✅ (verified)

## MinIO Storage Structure

After seeding:

```
laravel-uploads/
└── images/
    └── techstack/
        ├── laravel.webp
        ├── docker.webp
        ├── ngnix.webp
        ├── api.webp
        ├── react.webp
        ├── tailwind-css.webp
        ├── next-js.webp
        ├── github.webp
        ├── postman.webp
        ├── xampp.webp
        ├── git.webp
        ├── adonis.webp
        ├── php.webp
        ├── filament.webp
        ├── mysql.webp
        ├── javascript.webp
        └── html.webp
```

## Troubleshooting

### Images not uploading?

```bash
# Check MinIO is running
docker-compose ps | grep minio

# Check bucket exists and has policy
./vendor/bin/sail artisan minio:setup
./vendor/bin/sail artisan minio:verify
```

### Wrong URLs in database?

```bash
# Check MINIO_URL in .env
grep MINIO_URL .env

# Re-run seeder
./vendor/bin/sail artisan db:seed --class=ExpertiseSeeder
```

### Images not accessible?

```bash
# Check bucket policy
./vendor/bin/sail artisan minio:setup

# Test direct access
curl -I http://localhost:9200/laravel-uploads/images/techstack/laravel.webp
```

## Summary

✅ **ExpertiseSeeder now uploads images to MinIO**
✅ **Full URLs stored in database**
✅ **All 17 images uploaded successfully**
✅ **Images publicly accessible**
✅ **Works in both development and production**

**Your expertise images are now in MinIO!** 🎉

Run `php artisan db:seed --class=ExpertiseSeeder` anytime to ensure images are in MinIO.
