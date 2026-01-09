<?php

namespace App\Models;

use Database\Factories\BlogFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

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
 * @property Carbon|null $featured_until
 */
class Blog extends Model
{
    /** @use HasFactory<BlogFactory> */
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
        'featured_until',
        'sort_order',
        'view_count',
        'published_at',
    ];

    protected $casts = [
        'meta_data' => 'array',
        'tags' => 'array',
        'isPrimary' => 'boolean',
        'published_at' => 'datetime',
        'featured_until' => 'datetime',
    ];

    protected $appends = [
        'status_label',
        'display_image',
        'image_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($blog) {
            if (empty($blog->slug)) {
                $blog->slug = static::generateUniqueSlug($blog->title);
            }
        });

        static::updating(function ($blog) {
            if ($blog->isDirty('title') && empty($blog->slug)) {
                $blog->slug = static::generateUniqueSlug($blog->title, $blog->id);
            }
        });
    }

    /**
     * Generate a unique slug from the given title.
     *
     * @param string $title The title to generate slug from
     * @param int|null $excludeId ID to exclude from uniqueness check (for updates)
     */
    protected static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while (static::slugExists($slug, $excludeId)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if a slug already exists in the database.
     *
     * @param string $slug The slug to check
     * @param int|null $excludeId ID to exclude from the check (for updates)
     */
    protected static function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $query = static::where('slug', $slug)->withTrashed();

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

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

    /**
     * Get all comments for this blog post.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Get only approved comments for this blog post.
     */
    public function approvedComments(): MorphMany
    {
        return $this->comments()->where('status', 'approved');
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
        return match ($this->status) {
            self::STATUS_PUBLISHED => 'Published',
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_PRIVATE => 'Private',
            default => 'Unknown'
        };
    }

    public function getDisplayImageAttribute(): ?string
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
                '/<img[^>]*src=["\']?([^"\'\s>]+)/i',          // Malformed/incomplete
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

    /**
     * Get the daily view records for this blog.
     */
    public function dailyViews(): HasMany
    {
        return $this->hasMany(BlogView::class);
    }

    /**
     * Get views in the last N days.
     */
    public function getViewsInLastDays(int $days = 30): int
    {
        return BlogView::getViewsInLastDays($this->id, $days);
    }

    /**
     * Check if this blog is currently manually featured.
     * Returns true if isPrimary is set AND featured_until is either null (forever) or in the future.
     */
    public function isManuallyFeatured(): bool
    {
        if (!$this->isPrimary) {
            return false;
        }

        // If no expiration set, it's featured forever
        if ($this->featured_until === null) {
            return true;
        }

        // Check if featured_until is still in the future
        return $this->featured_until->isFuture();
    }

    /**
     * Scope to get manually featured blogs (isPrimary with valid featured_until).
     */
    public function scopeManuallyFeatured($query)
    {
        return $query->where('isPrimary', true)
            ->where(function ($q) {
                $q->whereNull('featured_until')
                    ->orWhere('featured_until', '>', now());
            });
    }

    /**
     * Get the featured blog - either manually featured or auto-featured by views.
     * Returns the manually featured blog if exists and valid, otherwise the most viewed in last 30 days.
     */
    public static function getFeaturedBlog(): ?self
    {
        // First, try to get a manually featured blog
        $manualFeatured = static::published()
            ->manuallyFeatured()
            ->orderBy('sort_order', 'asc')
            ->first();

        if ($manualFeatured) {
            return $manualFeatured;
        }

        // Fall back to most viewed in last 30 days
        $mostViewedIds = BlogView::getMostViewedBlogIds(30, 1);

        if (empty($mostViewedIds)) {
            // If no views tracked yet, return the most recent post
            return static::published()
                ->orderBy('published_at', 'desc')
                ->first();
        }

        return static::published()
            ->whereIn('id', $mostViewedIds)
            ->first();
    }

    /**
     * Get featured blogs for display (manual featured + top trending).
     */
    public static function getFeaturedBlogs(int $limit = 3): Collection
    {
        // Get manually featured blogs
        $manualFeatured = static::with(['image'])
            ->published()
            ->manuallyFeatured()
            ->orderBy('sort_order', 'asc')
            ->get();

        $remaining = $limit - $manualFeatured->count();

        if ($remaining <= 0) {
            return $manualFeatured->take($limit);
        }

        // Get auto-featured by views (excluding manual featured)
        $excludeIds = $manualFeatured->pluck('id')->toArray();
        $mostViewedIds = BlogView::getMostViewedBlogIds(30, $remaining + 5); // Get extra in case of overlap

        $autoFeatured = static::with(['image'])
            ->published()
            ->whereIn('id', $mostViewedIds)
            ->whereNotIn('id', $excludeIds)
            ->limit($remaining)
            ->get()
            ->sortBy(function ($blog) use ($mostViewedIds) {
                return array_search($blog->id, $mostViewedIds);
            })
            ->values();

        // If still not enough, fill with recent posts
        if ($autoFeatured->count() < $remaining) {
            $stillNeeded = $remaining - $autoFeatured->count();
            $excludeIds = array_merge($excludeIds, $autoFeatured->pluck('id')->toArray());

            $recentPosts = static::with(['image'])
                ->published()
                ->whereNotIn('id', $excludeIds)
                ->orderBy('published_at', 'desc')
                ->limit($stillNeeded)
                ->get();

            $autoFeatured = $autoFeatured->concat($recentPosts);
        }

        return $manualFeatured->concat($autoFeatured)->take($limit);
    }
}
