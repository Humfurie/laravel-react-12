<?php

namespace App\Console\Commands;

use App\Http\Controllers\BlogController;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\Project;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

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
            'homepage.blogs' => fn () => $this->warmBlogsCache(),
            'homepage.experiences' => fn () => $this->warmExperiencesCache(),
            'homepage.expertises' => fn () => $this->warmExpertisesCache(),
            'homepage.projects' => fn () => $this->warmProjectsCache(),
            'homepage.user_profile' => fn () => $this->warmUserProfileCache(),
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
        Cache::forget('homepage.blogs');
        (new BlogController)->getPrimaryAndLatest();
    }

    private function warmExperiencesCache(): void
    {
        Cache::forget('homepage.experiences');
        Cache::remember('homepage.experiences', 3600, function () {
            return Experience::with('image')
                ->where('user_id', 1)
                ->ordered()
                ->get();
        });
    }

    private function warmExpertisesCache(): void
    {
        Cache::forget('homepage.expertises');
        Cache::remember('homepage.expertises', 3600, function () {
            return Expertise::active()
                ->ordered()
                ->get();
        });
    }

    private function warmProjectsCache(): void
    {
        Cache::forget('homepage.projects');
        Cache::remember('homepage.projects', 1800, function () {
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

            return [
                'featured' => $featured,
                'stats' => [
                    'total_projects' => (int) $stats->total_projects,
                    'live_projects' => (int) $stats->live_projects,
                ],
            ];
        });
    }

    private function warmUserProfileCache(): void
    {
        Cache::forget('homepage.user_profile');
        Cache::remember('homepage.user_profile', 3600, function () {
            return User::where('email', 'humfurie@gmail.com')->first()
                ?? User::first();
        });
    }
}
