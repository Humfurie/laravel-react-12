<?php

namespace App\Services;

use App\Models\Blog;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class HomepageCacheService
{
    /**
     * Get homepage blog data without caching.
     *
     * @return array{primary: \Illuminate\Support\Collection, latest: \Illuminate\Database\Eloquent\Collection, stats: array{total_posts: int, total_views: int, featured_count: int}}
     */
    public function getBlogsData(): array
    {
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

    /**
     * Get homepage project data without caching.
     *
     * @return array{featured: \Illuminate\Database\Eloquent\Collection, stats: array{total_projects: int, live_projects: int}}
     */
    public function getProjectsData(): array
    {
        $featured = Project::query()
            ->public()
            ->with(['primaryImage'])
            ->orderByDesc('is_featured')
            ->orderBy('featured_at', 'desc')
            ->orderBy('sort_order')
            ->take(config('cache-ttl.homepage.projects_limit', 6))
            ->get();

        $stats = Project::query()
            ->where('is_public', true)
            ->selectRaw('COUNT(*) as total_projects')
            ->selectRaw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as live_projects', ['live'])
            ->first();

        return [
            'featured' => $featured,
            'stats' => [
                'total_projects' => (int) $stats->total_projects,
                'live_projects' => (int) $stats->live_projects,
            ],
        ];
    }

    /**
     * Get homepage experiences data without caching.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getExperiencesData()
    {
        return Experience::with('image')
            ->where('user_id', config('app.admin_user_id'))
            ->ordered()
            ->get();
    }

    /**
     * Get homepage expertises data without caching.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getExpertisesData()
    {
        return Expertise::active()
            ->ordered()
            ->get();
    }

    /**
     * Get admin user profile data without caching.
     *
     * @throws RuntimeException
     */
    public function getUserProfileData(): User
    {
        $adminId = config('app.admin_user_id');
        $user = User::find($adminId);

        if (! $user) {
            throw new RuntimeException(
                "Admin user with ID {$adminId} not found. Check app.admin_user_id configuration."
            );
        }

        return $user;
    }
}
