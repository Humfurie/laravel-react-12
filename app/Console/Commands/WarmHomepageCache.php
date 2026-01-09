<?php

namespace App\Console\Commands;

use App\Http\Controllers\BlogController;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\Project;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

class WarmHomepageCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm-homepage {--force : Force refresh even if cache exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up homepage caches to prevent cold cache slowdowns';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Warming homepage caches...');
        $force = $this->option('force');

        $caches = [
            config('cache-ttl.keys.homepage_blogs') => fn() => $this->warmBlogsCache(),
            config('cache-ttl.keys.homepage_experiences') => fn() => $this->warmExperiencesCache(),
            config('cache-ttl.keys.homepage_expertises') => fn() => $this->warmExpertisesCache(),
            config('cache-ttl.keys.homepage_projects') => fn() => $this->warmProjectsCache(),
            config('cache-ttl.keys.homepage_user_profile') => fn() => $this->warmUserProfileCache(),
        ];

        foreach ($caches as $key => $warmer) {
            if ($force || ! Cache::has($key)) {
                $start = microtime(true);
                $warmer();
                $duration = round((microtime(true) - $start) * 1000);
                $this->line("  <info>✓</info> {$key} <comment>({$duration}ms)</comment>");
            } else {
                $this->line("  <comment>⊘</comment> {$key} <comment>(already cached)</comment>");
            }
        }

        $this->newLine();
        $this->info('Homepage caches warmed successfully!');

        return Command::SUCCESS;
    }

    private function warmBlogsCache(): void
    {
        $data = app(BlogController::class)->getPrimaryAndLatest();

        Cache::put(
            config('cache-ttl.keys.homepage_blogs'),
            $data,
            config('cache-ttl.homepage.blogs')
        );
    }

    private function warmExperiencesCache(): void
    {
        $data = Experience::with('image')
            ->where('user_id', config('app.admin_user_id'))
            ->ordered()
            ->get();

        Cache::put(
            config('cache-ttl.keys.homepage_experiences'),
            $data,
            config('cache-ttl.homepage.experiences')
        );
    }

    private function warmExpertisesCache(): void
    {
        $data = Expertise::active()
            ->ordered()
            ->get();

        Cache::put(
            config('cache-ttl.keys.homepage_expertises'),
            $data,
            config('cache-ttl.homepage.expertises')
        );
    }

    private function warmProjectsCache(): void
    {
        $featured = Project::query()
            ->public()
            ->with(['primaryImage'])
            ->orderByDesc('is_featured')
            ->orderBy('featured_at', 'desc')
            ->orderBy('sort_order')
            ->take(6)
            ->get();

        $stats = Project::query()
            ->where('is_public', true)
            ->selectRaw('COUNT(*) as total_projects')
            ->selectRaw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as live_projects', ['live'])
            ->first();

        $data = [
            'featured' => $featured,
            'stats' => [
                'total_projects' => (int)$stats->total_projects,
                'live_projects' => (int)$stats->live_projects,
            ],
        ];

        Cache::put(
            config('cache-ttl.keys.homepage_projects'),
            $data,
            config('cache-ttl.homepage.projects')
        );
    }

    private function warmUserProfileCache(): void
    {
        $adminId = config('app.admin_user_id');
        $user = User::find($adminId);

        if (!$user) {
            throw new RuntimeException(
                "Admin user with ID {$adminId} not found. Check app.admin_user_id configuration."
            );
        }

        Cache::put(
            config('cache-ttl.keys.homepage_user_profile'),
            $user,
            config('cache-ttl.homepage.user_profile')
        );
    }
}
