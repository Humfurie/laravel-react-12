<?php

namespace App\Http\Controllers;

use App\Jobs\IncrementViewCount;
use App\Models\Blog;
use App\Models\BlogView;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::published()
            ->orderBy('published_at', 'desc')
            ->orderBy('sort_order', 'asc')
            ->paginate(12);

        return Inertia::render('user/blog', [
            'blogs' => $blogs,
        ]);
    }

    public function show(Blog $blog)
    {
        // Only show published blogs to public
        if (! $blog->isPublished()) {
            abort(404);
        }

        // Increment total view count asynchronously (non-blocking)
        IncrementViewCount::dispatch('Blog', $blog->id);

        // Record daily view for trending calculation
        BlogView::recordView($blog->id);

        return Inertia::render('user/blog-post', [
            'blog' => $blog,
        ]);
    }

    public function getPrimaryAndLatest()
    {
        return Cache::remember(
            config('cache-ttl.keys.homepage_blogs'),
            config('cache-ttl.homepage.blogs'),
            function () {
                // Get featured blogs (manual featured + auto by views)
                $featuredBlogs = Blog::getFeaturedBlogs(3);

                // Get latest blogs
                $latestBlogs = Blog::published()
                    ->orderBy('published_at', 'desc')
                    ->limit(6)
                    ->get();

                // Get stats
                $grammar = DB::connection()->getQueryGrammar();
                $isPrimaryColumn = $grammar->wrap('isPrimary');

                $stats = Blog::published()
                    ->selectRaw("COUNT(*) as total_posts, SUM(view_count) as total_views, SUM(CASE WHEN {$isPrimaryColumn} = ? THEN 1 ELSE 0 END) as featured_count", [true])
                    ->first();

                // Count manually featured (with valid featured_until)
                $manualFeaturedCount = Blog::published()->manuallyFeatured()->count();

                return [
                    'primary' => $featuredBlogs->values(),
                    'latest' => $latestBlogs,
                    'stats' => [
                        'total_posts' => (int) ($stats->total_posts ?? 0),
                        'total_views' => (int) ($stats->total_views ?? 0),
                        'featured_count' => $manualFeaturedCount,
                    ],
                ];
            }
        );
    }

    /**
     * Get trending blogs based on views in the last 30 days.
     */
    public function getTrending(int $limit = 5)
    {
        $mostViewedIds = BlogView::getMostViewedBlogIds(30, $limit);

        if (empty($mostViewedIds)) {
            return Blog::published()
                ->orderBy('view_count', 'desc')
                ->limit($limit)
                ->get();
        }

        return Blog::published()
            ->whereIn('id', $mostViewedIds)
            ->get()
            ->sortBy(function ($blog) use ($mostViewedIds) {
                return array_search($blog->id, $mostViewedIds);
            })
            ->values();
    }
}
