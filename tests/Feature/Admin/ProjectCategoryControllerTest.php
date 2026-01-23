<?php

use App\Models\Project;
use App\Models\ProjectCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createAdminUser('project');
    config(['app.admin_user_id' => $this->user->id]);
});

// Index Tests
test('authorized user can view project categories index', function () {
    ProjectCategory::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('admin.project-categories.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/project-categories/index')
            ->has('categories', 3)
        );
});

test('unauthorized user cannot view project categories', function () {
    // Create user with blog-only permissions using a separate role
    $userWithoutPermission = createUserWithRole('Blog Editor', 'blog-editor', 'blog');

    $this->actingAs($userWithoutPermission)
        ->get(route('admin.project-categories.index'))
        ->assertForbidden();
});

test('guest cannot view project categories', function () {
    $this->get(route('admin.project-categories.index'))
        ->assertRedirect(route('login'));
});

test('categories are returned with project count', function () {
    $category = ProjectCategory::factory()->create();
    Project::factory()->count(2)->create(['project_category_id' => $category->id]);

    $this->actingAs($this->user)
        ->get(route('admin.project-categories.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('categories.0.projects_count', 2)
        );
});

// Store Tests
test('authorized user can create project category', function () {
    $data = [
        'name' => 'Web Applications',
        'description' => 'Projects built for the web',
    ];

    $this->actingAs($this->user)
        ->post(route('admin.project-categories.store'), $data)
        ->assertRedirect(route('admin.project-categories.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('project_categories', [
        'name' => 'Web Applications',
        'slug' => 'web-applications',
        'description' => 'Projects built for the web',
    ]);
});

test('project category creation validates required fields', function () {
    $this->actingAs($this->user)
        ->post(route('admin.project-categories.store'), [])
        ->assertSessionHasErrors(['name']);
});

test('project category creation validates name max length', function () {
    $data = ['name' => str_repeat('a', 256)];

    $this->actingAs($this->user)
        ->post(route('admin.project-categories.store'), $data)
        ->assertSessionHasErrors(['name']);
});

test('project category creation validates unique slug', function () {
    ProjectCategory::factory()->create(['slug' => 'existing-slug']);

    $data = [
        'name' => 'Test Category',
        'slug' => 'existing-slug',
    ];

    $this->actingAs($this->user)
        ->post(route('admin.project-categories.store'), $data)
        ->assertSessionHasErrors(['slug']);
});

test('project category auto-generates slug from name', function () {
    $data = ['name' => 'Mobile Apps & Services'];

    $this->actingAs($this->user)
        ->post(route('admin.project-categories.store'), $data)
        ->assertRedirect();

    $this->assertDatabaseHas('project_categories', [
        'name' => 'Mobile Apps & Services',
        'slug' => 'mobile-apps-services',
    ]);
});

test('unauthorized user cannot create project category', function () {
    // Create user with blog-only permissions using a separate role
    $userWithoutPermission = createUserWithRole('Blog Editor', 'blog-editor', 'blog');

    $this->actingAs($userWithoutPermission)
        ->post(route('admin.project-categories.store'), ['name' => 'Test'])
        ->assertForbidden();
});

// Update Tests
test('authorized user can update project category', function () {
    $category = ProjectCategory::factory()->create();

    $data = [
        'name' => 'Updated Name',
        'description' => 'Updated description',
    ];

    $this->actingAs($this->user)
        ->put(route('admin.project-categories.update', $category), $data)
        ->assertRedirect(route('admin.project-categories.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('project_categories', [
        'id' => $category->id,
        'name' => 'Updated Name',
        'description' => 'Updated description',
    ]);
});

test('project category update allows same slug for same category', function () {
    $category = ProjectCategory::factory()->create(['slug' => 'my-slug']);

    $data = [
        'name' => 'Updated Name',
        'slug' => 'my-slug', // Same slug
    ];

    $this->actingAs($this->user)
        ->put(route('admin.project-categories.update', $category), $data)
        ->assertRedirect()
        ->assertSessionHasNoErrors();
});

test('project category update prevents duplicate slug', function () {
    ProjectCategory::factory()->create(['slug' => 'existing-slug']);
    $category = ProjectCategory::factory()->create(['slug' => 'different-slug']);

    $data = [
        'name' => 'Test',
        'slug' => 'existing-slug',
    ];

    $this->actingAs($this->user)
        ->put(route('admin.project-categories.update', $category), $data)
        ->assertSessionHasErrors(['slug']);
});

test('unauthorized user cannot update project category', function () {
    // Create user with blog-only permissions using a separate role
    $userWithoutPermission = createUserWithRole('Blog Editor', 'blog-editor', 'blog');
    $category = ProjectCategory::factory()->create();

    $this->actingAs($userWithoutPermission)
        ->put(route('admin.project-categories.update', $category), ['name' => 'Test'])
        ->assertForbidden();
});

// Delete Tests
test('authorized user can delete empty project category', function () {
    $category = ProjectCategory::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('admin.project-categories.destroy', $category))
        ->assertRedirect(route('admin.project-categories.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('project_categories', ['id' => $category->id]);
});

test('cannot delete project category with associated projects', function () {
    $category = ProjectCategory::factory()->create();
    Project::factory()->create(['project_category_id' => $category->id]);

    $this->actingAs($this->user)
        ->delete(route('admin.project-categories.destroy', $category))
        ->assertRedirect(route('admin.project-categories.index'))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('project_categories', ['id' => $category->id]);
});

test('unauthorized user cannot delete project category', function () {
    // Create user with blog-only permissions using a separate role
    $userWithoutPermission = createUserWithRole('Blog Editor', 'blog-editor', 'blog');
    $category = ProjectCategory::factory()->create();

    $this->actingAs($userWithoutPermission)
        ->delete(route('admin.project-categories.destroy', $category))
        ->assertForbidden();
});

// Reorder Tests
test('authorized user can reorder project categories', function () {
    $categories = ProjectCategory::factory()->count(3)->create();

    $items = [
        ['id' => $categories[0]->id, 'sort_order' => 3],
        ['id' => $categories[1]->id, 'sort_order' => 1],
        ['id' => $categories[2]->id, 'sort_order' => 2],
    ];

    $this->actingAs($this->user)
        ->post(route('admin.project-categories.reorder'), ['items' => $items])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('project_categories', ['id' => $categories[0]->id, 'sort_order' => 3]);
    $this->assertDatabaseHas('project_categories', ['id' => $categories[1]->id, 'sort_order' => 1]);
    $this->assertDatabaseHas('project_categories', ['id' => $categories[2]->id, 'sort_order' => 2]);
});

test('reorder validates required items array', function () {
    $this->actingAs($this->user)
        ->post(route('admin.project-categories.reorder'), [])
        ->assertSessionHasErrors(['items']);
});

test('reorder validates item structure', function () {
    $this->actingAs($this->user)
        ->post(route('admin.project-categories.reorder'), [
            'items' => [
                ['id' => 1], // Missing sort_order
            ],
        ])
        ->assertSessionHasErrors(['items.0.sort_order']);
});

test('unauthorized user cannot reorder project categories', function () {
    // Create user with blog-only permissions using a separate role
    $userWithoutPermission = createUserWithRole('Blog Editor', 'blog-editor', 'blog');
    $categories = ProjectCategory::factory()->count(2)->create();

    $this->actingAs($userWithoutPermission)
        ->post(route('admin.project-categories.reorder'), [
            'items' => [
                ['id' => $categories[0]->id, 'sort_order' => 2],
            ],
        ])
        ->assertForbidden();
});

// Cache Invalidation Tests
test('creating category clears homepage projects cache', function () {
    Cache::put(config('cache-ttl.keys.homepage_projects'), 'cached_value', 3600);

    $this->actingAs($this->user)
        ->post(route('admin.project-categories.store'), ['name' => 'New Category']);

    expect(Cache::has(config('cache-ttl.keys.homepage_projects')))->toBeFalse();
});

test('updating category clears homepage projects cache', function () {
    $category = ProjectCategory::factory()->create();
    Cache::put(config('cache-ttl.keys.homepage_projects'), 'cached_value', 3600);

    $this->actingAs($this->user)
        ->put(route('admin.project-categories.update', $category), ['name' => 'Updated']);

    expect(Cache::has(config('cache-ttl.keys.homepage_projects')))->toBeFalse();
});

test('deleting category clears homepage projects cache', function () {
    $category = ProjectCategory::factory()->create();
    Cache::put(config('cache-ttl.keys.homepage_projects'), 'cached_value', 3600);

    $this->actingAs($this->user)
        ->delete(route('admin.project-categories.destroy', $category));

    expect(Cache::has(config('cache-ttl.keys.homepage_projects')))->toBeFalse();
});
