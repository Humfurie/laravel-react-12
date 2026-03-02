<?php

namespace App\Http\Controllers;

use App\Jobs\IncrementViewCount;
use App\Models\Blog;
use App\Models\BlogView;
use App\Services\HomepageCacheService;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        $category = request()->query('category', 'portfolio');

        $query = Blog::published()
            ->orderBy('published_at', 'desc')
            ->orderBy('sort_order', 'asc');

        if (in_array($category, ['portfolio', 'personal'])) {
            $query->whereJsonContains('tags', $category);
        }

        $blogs = $query->paginate(12)->withQueryString();

        return Inertia::render('user/blog', [
            'blogs' => $blogs,
            'category' => $category,
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
        return app(HomepageCacheService::class)->getCachedBlogsData();
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
