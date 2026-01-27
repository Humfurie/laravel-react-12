<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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

    // Ownership Type Constants
    const OWNERSHIP_OWNER = 'owner';

    const OWNERSHIP_DEPLOYED = 'deployed';

    const OWNERSHIP_CONTRIBUTOR = 'contributor';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'short_description',
        'category',
        'project_category_id',
        'tech_stack',
        'links',
        'github_repo',
        'demo_url',
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
        'ownership_type',
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
        'author',
    ];

    /**
     * Get categories from database.
     *
     * @return array<string, string>
     */
    public static function getCategories(): array
    {
        return ProjectCategory::getDropdownOptions();
    }

    public function projectCategory(): BelongsTo
    {
        return $this->belongsTo(ProjectCategory::class);
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

    public static function getOwnershipTypes(): array
    {
        return [
            self::OWNERSHIP_OWNER => 'My Project',
            self::OWNERSHIP_DEPLOYED => 'Deployed by Me',
            self::OWNERSHIP_CONTRIBUTOR => 'Contributed To',
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
     * @param  string  $title  The title to generate slug from
     * @param  int|null  $excludeId  ID to exclude from uniqueness check (for updates)
     */
    protected static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while (static::slugExists($slug, $excludeId)) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if a slug already exists in the database.
     *
     * @param  string  $slug  The slug to check
     * @param  int|null  $excludeId  ID to exclude from the check (for updates)
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
        // Use eager-loaded relationship to prevent N+1 queries
        if ($this->relationLoaded('projectCategory') && $this->projectCategory) {
            return $this->projectCategory->name;
        }

        // Fallback to static mapping (no database queries)
        return match ($this->category) {
            self::CATEGORY_WEB_APP => 'Web Application',
            self::CATEGORY_MOBILE_APP => 'Mobile App',
            self::CATEGORY_API => 'API / Backend',
            self::CATEGORY_LIBRARY => 'Library / Package',
            self::CATEGORY_CLI => 'CLI Tool',
            self::CATEGORY_DESIGN => 'Design System',
            default => $this->category ?? 'Uncategorized'
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

    public function getAuthorAttribute(): ?array
    {
        if ($this->ownership_type === self::OWNERSHIP_OWNER) {
            return null;
        }

        $contributors = $this->metrics['contributors'] ?? [];
        if (empty($contributors)) {
            return null;
        }

        $ownerUsername = User::find(config('app.admin_user_id'))?->github_username;

        // Find top contributor who isn't the site owner
        foreach ($contributors as $contributor) {
            if (($contributor['login'] ?? null) !== $ownerUsername) {
                return [
                    'login' => $contributor['login'] ?? null,
                    'avatar_url' => $contributor['avatar_url'] ?? null,
                    'contributions' => $contributor['contributions'] ?? 0,
                ];
            }
        }

        // If all contributors are the owner, return first one
        return [
            'login' => $contributors[0]['login'] ?? null,
            'avatar_url' => $contributors[0]['avatar_url'] ?? null,
            'contributions' => $contributors[0]['contributions'] ?? 0,
        ];
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

    public function scopeOwned($query)
    {
        return $query->where('ownership_type', self::OWNERSHIP_OWNER);
    }

    public function scopeDeployed($query)
    {
        return $query->where('ownership_type', self::OWNERSHIP_DEPLOYED);
    }

    public function scopeContributed($query)
    {
        return $query->where('ownership_type', self::OWNERSHIP_CONTRIBUTOR);
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
