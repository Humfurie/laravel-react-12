<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Social Post Publication Model
 *
 * Pivot/junction model that tracks a post's publication to a specific platform.
 * Enables crossposting: one post content can be published to multiple platforms.
 *
 * Example:
 * - Post #1 "iPhone Review" has content (video, title, description)
 * - Publication #1: Post #1 → YouTube (status: published)
 * - Publication #2: Post #1 → Facebook (status: processing)
 * - Publication #3: Post #1 → TikTok (status: failed)
 *
 * @property int $id
 * @property int $social_post_id
 * @property int $social_account_id
 * @property string|null $platform_post_id
 * @property string|null $video_url
 * @property string|null $thumbnail_url
 * @property string $status
 * @property Carbon|null $scheduled_at
 * @property Carbon|null $published_at
 * @property string|null $error_message
 * @property array|null $metadata
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class SocialPostPublication extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'social_post_id',
        'social_account_id',
        'platform_post_id',
        'video_url',
        'thumbnail_url',
        'status',
        'scheduled_at',
        'published_at',
        'error_message',
        'metadata',
    ];

    /**
     * Get the post that this publication belongs to.
     */
    public function socialPost(): BelongsTo
    {
        return $this->belongsTo(SocialPost::class);
    }

    /**
     * Get the social account this is published to.
     */
    public function socialAccount(): BelongsTo
    {
        return $this->belongsTo(SocialAccount::class);
    }

    /**
     * Get all metrics for this specific publication.
     */
    public function socialMetrics(): HasMany
    {
        return $this->hasMany(SocialMetric::class, 'social_post_id', 'id');
    }

    /**
     * Scope to get publications by status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get published publications.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope to get scheduled publications.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope to get failed publications.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Mark this publication as published.
     */
    public function markAsPublished(string $platformPostId, ?string $videoUrl = null): void
    {
        $this->update([
            'status' => 'published',
            'platform_post_id' => $platformPostId,
            'video_url' => $videoUrl,
            'published_at' => now(),
            'error_message' => null,
        ]);
    }

    /**
     * Mark this publication as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }
}
