<?php

use App\Jobs\SyncProjectGitHubData;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('dispatches sync jobs for projects with github repos', function () {
    Queue::fake();

    Project::factory()->create(['github_repo' => 'owner/repo1']);
    Project::factory()->create(['github_repo' => 'owner/repo2']);
    Project::factory()->create(['github_repo' => null, 'links' => null]);

    $this->artisan('projects:sync-github-data')
        ->expectsOutputToContain('Dispatching sync jobs for 2 project(s)')
        ->assertSuccessful();

    Queue::assertPushed(SyncProjectGitHubData::class, 2);
});

test('handles no projects gracefully', function () {
    Queue::fake();

    $this->artisan('projects:sync-github-data')
        ->expectsOutputToContain('No projects with GitHub repos found')
        ->assertSuccessful();

    Queue::assertNothingPushed();
});
