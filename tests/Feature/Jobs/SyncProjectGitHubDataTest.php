<?php

use App\Jobs\SyncProjectGitHubData;
use App\Models\Project;
use App\Services\GitHubService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

test('syncs github data to project metrics and cache', function () {
    $project = Project::factory()->create([
        'github_repo' => 'Humfurie/laravel-react-12',
        'metrics' => null,
        'metrics_synced_at' => null,
    ]);

    $mockData = [
        'stars' => 10,
        'forks' => 2,
        'watchers' => 5,
        'downloads' => 0,
        'open_issues' => 1,
        'language' => 'PHP',
        'topics' => ['laravel'],
        'license' => 'MIT',
        'last_push' => '2026-01-27T00:00:00Z',
        'contributors' => [
            ['login' => 'Humfurie', 'avatar_url' => 'https://avatars.githubusercontent.com/u/1', 'contributions' => 100],
        ],
        'contributor_count' => 1,
        'contribution_calendar' => null,
    ];

    $mock = Mockery::mock(GitHubService::class);
    $mock->shouldReceive('getAllMetrics')->once()->with('Humfurie/laravel-react-12', 10)->andReturn($mockData);
    $this->app->instance(GitHubService::class, $mock);

    SyncProjectGitHubData::dispatchSync($project);

    $project->refresh();

    expect($project->metrics)->toHaveKey('stars', 10);
    expect($project->metrics)->toHaveKey('contributors');
    expect($project->metrics_synced_at)->not->toBeNull();

    $cacheKey = sprintf(config('cache-ttl.keys.project_github'), $project->id);
    expect(Cache::get($cacheKey))->not->toBeNull();
    expect(Cache::get($cacheKey)['contributors'])->toHaveCount(1);
});

test('skips project without github repo', function () {
    $project = Project::factory()->create([
        'github_repo' => null,
        'links' => null,
    ]);

    $mock = Mockery::mock(GitHubService::class);
    $mock->shouldNotReceive('getAllMetrics');
    $this->app->instance(GitHubService::class, $mock);

    SyncProjectGitHubData::dispatchSync($project);

    $project->refresh();
    expect($project->metrics_synced_at)->toBeNull();
});
