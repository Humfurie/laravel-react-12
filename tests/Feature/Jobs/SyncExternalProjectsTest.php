<?php

use App\Jobs\SyncExternalProjects;
use App\Models\Project;
use App\Services\HumfurieProjectsService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('creates a new project from external data', function () {
    $mock = Mockery::mock(HumfurieProjectsService::class);
    $mock->shouldReceive('fetchAll')->once()->andReturn([
        [
            'id' => 'uuid-1',
            'title' => 'Clofel Creates',
            'slug' => 'clofel-creates',
            'description' => 'desc',
            'short_description' => 'short',
            'category' => 'web_app',
            'status' => 'live',
            'tech_stack' => ['Next.js'],
            'links' => ['demo_url' => 'https://clofelcreates.com', 'docs_url' => null, 'repo_url' => null],
            'is_featured' => false,
            'is_public' => true,
            'sort_order' => 2,
            'view_count' => 33,
        ],
    ]);
    $this->app->instance(HumfurieProjectsService::class, $mock);

    (new SyncExternalProjects)->handle($this->app->make(HumfurieProjectsService::class));

    $project = Project::where('external_id', 'uuid-1')->first();

    expect($project)->not->toBeNull();
    expect($project->title)->toBe('Clofel Creates');
    expect($project->status)->toBe('live');
    expect($project->links)->toBe(['demo_url' => 'https://clofelcreates.com', 'docs_url' => null, 'repo_url' => null]);
    expect($project->external_synced_at)->not->toBeNull();
});

test('updates an existing project without touching local-only enrichment fields', function () {
    $project = Project::factory()->create([
        'external_id' => 'uuid-1',
        'title' => 'Old Title',
        'case_study' => 'my hand-written case study',
        'ownership_type' => Project::OWNERSHIP_CONTRIBUTOR,
    ]);

    $mock = Mockery::mock(HumfurieProjectsService::class);
    $mock->shouldReceive('fetchAll')->once()->andReturn([
        [
            'id' => 'uuid-1',
            'title' => 'New Title',
            'slug' => 'new-title',
            'description' => 'desc',
            'short_description' => 'short',
            'category' => 'web_app',
            'status' => 'live',
            'tech_stack' => [],
            'links' => ['demo_url' => null, 'docs_url' => null, 'repo_url' => null],
            'is_featured' => false,
            'is_public' => true,
            'sort_order' => 1,
            'view_count' => 5,
        ],
    ]);
    $this->app->instance(HumfurieProjectsService::class, $mock);

    (new SyncExternalProjects)->handle($this->app->make(HumfurieProjectsService::class));

    $project->refresh();

    expect($project->title)->toBe('New Title');
    expect($project->case_study)->toBe('my hand-written case study');
    expect($project->ownership_type)->toBe(Project::OWNERSHIP_CONTRIBUTOR);
});
