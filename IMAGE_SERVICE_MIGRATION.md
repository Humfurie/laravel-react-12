# Image Service Migration - COMPLETED ✅

## Overview

The RealEstateController has been **fully refactored** to use the proper `ImageService` with polymorphic Image model
relationships instead of storing JSON arrays in the database.

## What Changed

### ✅ Before (Simple Upload)

- Images stored directly to `storage/app/public/real-estate/{type}s/`
- Only returned a URL string
- **No database records**
- No thumbnails generated
- No image ordering or metadata

### ✨ After (ImageService with Polymorphic Relations)

- Images tracked in `images` table with polymorphic relationships
- Automatic thumbnail generation (small/medium/large)
- Database metadata (name, size, mime_type, order, is_primary)
- Proper file cleanup on deletion (via Image model's boot method)
- Image ordering and primary image management

---

## New Endpoints

### 1. **Upload Image** - `POST /admin/real-estate/upload-image`

Two modes:

- **Temporary upload** (for forms before model creation):
  ```json
  {
    "image": File,
    "type": "project|property|logo"
  }
  ```
  Returns: `{ url, path, temp: true }`

- **Direct attachment** (when model exists):
  ```json
  {
    "image": File,
    "type": "project|property|logo",
    "model_type": "project|property",
    "model_id": 123,
    "is_primary": false
  }
  ```
  Returns: `{ image: {...}, url }`

### 2. **Attach Images** - `POST /admin/real-estate/attach-images`

Attach temporary images to a created model:

```json
{
  "model_type": "project|property",
  "model_id": 123,
  "images": [
    { "url": "...", "is_primary": true },
    { "url": "..." }
  ]
}
```

### 3. **Reorder Images** - `POST /admin/real-estate/reorder-images`

```json
{
  "model_type": "project|property",
  "model_id": 123,
  "images": [
    { "id": 1, "order": 0 },
    { "id": 2, "order": 1 }
  ]
}
```

### 4. **Delete Image** - `DELETE /admin/real-estate/images/{image}`

Deletes image record and all files (original + thumbnails)

### 5. **Set Primary Image** - `PATCH /admin/real-estate/images/{image}/primary`

Sets an image as primary (featured) for its parent model

---

## Model Relationships

Both `Property` and `RealEstateProject` models already have:

```php
public function images(): MorphMany
{
    return $this->morphMany(Image::class, 'imageable');
}
```

### Usage Examples

```php
// Get all images for a project
$project->images;

// Get ordered images
$project->images()->ordered()->get();

// Get primary image
$project->images()->primary()->first();

// Get image with specific thumbnail
$image->getThumbnailUrl('medium'); // 800px
$image->getThumbnailUrl('small');  // 300px
$image->getThumbnailUrl('large');  // 1200px

// Access all thumbnail URLs
$image->thumbnail_urls; // ['small' => '...', 'medium' => '...', 'large' => '...']
```

---

## Storage Structure

### Old Structure

```
storage/app/public/real-estate/
  ├── projects/
  │   └── 1234567890_abc123.jpg
  └── properties/
      └── 1234567890_xyz789.jpg
```

### New Structure

```
storage/app/public/
  ├── project-images/
  │   ├── 1234567890_abc123.jpg (original)
  │   └── thumbs/
  │       ├── small/
  │       │   └── 1234567890_abc123_small.jpg (300px)
  │       ├── medium/
  │       │   └── 1234567890_abc123_medium.jpg (800px)
  │       └── large/
  │           └── 1234567890_abc123_large.jpg (1200px)
  └── property-images/
      └── (same structure)
```

---

## Frontend Integration Notes

### For CREATE forms (before model exists):

1. Upload images temporarily (returns URLs)
2. Store URLs in form state
3. On form submit, create the model first
4. Then call `/attach-images` with the temp URLs and new model ID

### For EDIT forms (model exists):

1. Can upload directly with `model_id` and `model_type`
2. Images automatically attached to model
3. Use `/reorder-images` for drag-and-drop reordering
4. Use `/images/{id}/primary` to set featured image

---

## Benefits

1. ✅ **Database tracking** - Query and filter by images
2. ✅ **Thumbnails** - Optimized loading with multiple sizes
3. ✅ **Polymorphic** - Same image system for projects, properties, developers
4. ✅ **Ordering** - Maintain gallery order in database
5. ✅ **Primary/Featured** - Mark main image per model
6. ✅ **Clean deletion** - Auto-delete files when records deleted
7. ✅ **Metadata** - Track size, type, name, upload date

---

## Database Migration

⚠️ **IMPORTANT**: Run this migration to remove the old JSON `images` columns:

```bash
php artisan migrate
```

This will execute the migration:
`2025_10_14_140548_remove_images_json_columns_from_projects_and_properties.php`

The migration removes:

- `real_estate_projects.images` (JSON column)
- `properties.images` (JSON column)

Images are now stored in the polymorphic `images` table instead.

---

## Controller Changes Summary

### Updated Methods:

1. ✅ `storeProject()` - Now attaches images via relationships, not JSON
2. ✅ `updateProject()` - Ignores images array, uses relationships
3. ✅ `storeProperty()` - Attaches images via relationships
4. ✅ `updateProperty()` - Ignores images array, uses relationships
5. ✅ `uploadImage()` - Supports temp & direct upload modes
6. ✅ Added `attachImages()` - Bulk attach temp images
7. ✅ Added `reorderImages()` - Change image order
8. ✅ Added `deleteImage()` - Delete with cleanup
9. ✅ Added `setPrimaryImage()` - Mark featured images
10. ✅ Added `attachImageToModel()` - Private helper method

---

## Next Steps

### Frontend Updates Needed:

1. Update project/property forms to use new workflow
2. Add drag-and-drop reordering UI
3. Add "Set as Primary" button on images
4. Display thumbnail sizes appropriately
5. Call `/attach-images` after model creation

### Optional Enhancements:

- Add image editing (crop, resize)
- Implement lazy loading for galleries
- Add image compression options
- Support drag-and-drop upload
