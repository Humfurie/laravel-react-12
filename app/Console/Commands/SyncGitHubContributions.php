<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\GitHubService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncGitHubContributions extends Command
{
    protected $signature = 'github:sync-contributions';

    protected $description = 'Sync GitHub contribution stats for the admin user';

    public function handle(GitHubService $githubService): int
    {
        $user = User::find(config('app.admin_user_id'));

        if (! $user?->github_username) {
            $this->error('Admin user not found or has no GitHub username.');

            return self::FAILURE;
        }

        $this->info("Syncing GitHub contributions for {$user->github_username}...");

        try {
            $contributions = $githubService->getUserContributions($user->github_username);

            if (! $contributions) {
                $this->error('Failed to fetch contributions from GitHub API.');

                return self::FAILURE;
            }

            $user->update([
                'github_contributions' => $contributions,
                'github_synced_at' => now(),
            ]);

            $this->info("Synced: {$contributions['total_contributions']} contributions, {$contributions['commits']} commits");

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed: {$e->getMessage()}");
            Log::error("GitHub contributions sync failed: {$e->getMessage()}");

            return self::FAILURE;
        }
    }
}
