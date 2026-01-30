<?php

use App\Models\Deployment;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createAdminUser('deployment');
});

test('deployment auto generates slug from title', function () {
    $deployment = Deployment::factory()->create([
        'title' => 'My Client Website',
    ]);

    expect($deployment->slug)->toBe('my-client-website');
});

test('deployment generates unique slug when duplicate exists', function () {
    Deployment::factory()->create(['title' => 'Test Site', 'slug' => 'test-site']);
    $second = Deployment::factory()->create(['title' => 'Test Site']);

    expect($second->slug)->toBe('test-site-1');
});

test('deployment can be linked to project', function () {
    $project = Project::factory()->create();
    $deployment = Deployment::factory()->create(['project_id' => $project->id]);

    expect($deployment->project->id)->toBe($project->id);
});

test('deployment project link is optional', function () {
    $deployment = Deployment::factory()->create(['project_id' => null]);

    expect($deployment->project)->toBeNull();
});

test('deployment has correct status labels', function () {
    $active = Deployment::factory()->create(['status' => 'active']);
    $maintenance = Deployment::factory()->create(['status' => 'maintenance']);
    $archived = Deployment::factory()->create(['status' => 'archived']);

    expect($active->status_label)->toBe('Active')
        ->and($maintenance->status_label)->toBe('Maintenance')
        ->and($archived->status_label)->toBe('Archived');
});

test('deployment has correct client type labels', function () {
    $family = Deployment::factory()->family()->create();
    $business = Deployment::factory()->business()->create();

    expect($family->client_type_label)->toBe('Family')
        ->and($business->client_type_label)->toBe('Business');
});

test('admin can view deployments index', function () {
    Deployment::factory()->count(3)->create();

    $response = $this->actingAs($this->user)
        ->get(route('admin.deployments.index'));

    $response->assertOk();
});

test('admin can create deployment', function () {
    $response = $this->actingAs($this->user)
        ->post(route('admin.deployments.store'), [
            'title' => 'New Deployment',
            'client_name' => 'Test Client',
            'client_type' => 'family',
            'live_url' => 'https://example.com',
            'status' => 'active',
        ]);

    $response->assertRedirect(route('admin.deployments.index'));
    expect(Deployment::where('title', 'New Deployment')->exists())->toBeTrue();
});

test('admin can update deployment', function () {
    $deployment = Deployment::factory()->create();

    $response = $this->actingAs($this->user)
        ->put(route('admin.deployments.update', $deployment), [
            'title' => 'Updated Title',
            'client_name' => $deployment->client_name,
            'client_type' => $deployment->client_type,
            'live_url' => $deployment->live_url,
            'status' => $deployment->status,
        ]);

    $response->assertRedirect(route('admin.deployments.index'));
    expect($deployment->fresh()->title)->toBe('Updated Title');
});

test('admin can delete deployment', function () {
    $deployment = Deployment::factory()->create();

    $response = $this->actingAs($this->user)
        ->delete(route('admin.deployments.destroy', $deployment));

    $response->assertRedirect(route('admin.deployments.index'));
    expect($deployment->fresh()->deleted_at)->not->toBeNull();
});

test('public scope returns only public deployments', function () {
    Deployment::factory()->create(['is_public' => true]);
    Deployment::factory()->create(['is_public' => false]);

    expect(Deployment::public()->count())->toBe(1);
});

test('active scope returns only active deployments', function () {
    Deployment::factory()->create(['status' => 'active']);
    Deployment::factory()->create(['status' => 'archived']);

    expect(Deployment::active()->count())->toBe(1);
});
