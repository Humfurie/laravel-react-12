<?php

namespace App\Jobs;

use App\Models\Project;
use App\Services\GitHubService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SyncProjectGitHubData implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Project $project
    ) {}

    public function handle(GitHubService $github): void
    {
        $repo = $this->project->github_repo;

        if (! $repo) {
            // Try extracting from repo_url
            $repoUrl = $this->project->links['repo_url'] ?? null;
            $repo = $repoUrl ? $github->extractRepoFromUrl($repoUrl) : null;
        }

        if (! $repo) {
            return;
        }

        try {
            $data = $github->getAllMetrics($repo, 10);

            if (! $data) {
                Log::warning('SyncProjectGitHubData: No data returned', [
                    'project_id' => $this->project->id,
                    'repo' => $repo,
                ]);

                return;
            }

            // Store in database (durable)
            $this->project->update([
                'metrics' => $data,
                'metrics_synced_at' => now(),
            ]);

            // Store in cache (fast reads, no TTL — refreshed by next sync)
            $cacheKey = sprintf(config('cache-ttl.keys.project_github'), $this->project->id);
            Cache::forever($cacheKey, [
                'contributors' => $data['contributors'] ?? [],
                'commit_count' => $data['contributor_count'] ?? 0,
                'last_commit' => $data['last_push'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('SyncProjectGitHubData failed', [
                'project_id' => $this->project->id,
                'repo' => $repo,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Let queue retry
        }
    }
}
