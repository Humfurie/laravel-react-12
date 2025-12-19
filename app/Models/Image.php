<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Image extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'path',
        'filename',
        'mime_type',
        'size',
        'order',
        'is_primary',
        'sizes',
    ];

    protected $casts = [
        'sizes' => 'array',
        'is_primary' => 'boolean',
        'order' => 'integer',
        'size' => 'integer',
    ];

    protected $appends = [
        'url',
        'thumbnail_urls',
    ];

    /**
     * Polymorphic relationship to the parent model
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the full URL of the original image
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk(config('filesystems.default'))->url($this->path);
    }

    /**
     * Get all thumbnail URLs for different sizes
     */
    public function getThumbnailUrlsAttribute(): array
    {
        if (!$this->sizes) {
            return [];
        }

        $urls = [];
        foreach ($this->sizes as $size => $path) {
            $urls[$size] = Storage::disk(config('filesystems.default'))->url($path);
        }

        return $urls;
    }

    /**
     * Get a specific thumbnail size URL
     */
    public function getThumbnailUrl(string $size = 'medium'): ?string
    {
        if (!$this->sizes || !isset($this->sizes[$size])) {
            return null;
        }

        return Storage::disk(config('filesystems.default'))->url($this->sizes[$size]);
    }

    /**
     * Get formatted file size
     */
    public function getFormattedSizeAttribute(): ?string
    {
        if (!$this->size) {
            return null;
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = $this->size;
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Scope to get images ordered by their order column
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('created_at', 'asc');
    }

    /**
     * Scope to get only primary images
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Set this image as primary (and unset others for the same imageable)
     */
    public function setPrimary(): void
    {
        // Unset all other primary images for this imageable
        static::where('imageable_type', $this->imageable_type)
            ->where('imageable_id', $this->imageable_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        // Set this one as primary
        $this->update(['is_primary' => true]);
    }

    /**
     * Delete image files from storage
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($image) {
            $disk = Storage::disk(config('filesystems.default'));

            // Delete the main image file from storage
            if ($disk->exists($image->path)) {
                $disk->delete($image->path);
            }

            // Delete all thumbnail files
            if ($image->sizes) {
                foreach ($image->sizes as $path) {
                    if ($disk->exists($path)) {
                        $disk->delete($path);
                    }
                }
            }
        });
    }
}
