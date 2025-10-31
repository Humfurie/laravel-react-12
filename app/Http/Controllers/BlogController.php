<?php

namespace App\Http\Controllers;

use App\Models\Blog;
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
            'blogs' => $blogs
        ]);
    }

    public function show(Blog $blog)
    {
        // Only show published blogs to public
        if (!$blog->isPublished()) {
            abort(404);
        }

        // Increment view count
        $blog->increment('view_count');

        return Inertia::render('user/blog-post', [
            'blog' => $blog->fresh() // Get fresh instance with updated view count
        ]);
    }

    public function getPrimaryAndLatest()
    {
        // Cache homepage blog data for 10 minutes
        return Cache::remember('homepage.blogs', 600, function () {
            // Single optimized query to get all published blogs we need
            $blogs = Blog::published()
                ->orderBy('published_at', 'desc')
                ->limit(6)
                ->get();

            // Separate primary and latest from the same collection
            $primaryBlogs = $blogs->where('isPrimary', true)->take(3)->values();
            $latestBlogs = $blogs->take(6)->values();

            // Get stats in a single query using aggregates
            // Use database grammar to properly quote column name for cross-database compatibility
            $grammar = DB::connection()->getQueryGrammar();
            $isPrimaryColumn = $grammar->wrap('isPrimary');

            $stats = Blog::published()
                ->selectRaw("COUNT(*) as total_posts, SUM(view_count) as total_views, SUM(CASE WHEN {$isPrimaryColumn} = ? THEN 1 ELSE 0 END) as featured_count", [true])
                ->first();

            return [
                'primary' => $primaryBlogs,
                'latest' => $latestBlogs,
                'stats' => [
                    'total_posts' => $stats->total_posts ?? 0,
                    'total_views' => (int)($stats->total_views ?? 0),
                    'featured_count' => $stats->featured_count ?? 0,
                ]
            ];
        });
    }
}
