<?php

namespace App\Services;

use App\Models\Blog;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class HomepageCacheService
{
    /**
     * Default lock timeout in seconds.
     */
    private const LOCK_TIMEOUT = 10;

    /**
     * Default lock wait time in seconds.
     */
    private const LOCK_WAIT = 5;

    /**
     * Get cached homepage blogs data with stampede protection.
     *
     * @return array{primary: \Illuminate\Support\Collection, latest: \Illuminate\Database\Eloquent\Collection, stats: array{total_posts: int, total_views: int, featured_count: int}}
     */
    public function getCachedBlogsData(): array
    {
        return $this->rememberWithLock(
            config('cache-ttl.keys.homepage_blogs'),
            config('cache-ttl.homepage.blogs'),
            fn () => $this->getBlogsData()
        );
    }

    /**
     * Get cached homepage projects data with stampede protection.
     *
     * @return array{featured: \Illuminate\Database\Eloquent\Collection, stats: array{total_projects: int, live_projects: int}}
     */
    public function getCachedProjectsData(): array
    {
        return $this->rememberWithLock(
            config('cache-ttl.keys.homepage_projects'),
            config('cache-ttl.homepage.projects'),
            fn () => $this->getProjectsData()
        );
    }

    /**
     * Get cached homepage experiences data with stampede protection.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getCachedExperiencesData()
    {
        return $this->rememberWithLock(
            config('cache-ttl.keys.homepage_experiences'),
            config('cache-ttl.homepage.experiences'),
            fn () => $this->getExperiencesData()
        );
    }

    /**
     * Get cached homepage expertises data with stampede protection.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getCachedExpertisesData()
    {
        return $this->rememberWithLock(
            config('cache-ttl.keys.homepage_expertises'),
            config('cache-ttl.homepage.expertises'),
            fn () => $this->getExpertisesData()
        );
    }

    /**
     * Get cached admin user profile data with stampede protection.
     *
     * @throws RuntimeException
     */
    public function getCachedUserProfileData(): User
    {
        return $this->rememberWithLock(
            config('cache-ttl.keys.homepage_user_profile'),
            config('cache-ttl.homepage.user_profile'),
            fn () => $this->getUserProfileData()
        );
    }

    /**
     * Get cached GitHub stats for the admin user.
     *
     * @return array{total_contributions: int, commits: int, pull_requests: int, issues: int, reviews: int, calendar: array}|null
     */
    public function getCachedGitHubStats(): ?array
    {
        return $this->rememberWithLock(
            config('cache-ttl.keys.homepage_github_stats'),
            config('cache-ttl.homepage.github_stats'),
            fn () => $this->getGitHubStats()
        );
    }

    /**
     * Cache remember with lock to prevent stampede.
     *
     * Uses atomic locking to ensure only one process computes the value
     * when cache expires. Other processes wait for the lock or return
     * stale data if available.
     *
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    private function rememberWithLock(string $key, int $ttl, callable $callback): mixed
    {
        $cached = Cache::get($key);
        if ($cached !== null) {
            return $cached;
        }

        $lock = Cache::lock("{$key}:lock", self::LOCK_TIMEOUT);

        if ($lock->get()) {
            try {
                $cached = Cache::get($key);
                if ($cached !== null) {
                    return $cached;
                }

                $value = $callback();
                Cache::put($key, $value, $ttl);

                return $value;
            } finally {
                $lock->release();
            }
        }

        return Cache::remember($key, $ttl, $callback);
    }

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
            ->with(['primaryImage', 'projectCategory'])
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

    /**
     * Get GitHub stats without caching.
     *
     * @return array{total_contributions: int, commits: int, pull_requests: int, issues: int, reviews: int, calendar: array}|null
     */
    public function getGitHubStats(): ?array
    {
        $user = User::find(config('app.admin_user_id'));
        if (! $user?->github_username) {
            return null;
        }

        return app(GitHubService::class)->getUserContributions($user->github_username);
    }

    /**
     * Get cached GitHub data for multiple projects in a single batch.
     *
     * Uses Cache::many() to fetch all cache keys at once, reducing N lookups to 1.
     *
     * @param  \Illuminate\Support\Collection  $projects
     * @return \Illuminate\Support\Collection Projects with github_data attached
     */
    public function getCachedProjectsWithGitHubData($projects)
    {
        if ($projects->isEmpty()) {
            return $projects;
        }

        $github = app(GitHubService::class);
        $ttl = config('cache-ttl.homepage.project_github');

        // Build cache keys for all projects that have repo URLs
        $projectRepos = $projects->mapWithKeys(function ($project) use ($github) {
            $repoUrl = $project->links['repo_url'] ?? $project->github_repo ?? null;
            $repo = $repoUrl ? $github->extractRepoFromUrl($repoUrl) : null;
            $cacheKey = sprintf(config('cache-ttl.keys.project_github'), $project->id);

            return [$project->id => ['cache_key' => $cacheKey, 'repo' => $repo]];
        });

        // Fetch all cache keys at once
        $cacheKeys = $projectRepos->pluck('cache_key')->toArray();
        $cachedData = Cache::many($cacheKeys);

        // Process each project
        return $projects->map(function ($project) use ($projectRepos, $cachedData, $github, $ttl) {
            $info = $projectRepos[$project->id];
            $cacheKey = $info['cache_key'];
            $repo = $info['repo'];

            // No repo URL - no GitHub data
            if (! $repo) {
                $project->github_data = null;

                return $project;
            }

            // Check if we have cached data
            if ($cachedData[$cacheKey] !== null) {
                $project->github_data = $cachedData[$cacheKey];

                return $project;
            }

            // Cache miss - use lock to prevent concurrent API requests for same repo
            $lock = Cache::lock("fetch_github_{$repo}", 10);

            if ($lock->get()) {
                try {
                    // Double-check cache after acquiring lock
                    $cached = Cache::get($cacheKey);
                    if ($cached !== null) {
                        $project->github_data = $cached;

                        return $project;
                    }

                    $project->github_data = $this->fetchAndCacheProjectGitHubData($cacheKey, $repo, $github, $ttl);
                } finally {
                    $lock->release();
                }
            } else {
                // Another process is fetching - wait briefly and check cache
                usleep(100000); // 100ms
                $project->github_data = Cache::get($cacheKey);
            }

            return $project;
        });
    }

    /**
     * Fetch GitHub data for a project and cache it.
     *
     * Handles rate limiting gracefully by returning null on failure.
     *
     * @return array{contributors: array, commit_count: int, last_commit: string|null}|null
     */
    private function fetchAndCacheProjectGitHubData(string $cacheKey, string $repo, GitHubService $github, int $ttl): ?array
    {
        try {
            $data = [
                'contributors' => $github->getContributors($repo, 5),
                'commit_count' => $github->getCommitCount($repo),
                'last_commit' => $github->getLastCommitDate($repo),
            ];

            Cache::put($cacheKey, $data, $ttl);

            return $data;
        } catch (\Exception $e) {
            // Log the error but don't fail the page load
            \Illuminate\Support\Facades\Log::warning('Failed to fetch GitHub data for project', [
                'repo' => $repo,
                'error' => $e->getMessage(),
            ]);

            // Cache null to prevent repeated failed attempts
            Cache::put($cacheKey, null, 300); // Cache failure for 5 minutes

            return null;
        }
    }

    /**
     * Get cached GitHub data for a single project.
     *
     * @deprecated Use getCachedProjectsWithGitHubData() for batch operations
     *
     * @return array{contributors: array, commit_count: int, last_commit: string|null}|null
     */
    public function getCachedProjectGitHubData(Project $project): ?array
    {
        $repoUrl = $project->links['repo_url'] ?? $project->github_repo ?? null;

        if (! $repoUrl) {
            return null;
        }

        $github = app(GitHubService::class);
        $repo = $github->extractRepoFromUrl($repoUrl);

        if (! $repo) {
            return null;
        }

        $cacheKey = sprintf(config('cache-ttl.keys.project_github'), $project->id);

        // Check cache first
        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            return $cached;
        }

        $ttl = config('cache-ttl.homepage.project_github');

        return $this->fetchAndCacheProjectGitHubData($cacheKey, $repo, $github, $ttl);
    }
}
