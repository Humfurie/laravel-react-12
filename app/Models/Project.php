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
        'contributors',
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
                $project->slug = static::generateUniqueSlug($project->title);
            }
        });

        static::updating(function ($project) {
            if ($project->isDirty('title') && empty($project->slug)) {
                $project->slug = static::generateUniqueSlug($project->title, $project->id);
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

    public function getContributorsAttribute(): array
    {
        $contributors = $this->metrics['contributors'] ?? [];

        if (empty($contributors)) {
            return [];
        }

        // Get all GitHub usernames from contributors
        $githubUsernames = collect($contributors)->pluck('login')->filter()->toArray();

        if (empty($githubUsernames)) {
            return $contributors;
        }

        // Find matching local users
        $localUsers = User::whereIn('github_username', $githubUsernames)
            ->get()
            ->keyBy('github_username');

        // Enrich contributors with local user data
        return collect($contributors)->map(function ($contributor) use ($localUsers) {
            $localUser = $localUsers->get($contributor['login'] ?? null);

            return array_merge($contributor, [
                'is_local_user' => $localUser !== null,
                'local_user_id' => $localUser?->id,
                'local_user_name' => $localUser?->name,
                'local_user_username' => $localUser?->username,
            ]);
        })->toArray();
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
