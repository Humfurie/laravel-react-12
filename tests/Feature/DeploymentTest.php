<?php

use App\Models\Deployment;
use App\Models\Image;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createAdminUser('deployment');
    Storage::fake(config('filesystems.default'));
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
        ->and($maintenance->status_label)->toBe('Under Maintenance')
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

test('guest cannot view deployments index', function () {
    $this->get(route('admin.deployments.index'))
        ->assertRedirect(route('login'));
});

test('guest cannot create deployment', function () {
    $this->post(route('admin.deployments.store'), [
        'title' => 'Test',
        'client_name' => 'Client',
        'client_type' => 'family',
        'live_url' => 'https://example.com',
        'status' => 'active',
    ])->assertRedirect(route('login'));
});

test('user without deployment permission cannot view index', function () {
    // Create a regular user without any admin role/permissions
    $regularUser = \App\Models\User::factory()->create();

    $this->actingAs($regularUser)
        ->get(route('admin.deployments.index'))
        ->assertForbidden();
});

test('user without deployment permission cannot create', function () {
    // Create a regular user without any admin role/permissions
    $regularUser = \App\Models\User::factory()->create();

    $this->actingAs($regularUser)
        ->post(route('admin.deployments.store'), [
            'title' => 'Test',
            'client_name' => 'Client',
            'client_type' => 'family',
            'live_url' => 'https://example.com',
            'status' => 'active',
        ])->assertForbidden();
});

test('admin can restore soft deleted deployment', function () {
    $deployment = Deployment::factory()->create();
    $deployment->delete();

    expect($deployment->fresh()->deleted_at)->not->toBeNull();

    $this->actingAs($this->user)
        ->patch(route('admin.deployments.restore', $deployment->slug))
        ->assertRedirect(route('admin.deployments.index'));

    expect($deployment->fresh()->deleted_at)->toBeNull();
});

test('admin can force delete deployment', function () {
    $deployment = Deployment::factory()->create();
    $slug = $deployment->slug;
    $deployment->delete();

    $this->actingAs($this->user)
        ->delete(route('admin.deployments.force-destroy', $slug))
        ->assertRedirect(route('admin.deployments.index'));

    expect(Deployment::withTrashed()->where('slug', $slug)->exists())->toBeFalse();
});

test('public api returns only public active deployments', function () {
    Deployment::factory()->create(['is_public' => true, 'status' => 'active']);
    Deployment::factory()->create(['is_public' => false, 'status' => 'active']);
    Deployment::factory()->create(['is_public' => true, 'status' => 'archived']);

    $response = $this->get(route('deployments.index'));

    $response->assertOk();
    expect(count($response->json()))->toBe(1);
});

test('public api show returns 404 for private deployment', function () {
    $deployment = Deployment::factory()->create(['is_public' => false]);

    $this->get(route('deployments.show', $deployment->slug))
        ->assertNotFound();
});

test('public api show returns 404 for soft deleted deployment', function () {
    $deployment = Deployment::factory()->create(['is_public' => true]);
    $slug = $deployment->slug;
    $deployment->delete();

    $this->get(route('deployments.show', $slug))
        ->assertNotFound();
});

// Image operation tests

test('admin can upload images to deployment', function () {
    $deployment = Deployment::factory()->create();
    $images = [
        UploadedFile::fake()->image('image1.jpg', 800, 600),
        UploadedFile::fake()->image('image2.png', 1024, 768),
    ];

    $response = $this->actingAs($this->user)
        ->post(route('admin.deployments.images.upload', $deployment), [
            'images' => $images,
        ]);

    $response->assertRedirect();
    expect($deployment->fresh()->images()->count())->toBe(2);
});

test('image upload validates file types', function () {
    $deployment = Deployment::factory()->create();
    $file = UploadedFile::fake()->create('document.pdf', 1024);

    $this->actingAs($this->user)
        ->post(route('admin.deployments.images.upload', $deployment), [
            'images' => [$file],
        ])
        ->assertSessionHasErrors('images.0');
});

test('image upload validates file size', function () {
    $deployment = Deployment::factory()->create();
    // Create image larger than 5MB limit
    $file = UploadedFile::fake()->image('large.jpg')->size(6000);

    $this->actingAs($this->user)
        ->post(route('admin.deployments.images.upload', $deployment), [
            'images' => [$file],
        ])
        ->assertSessionHasErrors('images.0');
});

test('admin can delete deployment image', function () {
    $deployment = Deployment::factory()->create();
    $imagePath = 'deployment-images/test-image.jpg';
    Storage::disk(config('filesystems.default'))->put($imagePath, 'fake image content');

    $image = Image::factory()->create([
        'imageable_type' => Deployment::class,
        'imageable_id' => $deployment->id,
        'path' => $imagePath,
    ]);

    $this->actingAs($this->user)
        ->delete(route('admin.deployments.images.delete', [$deployment, $image]))
        ->assertRedirect();

    expect(Image::find($image->id))->toBeNull();
});

test('admin cannot delete image belonging to another deployment', function () {
    $deployment1 = Deployment::factory()->create();
    $deployment2 = Deployment::factory()->create();
    $imagePath = 'deployment-images/test-image-2.jpg';
    Storage::disk(config('filesystems.default'))->put($imagePath, 'fake image content');

    $image = Image::factory()->create([
        'imageable_type' => Deployment::class,
        'imageable_id' => $deployment2->id,
        'path' => $imagePath,
    ]);

    $this->actingAs($this->user)
        ->delete(route('admin.deployments.images.delete', [$deployment1, $image]))
        ->assertForbidden();
});

test('admin can set primary image for deployment', function () {
    $deployment = Deployment::factory()->create();
    $image1 = Image::factory()->create([
        'imageable_type' => Deployment::class,
        'imageable_id' => $deployment->id,
        'is_primary' => true,
    ]);
    $image2 = Image::factory()->create([
        'imageable_type' => Deployment::class,
        'imageable_id' => $deployment->id,
        'is_primary' => false,
    ]);

    $this->actingAs($this->user)
        ->patch(route('admin.deployments.images.set-primary', [$deployment, $image2]))
        ->assertRedirect();

    expect($image2->fresh()->is_primary)->toBeTrue();
});

test('admin cannot set primary image from another deployment', function () {
    $deployment1 = Deployment::factory()->create();
    $deployment2 = Deployment::factory()->create();
    $image = Image::factory()->create([
        'imageable_type' => Deployment::class,
        'imageable_id' => $deployment2->id,
    ]);

    $this->actingAs($this->user)
        ->patch(route('admin.deployments.images.set-primary', [$deployment1, $image]))
        ->assertForbidden();
});

test('guest cannot upload deployment images', function () {
    $deployment = Deployment::factory()->create();

    $this->post(route('admin.deployments.images.upload', $deployment), [
        'images' => [UploadedFile::fake()->image('test.jpg')],
    ])->assertRedirect(route('login'));
});

test('guest cannot delete deployment images', function () {
    $deployment = Deployment::factory()->create();
    $image = Image::factory()->create([
        'imageable_type' => Deployment::class,
        'imageable_id' => $deployment->id,
    ]);

    $this->delete(route('admin.deployments.images.delete', [$deployment, $image]))
        ->assertRedirect(route('login'));
});
