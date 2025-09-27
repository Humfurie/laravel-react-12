<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Blog;
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
        $primaryBlogs = Blog::published()
            ->where('isPrimary', true)
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get();

        $latestBlogs = Blog::published()
            ->orderBy('published_at', 'desc')
            ->limit(6)
            ->get();

        // Get total counts and stats
        $totalPosts = Blog::published()->count();
        $totalViews = (int) Blog::published()->sum('view_count');
        $featuredCount = Blog::published()->where('isPrimary', true)->count();

        return [
            'primary' => $primaryBlogs,
            'latest' => $latestBlogs,
            'stats' => [
                'total_posts' => $totalPosts,
                'total_views' => $totalViews,
                'featured_count' => $featuredCount
            ]
        ];
    }
}
