<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Services\GitHubService;
use Illuminate\Console\Command;

class SyncGitHubMetrics extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'projects:sync-github
                            {--project= : Sync a specific project by slug}
                            {--force : Force refresh (clear cache)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync GitHub metrics for all projects with a linked GitHub repository';

    public function __construct(
        protected GitHubService $githubService
    )
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $projectSlug = $this->option('project');
        $force = $this->option('force');

        $query = Project::whereNotNull('github_repo')
            ->where('github_repo', '!=', '');

        if ($projectSlug) {
            $query->where('slug', $projectSlug);
        }

        $projects = $query->get();

        if ($projects->isEmpty()) {
            $this->warn('No projects with GitHub repositories found.');
            return Command::SUCCESS;
        }

        $this->info("Syncing GitHub metrics for {$projects->count()} project(s)...");
        $this->newLine();

        $bar = $this->output->createProgressBar($projects->count());
        $bar->start();

        $synced = 0;
        $failed = 0;

        foreach ($projects as $project) {
            $repo = $project->github_repo;

            if ($force) {
                $this->githubService->clearCache($repo);
            }

            $metrics = $this->githubService->getAllMetrics($repo);

            if ($metrics) {
                $project->update([
                    'metrics' => $metrics,
                    'metrics_synced_at' => now(),
                ]);
                $synced++;
            } else {
                $this->newLine();
                $this->error("  Failed to fetch metrics for: {$project->title} ({$repo})");
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Sync complete!");
        $this->table(
            ['Status', 'Count'],
            [
                ['Synced', $synced],
                ['Failed', $failed],
                ['Total', $projects->count()],
            ]
        );

        return $failed > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
