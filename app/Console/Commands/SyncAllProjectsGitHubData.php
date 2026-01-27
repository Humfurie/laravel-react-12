<?php

namespace App\Console\Commands;

use App\Jobs\SyncProjectGitHubData;
use App\Models\Project;
use Illuminate\Console\Command;

class SyncAllProjectsGitHubData extends Command
{
    protected $signature = 'projects:sync-github-data';

    protected $description = 'Sync GitHub data for all projects with a github_repo';

    public function handle(): int
    {
        $projects = Project::query()
            ->where(function ($query) {
                $query->whereNotNull('github_repo')
                    ->orWhereRaw("links->>'repo_url' IS NOT NULL");
            })
            ->get();

        if ($projects->isEmpty()) {
            $this->info('No projects with GitHub repos found.');

            return self::SUCCESS;
        }

        $this->info("Dispatching sync jobs for {$projects->count()} project(s)...");

        foreach ($projects as $index => $project) {
            SyncProjectGitHubData::dispatch($project)
                ->delay(now()->addSeconds($index * 5));
        }

        $this->info('All sync jobs dispatched.');

        return self::SUCCESS;
    }
}
