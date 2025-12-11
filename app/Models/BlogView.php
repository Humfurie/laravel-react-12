<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogView extends Model
{
    protected $fillable = [
        'blog_id',
        'view_date',
        'view_count',
    ];

    protected $casts = [
        'view_date' => 'date',
    ];

    /**
     * Record a view for a blog post (increment daily counter).
     */
    public static function recordView(int $blogId): void
    {
        $today = now()->toDateString();

        $view = static::firstOrCreate(
            ['blog_id' => $blogId, 'view_date' => $today],
            ['view_count' => 0]
        );

        $view->increment('view_count');
    }

    /**
     * Get total views for a blog in the last N days.
     */
    public static function getViewsInLastDays(int $blogId, int $days = 30): int
    {
        return static::where('blog_id', $blogId)
            ->where('view_date', '>=', now()->subDays($days)->toDateString())
            ->sum('view_count');
    }

    /**
     * Get blog IDs sorted by views in the last N days.
     */
    public static function getMostViewedBlogIds(int $days = 30, int $limit = 10): array
    {
        return static::select('blog_id')
            ->selectRaw('SUM(view_count) as total_views')
            ->where('view_date', '>=', now()->subDays($days)->toDateString())
            ->groupBy('blog_id')
            ->orderByDesc('total_views')
            ->limit($limit)
            ->pluck('blog_id')
            ->toArray();
    }

    /**
     * Get the blog that owns this view record.
     */
    public function blog(): BelongsTo
    {
        return $this->belongsTo(Blog::class);
    }
}
