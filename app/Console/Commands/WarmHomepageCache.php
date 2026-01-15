<?php

namespace App\Console\Commands;

use App\Services\HomepageCacheService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

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
        Log::info('Starting homepage cache warming', ['force' => $this->option('force')]);

        $force = $this->option('force');
        $successCount = 0;
        $failureCount = 0;

        $caches = [
            config('cache-ttl.keys.homepage_blogs') => fn () => $this->warmBlogsCache(),
            config('cache-ttl.keys.homepage_experiences') => fn () => $this->warmExperiencesCache(),
            config('cache-ttl.keys.homepage_expertises') => fn () => $this->warmExpertisesCache(),
            config('cache-ttl.keys.homepage_projects') => fn () => $this->warmProjectsCache(),
            config('cache-ttl.keys.homepage_user_profile') => fn () => $this->warmUserProfileCache(),
        ];

        foreach ($caches as $key => $warmer) {
            if ($force || ! Cache::has($key)) {
                $start = microtime(true);

                try {
                    $warmer();
                    $duration = round((microtime(true) - $start) * 1000);
                    $this->line("  <info>✓</info> {$key} <comment>({$duration}ms)</comment>");
                    Log::debug("Cache warmed: {$key}", ['duration_ms' => $duration]);
                    $successCount++;
                } catch (Throwable $e) {
                    $duration = round((microtime(true) - $start) * 1000);
                    $this->line("  <error>✗</error> {$key} <error>({$e->getMessage()})</error>");
                    Log::error("Cache warming failed: {$key}", [
                        'duration_ms' => $duration,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    $failureCount++;
                }
            } else {
                $this->line("  <comment>⊘</comment> {$key} <comment>(already cached)</comment>");
                Log::debug("Cache already exists: {$key}");
            }
        }

        $this->newLine();

        if ($failureCount > 0) {
            $this->warn("Homepage cache warming completed with {$failureCount} failure(s).");
            Log::warning('Homepage cache warming completed with failures', [
                'success_count' => $successCount,
                'failure_count' => $failureCount,
            ]);

            return Command::FAILURE;
        }

        $this->info('Homepage caches warmed successfully!');
        Log::info('Homepage cache warming completed successfully', ['warmed_count' => $successCount]);

        return Command::SUCCESS;
    }

    private function warmBlogsCache(): void
    {
        $service = app(HomepageCacheService::class);

        Cache::put(
            config('cache-ttl.keys.homepage_blogs'),
            $service->getBlogsData(),
            config('cache-ttl.homepage.blogs')
        );
    }

    private function warmExperiencesCache(): void
    {
        $service = app(HomepageCacheService::class);

        Cache::put(
            config('cache-ttl.keys.homepage_experiences'),
            $service->getExperiencesData(),
            config('cache-ttl.homepage.experiences')
        );
    }

    private function warmExpertisesCache(): void
    {
        $service = app(HomepageCacheService::class);

        Cache::put(
            config('cache-ttl.keys.homepage_expertises'),
            $service->getExpertisesData(),
            config('cache-ttl.homepage.expertises')
        );
    }

    private function warmProjectsCache(): void
    {
        $service = app(HomepageCacheService::class);

        Cache::put(
            config('cache-ttl.keys.homepage_projects'),
            $service->getProjectsData(),
            config('cache-ttl.homepage.projects')
        );
    }

    private function warmUserProfileCache(): void
    {
        $service = app(HomepageCacheService::class);

        Cache::put(
            config('cache-ttl.keys.homepage_user_profile'),
            $service->getUserProfileData(),
            config('cache-ttl.homepage.user_profile')
        );
    }
}
