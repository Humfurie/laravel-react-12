<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Social Post Model
 *
 * Represents social media post content that can be published to multiple platforms (crossposting).
 * The post stores the content (title, description, video), while publications track
 * platform-specific statuses, IDs, and metrics.
 *
 * @property int $id
 * @property int $user_id
 * @property string|null $title
 * @property string|null $description
 * @property array|null $hashtags
 * @property string|null $video_path
 * @property string|null $thumbnail_path
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 */
class SocialPost extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'hashtags',
        'video_path',
        'thumbnail_path',
    ];

    /**
     * Get the user who created this post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all social accounts this post is published to (through publications).
     *
     * Many-to-many relationship through the publications pivot table.
     */
    public function socialAccounts(): BelongsToMany
    {
        return $this->belongsToMany(SocialAccount::class, 'social_post_publications')
            ->withPivot(['platform_post_id', 'video_url', 'status', 'scheduled_at', 'published_at', 'error_message', 'metadata'])
            ->withTimestamps();
    }

    /**
     * @deprecated Use publications() instead. Kept for backward compatibility with seeded data.
     * Get the first social account (for backward compatibility).
     */
    public function socialAccount()
    {
        return $this->publications()->first()?->socialAccount;
    }

    /**
     * Get all publications for this post (one per platform).
     *
     * Enables crossposting: one post can be published to YouTube, Facebook, Instagram, etc.
     */
    public function publications(): HasMany
    {
        return $this->hasMany(SocialPostPublication::class);
    }

    /**
     * Get all metrics for this post (across all publications).
     */
    public function socialMetrics(): HasMany
    {
        return $this->hasMany(SocialMetric::class);
    }

    /**
     * Get all images (thumbnails) associated with this post.
     * Uses the existing polymorphic Image model.
     */
    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    /**
     * Helper to check if ALL publications are published.
     */
    public function isFullyPublished(): bool
    {
        return $this->publications()->where('status', '!=', 'published')->count() === 0
            && $this->publications()->count() > 0;
    }

    /**
     * Helper to check if ANY publication is published.
     */
    public function hasAnyPublished(): bool
    {
        return $this->publications()->where('status', 'published')->exists();
    }

    /**
     * Helper to check if ANY publication is scheduled.
     */
    public function hasAnyScheduled(): bool
    {
        return $this->publications()->where('status', 'scheduled')->exists();
    }

    /**
     * Helper to check if ANY publication failed.
     */
    public function hasAnyFailed(): bool
    {
        return $this->publications()->where('status', 'failed')->exists();
    }

    /**
     * Get the overall status based on publications.
     * Returns: 'published', 'partial', 'scheduled', 'failed', 'draft'
     */
    public function getOverallStatus(): string
    {
        $publicationsCount = $this->publications()->count();

        if ($publicationsCount === 0) {
            return 'draft';
        }

        $publishedCount = $this->publications()->where('status', 'published')->count();
        $failedCount = $this->publications()->where('status', 'failed')->count();
        $scheduledCount = $this->publications()->where('status', 'scheduled')->count();

        if ($publishedCount === $publicationsCount) {
            return 'published';
        }

        if ($failedCount === $publicationsCount) {
            return 'failed';
        }

        if ($scheduledCount > 0) {
            return 'scheduled';
        }

        if ($publishedCount > 0) {
            return 'partial'; // Some published, some not
        }

        return 'draft';
    }

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'hashtags' => 'array',
        ];
    }
}
