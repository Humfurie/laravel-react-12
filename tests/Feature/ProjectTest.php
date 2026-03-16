<?php

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createAdminUser(['blog', 'project']);
});

test('project auto generates slug from title', function () {
    $project = Project::factory()->create([
        'title' => 'My Amazing Project Title',
    ]);

    expect($project->slug)->toBe('my-amazing-project-title');
});

test('project generates unique slug when duplicate title exists', function () {
    // Create first project
    $firstProject = Project::factory()->create([
        'title' => 'Unique Project',
        'slug' => 'unique-project',
    ]);

    // Create second project with same title
    $secondProject = Project::factory()->create([
        'title' => 'Unique Project',
    ]);

    // Create third project with same title
    $thirdProject = Project::factory()->create([
        'title' => 'Unique Project',
    ]);

    expect($firstProject->slug)->toBe('unique-project')
        ->and($secondProject->slug)->toBe('unique-project-1')
        ->and($thirdProject->slug)->toBe('unique-project-2');
});

test('project slug uniqueness check includes soft deleted projects', function () {
    // Create and soft delete a project
    $deletedProject = Project::factory()->create([
        'title' => 'Deleted Project',
        'slug' => 'deleted-project',
    ]);
    $deletedProject->delete();

    // Create new project with same title
    $newProject = Project::factory()->create([
        'title' => 'Deleted Project',
    ]);

    // Should generate unique slug despite original being soft deleted
    expect($newProject->slug)->toBe('deleted-project-1');
});

test('project can update without changing slug when title changes', function () {
    $project = Project::factory()->create([
        'title' => 'Original Project',
        'slug' => 'custom-project-slug',
    ]);

    $project->update([
        'title' => 'New Project Title',
        'slug' => 'custom-project-slug', // Explicitly keeping the slug
    ]);

    expect($project->fresh()->slug)->toBe('custom-project-slug');
});

test('project auto generates slug when title is updated and slug is empty', function () {
    $project = Project::factory()->create([
        'title' => 'Original Title',
        'slug' => 'original-title',
    ]);

    // Update title with empty slug
    $project->title = 'New Title';
    $project->slug = '';
    $project->save();

    expect($project->fresh()->slug)->toBe('new-title');
});

test('project can have demo_url', function () {
    $project = Project::factory()->create([
        'demo_url' => 'https://demo.example.com',
    ]);

    expect($project->demo_url)->toBe('https://demo.example.com');
});

test('project demo_url is nullable', function () {
    $project = Project::factory()->create([
        'demo_url' => null,
    ]);

    expect($project->demo_url)->toBeNull();
});

// --- Admin Search, Filter & Pagination ---

test('admin project index filters by live status', function () {
    Project::factory()->create(['status' => 'live']);
    Project::factory()->create(['status' => 'archived']);

    $this->actingAs($this->user)
        ->get(route('admin.projects.index', ['status' => 'live']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('projects.data', 1)
            ->where('projects.data.0.status', 'live')
        );
});

test('admin project index filters by deleted status', function () {
    Project::factory()->create(['status' => 'live']);
    $deleted = Project::factory()->create(['status' => 'live']);
    $deleted->delete();

    $this->actingAs($this->user)
        ->get(route('admin.projects.index', ['status' => 'deleted']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('projects.data', 1)
            ->where('projects.data.0.id', $deleted->id)
        );
});

test('admin project index searches by title', function () {
    Project::factory()->create(['title' => 'Portfolio Website']);
    Project::factory()->create(['title' => 'E-commerce Platform']);

    $this->actingAs($this->user)
        ->get(route('admin.projects.index', ['search' => 'Portfolio']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('projects.data', 1)
            ->where('projects.data.0.title', 'Portfolio Website')
        );
});

test('admin project index paginates results', function () {
    Project::factory()->count(15)->create();

    $this->actingAs($this->user)
        ->get(route('admin.projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('projects.data', 12)
            ->where('projects.last_page', 2)
        );
});

test('admin project index passes filters back to frontend', function () {
    $this->actingAs($this->user)
        ->get(route('admin.projects.index', ['search' => 'test', 'status' => 'live']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.search', 'test')
            ->where('filters.status', 'live')
        );
});

// --- Public Projects Page ---

test('public projects page returns github stats', function () {
    $admin = createAdminUser(['blog', 'project']);
    config(['app.admin_user_id' => $admin->id]);
    $admin->update(['github_username' => 'testuser']);

    Project::factory()->public()->create();

    $this->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('user/projects')
            ->has('githubStats')
        );
});

test('public projects page loads images for projects', function () {
    $project = Project::factory()->public()->create();

    // Create images for the project
    $project->images()->createMany([
        ['name' => 'Screenshot 1', 'path' => 'project-images/img1.jpg', 'is_primary' => true, 'order' => 1],
        ['name' => 'Screenshot 2', 'path' => 'project-images/img2.jpg', 'is_primary' => false, 'order' => 2],
        ['name' => 'Screenshot 3', 'path' => 'project-images/img3.jpg', 'is_primary' => false, 'order' => 3],
    ]);

    $this->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('user/projects')
            ->has('projects.owned', 1)
            ->has('projects.owned.0.images', 3)
        );
});

test('public projects page groups projects by ownership type', function () {
    Project::factory()->public()->count(2)->create(['ownership_type' => 'owner']);
    Project::factory()->public()->contributed()->create();

    $this->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('projects.owned', 2)
            ->has('projects.contributed', 1)
        );
});
