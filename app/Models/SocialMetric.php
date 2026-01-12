<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Social Metric Model
 *
 * Stores analytics data for social media posts and accounts.
 * Metrics are fetched periodically from platform APIs for tracking performance over time.
 *
 * @property int $id
 * @property int|null $social_post_id
 * @property int|null $social_account_id
 * @property string $metric_type
 * @property Carbon $date
 * @property int $views
 * @property int $likes
 * @property int $comments
 * @property int $shares
 * @property int $saves
 * @property int $impressions
 * @property int $reach
 * @property float|null $engagement_rate
 * @property int $watch_time
 * @property array|null $demographics
 * @property array|null $metadata
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class SocialMetric extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'social_post_id',
        'social_account_id',
        'metric_type',
        'date',
        'views',
        'likes',
        'comments',
        'shares',
        'saves',
        'impressions',
        'reach',
        'engagement_rate',
        'watch_time',
        'demographics',
        'metadata',
    ];

    /**
     * Get the post these metrics belong to.
     */
    public function socialPost(): BelongsTo
    {
        return $this->belongsTo(SocialPost::class);
    }

    /**
     * Get the account these metrics belong to.
     */
    public function socialAccount(): BelongsTo
    {
        return $this->belongsTo(SocialAccount::class);
    }

    /**
     * Scope to filter post performance metrics.
     */
    public function scopePostPerformance($query)
    {
        return $query->where('metric_type', 'post_performance');
    }

    /**
     * Scope to filter account analytics metrics.
     */
    public function scopeAccountAnalytics($query)
    {
        return $query->where('metric_type', 'account_analytics');
    }

    /**
     * Scope to filter audience insights metrics.
     */
    public function scopeAudienceInsights($query)
    {
        return $query->where('metric_type', 'audience_insights');
    }

    /**
     * Scope to get metrics within a date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Calculate total engagement (likes + comments + shares).
     */
    public function getTotalEngagementAttribute(): int
    {
        return $this->likes + $this->comments + $this->shares;
    }

    /**
     * Calculate engagement rate if not already set.
     */
    public function calculateEngagementRate(): float
    {
        if ($this->reach === 0) {
            return 0.0;
        }

        return round(($this->total_engagement / $this->reach) * 100, 2);
    }

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'demographics' => 'array',
            'metadata' => 'array',
            'engagement_rate' => 'decimal:2',
            'views' => 'integer',
            'likes' => 'integer',
            'comments' => 'integer',
            'shares' => 'integer',
            'saves' => 'integer',
            'impressions' => 'integer',
            'reach' => 'integer',
            'watch_time' => 'integer',
        ];
    }
}
