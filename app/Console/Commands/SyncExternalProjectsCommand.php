<?php

namespace App\Console\Commands;

use App\Jobs\SyncExternalProjects;
use Illuminate\Console\Command;

class SyncExternalProjectsCommand extends Command
{
    protected $signature = 'projects:sync-external';

    protected $description = 'Sync projects from the public humfurie.org projects API';

    public function handle(): int
    {
        SyncExternalProjects::dispatch();

        $this->info('External projects sync job dispatched.');

        return self::SUCCESS;
    }
}
