<?php

use App\Models\Project;
use App\Models\User;

test('projects page groups by ownership type', function () {
    Project::factory()->public()->live()->create(['ownership_type' => 'owner']);
    Project::factory()->public()->live()->create(['ownership_type' => 'contributor']);

    $response = $this->get('/projects');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('user/projects')
        ->has('projects.owned', 1)
        ->has('projects.contributed', 1)
    );
});

test('ownership type defaults to owner', function () {
    $project = Project::factory()->create();

    expect($project->ownership_type)->toBe('owner');
});

test('author accessor returns null for owner projects', function () {
    $project = Project::factory()->create([
        'ownership_type' => 'owner',
        'metrics' => ['contributors' => [['login' => 'someone', 'avatar_url' => null, 'contributions' => 50]]],
    ]);

    expect($project->author)->toBeNull();
});

test('author accessor returns top non-owner contributor', function () {
    // Create an admin user with known github_username
    $adminUser = User::factory()->create(['github_username' => 'Humfurie']);
    config(['app.admin_user_id' => $adminUser->id]);

    $project = Project::factory()->create([
        'ownership_type' => 'contributor',
        'metrics' => [
            'contributors' => [
                ['login' => 'clofelmaeee', 'avatar_url' => 'https://avatars.githubusercontent.com/u/1', 'contributions' => 113],
                ['login' => 'Humfurie', 'avatar_url' => 'https://avatars.githubusercontent.com/u/2', 'contributions' => 8],
            ],
        ],
    ]);

    expect($project->author)->not->toBeNull();
    expect($project->author['login'])->toBe('clofelmaeee');
    expect($project->author['contributions'])->toBe(113);
});

test('project scopes filter by ownership type', function () {
    Project::factory()->create(['ownership_type' => 'owner']);
    Project::factory()->create(['ownership_type' => 'contributor']);

    expect(Project::owned()->count())->toBe(1);
    expect(Project::contributed()->count())->toBe(1);
});
