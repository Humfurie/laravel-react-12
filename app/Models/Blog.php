<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property mixed $isPrimary
 * @property string $title
 * @property string $slug
 * @property string $content
 * @property string|null $excerpt
 * @property string $status
 * @property string|null $featured_image
 * @property array|null $meta_data
 * @property int $sort_order
 * @property Carbon|null $published_at
 */
class Blog extends Model
{
    /** @use HasFactory<\Database\Factories\BlogFactory> */
    use HasFactory, SoftDeletes;

    const STATUS_DRAFT = 'draft';
    const STATUS_PUBLISHED = 'published';
    const STATUS_PRIVATE = 'private';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'status',
        'featured_image',
        'meta_data',
        'tags',
        'isPrimary',
        'sort_order',
        'view_count',
        'published_at',
    ];

    protected $casts = [
        'meta_data' => 'array',
        'tags' => 'array',
        'isPrimary' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected $appends = [
        'status_label',
        'display_image',
        'image_url',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the blog's image (polymorphic relationship).
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }

    /**
     * Get the image URL attribute.
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->image?->url;
    }

    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED)
                    ->where('published_at', '<=', now());
    }

    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED &&
               $this->published_at &&
               $this->published_at->isPast();
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function getExcerptAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        // Generate excerpt from content if not provided
        $plainText = strip_tags($this->content);
        return str($plainText)->limit(160);
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PUBLISHED => 'Published',
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_PRIVATE => 'Private',
            default => 'Unknown'
        };
    }

    public function getDisplayImageAttribute(): string|null
    {
        // First priority: polymorphic image relationship (MinIO)
        if ($this->image?->url) {
            return $this->image->url;
        }

        // Second priority: featured_image field (legacy)
        if ($this->featured_image) {
            return $this->featured_image;
        }

        // Third priority: Extract first image from content
        if ($this->content) {
            // Try multiple regex patterns to handle various HTML formats
            $patterns = [
                '/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i',  // Standard format
                '/<img[^>]+src=([^"\'\s>]+)[^>]*>/i',        // No quotes
                '/<img[^>]*src=["\']?([^"\'\s>]+)/i'          // Malformed/incomplete
            ];

            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $this->content, $matches) && !empty($matches[1])) {
                    return $matches[1];
                }
            }
        }

        // Return null if no image found
        return null;
    }
}
