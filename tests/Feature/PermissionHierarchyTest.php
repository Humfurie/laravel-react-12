<?php

use App\Models\Developer;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles
    $this->adminRole = Role::factory()->create(['name' => 'Admin', 'slug' => 'admin']);
    $this->editorRole = Role::factory()->create(['name' => 'Editor', 'slug' => 'editor']);
    $this->viewerRole = Role::factory()->create(['name' => 'Viewer', 'slug' => 'viewer']);

    // Create users
    $this->admin = User::factory()->create(); // First user will be admin
    $this->admin->update(['id' => 1]); // Force ID to 1
    $this->editorUser = User::factory()->create();
    $this->viewerUser = User::factory()->create();
    $this->noPermUser = User::factory()->create();

    // Assign roles
    $this->editorUser->roles()->attach($this->editorRole);
    $this->viewerUser->roles()->attach($this->viewerRole);
    $this->noPermUser->roles()->attach($this->viewerRole);

    // Create permissions for editor
    $editorDevPermission = Permission::factory()->create([
        'resource' => 'developer-editor',
        'actions' => json_encode(['viewAny', 'view', 'create', 'update']),
    ]);
    $editorDevPermission->roles()->attach($this->editorRole);

    // Create permissions for viewer
    $viewerDevPermission = Permission::factory()->create([
        'resource' => 'developer-viewer',
        'actions' => json_encode(['viewAny', 'view']),
    ]);
    $viewerDevPermission->roles()->attach($this->viewerRole);
});

test('admin user can access all resources', function () {
    $this->actingAs($this->admin);

    $response = $this->get('/admin/real-estate');

    $response->assertOk();
});

test('user without viewAny permission cannot access resource index', function () {
    // Create a role with no developer permissions
    $noDevPermRole = Role::factory()->create(['name' => 'No Dev Perm', 'slug' => 'no-dev-perm']);
    $user = User::factory()->create();
    $user->roles()->attach($noDevPermRole);

    // Give permission for blog but not developer
    Permission::factory()->create([
        'resource' => 'blog',
        'actions' => json_encode(['viewAny', 'view']),
    ])->roles()->attach($noDevPermRole);

    $this->actingAs($user);

    $response = $this->get('/admin/real-estate');

    $response->assertForbidden();
});

test('user with viewAny can access resource index', function () {
    $this->actingAs($this->viewerUser);

    $response = $this->get('/admin/real-estate');

    $response->assertOk();
});

test('user without create permission cannot create resource even with viewAny', function () {
    $this->actingAs($this->viewerUser); // Has viewAny but not create

    $response = $this->get('/admin/real-estate/developers/create');

    $response->assertForbidden();
});

test('user with create permission can create resource when they have viewAny', function () {
    $this->actingAs($this->editorUser); // Has viewAny and create

    $response = $this->get('/admin/real-estate/developers/create');

    $response->assertOk();
});

test('user without update permission cannot update resource even with viewAny', function () {
    $this->actingAs($this->viewerUser); // Has viewAny but not update

    $developer = Developer::factory()->create();

    $response = $this->put("/admin/real-estate/developers/{$developer->id}", [
        'company_name' => 'Updated Name',
    ]);

    $response->assertForbidden();
});

test('user with update permission can update resource when they have viewAny', function () {
    $this->actingAs($this->editorUser); // Has viewAny and update

    $developer = Developer::factory()->create();

    $response = $this->put("/admin/real-estate/developers/{$developer->id}", [
        'company_name' => 'Updated Name',
        'description' => 'Test description',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('developers', [
        'id' => $developer->id,
        'company_name' => 'Updated Name',
    ]);
});

test('user without delete permission cannot delete resource even with viewAny', function () {
    $this->actingAs($this->viewerUser); // Has viewAny but not delete

    $developer = Developer::factory()->create();

    $response = $this->delete("/admin/real-estate/developers/{$developer->id}");

    $response->assertForbidden();
});

test('policy methods require viewAny as prerequisite', function () {
    // Create a role with specific permissions but NO viewAny
    $specificPermRole = Role::factory()->create(['name' => 'Specific', 'slug' => 'specific']);
    $user = User::factory()->create();
    $user->roles()->attach($specificPermRole);

    // Give create, update, delete but NOT viewAny
    Permission::factory()->create([
        'resource' => 'developer',
        'actions' => json_encode(['create', 'update', 'delete']),
    ])->roles()->attach($specificPermRole);

    $this->actingAs($user);
    $developer = Developer::factory()->create();

    // Should not be able to access index
    $this->get('/admin/real-estate')->assertForbidden();

    // Should not be able to create (no viewAny)
    $this->get('/admin/real-estate/developers/create')->assertForbidden();

    // Should not be able to update (no viewAny)
    $this->put("/admin/real-estate/developers/{$developer->id}", [
        'company_name' => 'Updated',
    ])->assertForbidden();

    // Should not be able to delete (no viewAny)
    $this->delete("/admin/real-estate/developers/{$developer->id}")->assertForbidden();
});

test('shared permissions include all resources', function () {
    $this->actingAs($this->editorUser);

    $response = $this->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn($page) => $page
        ->has('auth.permissions')
        ->has('auth.permissions.developer')
        ->has('auth.permissions.project')
        ->has('auth.permissions.property')
        ->has('auth.permissions.blog')
        ->has('auth.permissions.user')
        ->has('auth.permissions.role')
        ->has('auth.permissions.permission')
    );
});

test('user permissions correctly reflect their role permissions', function () {
    $this->actingAs($this->editorUser);

    $response = $this->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn($page) => $page
        ->where('auth.permissions.developer.viewAny', true)
        ->where('auth.permissions.developer.view', true)
        ->where('auth.permissions.developer.create', true)
        ->where('auth.permissions.developer.update', true)
        ->where('auth.permissions.developer.delete', false)
        ->where('auth.permissions.developer.restore', false)
        ->where('auth.permissions.developer.forceDelete', false)
    );
});

test('blog routes require blog viewAny permission', function () {
    // Create a role with no blog permissions
    $noBlogPermRole = Role::factory()->create(['name' => 'No Blog', 'slug' => 'no-blog']);
    $user = User::factory()->create();
    $user->roles()->attach($noBlogPermRole);

    $this->actingAs($user);

    $response = $this->get('/admin/blogs');

    $response->assertForbidden();
});

test('user management routes require user viewAny permission', function () {
    // Create a role with no user permissions
    $noUserPermRole = Role::factory()->create(['name' => 'No User', 'slug' => 'no-user']);
    $user = User::factory()->create();
    $user->roles()->attach($noUserPermRole);

    $this->actingAs($user);

    $response = $this->get('/admin/users');

    $response->assertForbidden();
});
