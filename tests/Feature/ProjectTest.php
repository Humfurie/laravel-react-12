<?php

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createAdminUser('blog');
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
