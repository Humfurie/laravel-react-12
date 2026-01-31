<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Deployment extends Model
{
    use HasFactory, SoftDeletes;

    // Status Constants
    const STATUS_ACTIVE = 'active';

    const STATUS_MAINTENANCE = 'maintenance';

    const STATUS_ARCHIVED = 'archived';

    // Client Type Constants
    const CLIENT_TYPE_FAMILY = 'family';

    const CLIENT_TYPE_FRIEND = 'friend';

    const CLIENT_TYPE_BUSINESS = 'business';

    const CLIENT_TYPE_PERSONAL = 'personal';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'client_name',
        'client_type',
        'industry',
        'tech_stack',
        'challenges_solved',
        'live_url',
        'demo_url',
        'project_id',
        'is_featured',
        'is_public',
        'deployed_at',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'challenges_solved' => 'array',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
        'deployed_at' => 'date',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'status_label',
        'client_type_label',
        'thumbnail_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($deployment) {
            if (empty($deployment->slug)) {
                $deployment->slug = static::generateUniqueSlug($deployment->title);
            }
        });

        static::updating(function ($deployment) {
            // Regenerate slug when title changes, unless slug was manually edited
            if ($deployment->isDirty('title') && ! $deployment->isDirty('slug')) {
                $deployment->slug = static::generateUniqueSlug($deployment->title, $deployment->id);
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

    // Relationships

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function primaryImage(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable')->where('is_primary', true);
    }

    // Accessors

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_MAINTENANCE => 'Under Maintenance',
            self::STATUS_ARCHIVED => 'Archived',
            default => 'Unknown'
        };
    }

    public function getClientTypeLabelAttribute(): string
    {
        return match ($this->client_type) {
            self::CLIENT_TYPE_FAMILY => 'Family',
            self::CLIENT_TYPE_FRIEND => 'Friend',
            self::CLIENT_TYPE_BUSINESS => 'Business',
            self::CLIENT_TYPE_PERSONAL => 'Personal',
            default => 'Unknown'
        };
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        // Only access if eager loaded to prevent N+1 queries
        if (! $this->relationLoaded('primaryImage')) {
            return null;
        }

        $primaryImage = $this->primaryImage;
        if ($primaryImage) {
            return $primaryImage->getThumbnailUrl('medium') ?? $primaryImage->url;
        }

        return null;
    }

    // Scopes

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('deployed_at', 'desc');
    }

    // Static helpers

    public static function getStatuses(): array
    {
        return [
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_MAINTENANCE => 'Under Maintenance',
            self::STATUS_ARCHIVED => 'Archived',
        ];
    }

    public static function getClientTypes(): array
    {
        return [
            self::CLIENT_TYPE_FAMILY => 'Family',
            self::CLIENT_TYPE_FRIEND => 'Friend',
            self::CLIENT_TYPE_BUSINESS => 'Business',
            self::CLIENT_TYPE_PERSONAL => 'Personal',
        ];
    }

    // Helper methods

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}
