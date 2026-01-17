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
     * Cache warming configuration.
     * Maps cache key config path => [service method, ttl config path]
     */
    private const CACHE_CONFIG = [
        'homepage_blogs' => ['getBlogsData', 'homepage.blogs'],
        'homepage_experiences' => ['getExperiencesData', 'homepage.experiences'],
        'homepage_expertises' => ['getExpertisesData', 'homepage.expertises'],
        'homepage_projects' => ['getProjectsData', 'homepage.projects'],
        'homepage_user_profile' => ['getUserProfileData', 'homepage.user_profile'],
    ];

    /**
     * Execute the console command.
     */
    public function handle(HomepageCacheService $service): int
    {
        $this->info('Warming homepage caches...');
        Log::info('Starting homepage cache warming', ['force' => $this->option('force')]);

        $force = $this->option('force');
        $successCount = 0;
        $failureCount = 0;

        foreach (self::CACHE_CONFIG as $keyName => [$method, $ttlPath]) {
            $cacheKey = config("cache-ttl.keys.{$keyName}");
            $ttl = config("cache-ttl.{$ttlPath}");

            if (! $force && Cache::has($cacheKey)) {
                $this->line("  <comment>⊘</comment> {$cacheKey} <comment>(already cached)</comment>");
                Log::debug("Cache already exists: {$cacheKey}");

                continue;
            }

            $start = microtime(true);

            try {
                $data = $service->$method();
                Cache::put($cacheKey, $data, $ttl);

                $duration = round((microtime(true) - $start) * 1000);
                $this->line("  <info>✓</info> {$cacheKey} <comment>({$duration}ms)</comment>");
                Log::debug("Cache warmed: {$cacheKey}", ['duration_ms' => $duration]);
                $successCount++;
            } catch (Throwable $e) {
                $duration = round((microtime(true) - $start) * 1000);
                $this->line("  <error>✗</error> {$cacheKey} <error>({$e->getMessage()})</error>");
                Log::error("Cache warming failed: {$cacheKey}", [
                    'duration_ms' => $duration,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                $failureCount++;
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
}
