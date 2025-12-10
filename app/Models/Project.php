<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    // Status Constants
    const STATUS_LIVE = 'live';
    const STATUS_ARCHIVED = 'archived';
    const STATUS_MAINTENANCE = 'maintenance';
    const STATUS_DEVELOPMENT = 'development';

    // Category Constants
    const CATEGORY_WEB_APP = 'web_app';
    const CATEGORY_MOBILE_APP = 'mobile_app';
    const CATEGORY_API = 'api';
    const CATEGORY_LIBRARY = 'library';
    const CATEGORY_CLI = 'cli';
    const CATEGORY_DESIGN = 'design';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'short_description',
        'category',
        'tech_stack',
        'links',
        'github_repo',
        'status',
        'is_featured',
        'is_public',
        'metrics',
        'metrics_synced_at',
        'case_study',
        'testimonials',
        'started_at',
        'completed_at',
        'featured_at',
        'sort_order',
        'view_count',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'links' => 'array',
        'metrics' => 'array',
        'testimonials' => 'array',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
        'started_at' => 'date',
        'completed_at' => 'date',
        'featured_at' => 'datetime',
        'metrics_synced_at' => 'datetime',
        'sort_order' => 'integer',
        'view_count' => 'integer',
    ];

    protected $appends = [
        'status_label',
        'category_label',
        'thumbnail_url',
    ];

    public static function getCategories(): array
    {
        return [
            self::CATEGORY_WEB_APP => 'Web Application',
            self::CATEGORY_MOBILE_APP => 'Mobile App',
            self::CATEGORY_API => 'API / Backend',
            self::CATEGORY_LIBRARY => 'Library / Package',
            self::CATEGORY_CLI => 'CLI Tool',
            self::CATEGORY_DESIGN => 'Design System',
        ];
    }

    public static function getStatuses(): array
    {
        return [
            self::STATUS_LIVE => 'Live',
            self::STATUS_DEVELOPMENT => 'In Development',
            self::STATUS_MAINTENANCE => 'Under Maintenance',
            self::STATUS_ARCHIVED => 'Archived',
        ];
    }

    // Relationships

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = Str::slug($project->title);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // Accessors

    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function primaryImage(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable')->where('is_primary', true);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_LIVE => 'Live',
            self::STATUS_ARCHIVED => 'Archived',
            self::STATUS_MAINTENANCE => 'Under Maintenance',
            self::STATUS_DEVELOPMENT => 'In Development',
            default => 'Unknown'
        };
    }

    public function getCategoryLabelAttribute(): string
    {
        return match ($this->category) {
            self::CATEGORY_WEB_APP => 'Web Application',
            self::CATEGORY_MOBILE_APP => 'Mobile App',
            self::CATEGORY_API => 'API / Backend',
            self::CATEGORY_LIBRARY => 'Library / Package',
            self::CATEGORY_CLI => 'CLI Tool',
            self::CATEGORY_DESIGN => 'Design System',
            default => $this->category
        };
    }

    // Scopes

    public function getThumbnailUrlAttribute(): ?string
    {
        $primaryImage = $this->primaryImage;
        if ($primaryImage) {
            return $primaryImage->getThumbnailUrl('medium') ?? $primaryImage->url;
        }

        return null;
    }

    public function getShortDescriptionAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        $plainText = strip_tags($this->description ?? '');

        return Str::limit($plainText, 150);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeLive($query)
    {
        return $query->where('status', self::STATUS_LIVE);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    // Helper methods

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    // Static helpers

    public function isLive(): bool
    {
        return $this->status === self::STATUS_LIVE;
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }
}
