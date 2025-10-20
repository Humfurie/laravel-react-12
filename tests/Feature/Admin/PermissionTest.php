<?php


use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

test('admin can get all permissions', function () {
    $user = User::factory()
        ->has(Role::factory()
            ->state([
                'name' => 'Admin',
                'slug' => 'admin'
            ])->hasAttached(Permission::factory()
                ->state([
                    'resource' => 'permission',
                ]), ['actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)], 'permissions'))
        ->create();

    Permission::factory()->count(4)->create();

    $this->actingAs($user);

    $response = $this->get('/admin/permissions');

    $totalPermissions = Permission::count(); // Get actual count

    $response->assertStatus(200)
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('admin/permission') // The React component name
            ->has('permissions', $totalPermissions) // Assert we have correct number of permissions
            ->has('permissions.0.resource') // Assert first permission has resource property
            ->has('permissions.0.actions') // Assert first permission has actions property
        );
});

test('admin can create permissions', function () {

    $user = User::factory()
        ->has(Role::factory()
            ->state([
                'name' => 'Admin',
                'slug' => 'admin'
            ])->hasAttached(Permission::factory()
                ->state([
                    'resource' => 'permission',
                ]), ['actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)], 'permissions'))
        ->create();

    $this->actingAs($user);

    $inputPermission = [
        'resource' => 'user',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'],
    ];

    $response = $this->post('/admin/permissions', $inputPermission);

    $response->assertStatus(302)
        ->assertRedirect('/admin/permissions');

    $permission = Permission::where('resource', $inputPermission['resource'])->first();

    $this->assertNotNull($permission);
    $this->assertEquals(
        $inputPermission['actions'],
        $permission->actions
    );

});

test('admin can update permissions', function () {

    $user = User::factory()
        ->has(Role::factory()
            ->state([
                'name' => 'Admin',
                'slug' => 'admin'
            ])->hasAttached(Permission::factory()
                ->state([
                    'resource' => 'permission',
                ]), ['actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)], 'permissions'))
        ->create();

    //Create Permission
    $permission = Permission::factory()->create([
        'resource' => 'user',
    ]);

    $this->actingAs($user);

    $updatedData = [
        'resource' => 'manager',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ];

    $response = $this->put("/admin/permissions/$permission->id", $updatedData);

    $response->assertStatus(302)
        ->assertRedirect('/admin/permissions');

    $permission = Permission::where('resource', $updatedData['resource'])->first();

    $this->assertNotNull($permission);
    $this->assertEquals(
        $updatedData['actions'],
        $permission->actions
    );

    $record = DB::table('permissions')
        ->where('resource', $permission?->resource)
        ->first();

    $this->assertNotNull($record);
});

test('admin can delete permissions', function () {
    $user = User::factory()
        ->has(Role::factory()
            ->state([
                'name' => 'Admin',
                'slug' => 'admin'
            ])->hasAttached(Permission::factory()
                ->state([
                    'resource' => 'permission',
                ]), ['actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)], 'permissions'))
        ->create();

    $this->actingAs($user);

    $permission = Permission::factory()->create();

    $response = $this->delete("/admin/permissions/$permission->id");

    $response->assertStatus(302)
        ->assertRedirect('/admin/permissions');

    $this->assertSoftDeleted('permissions', [
        'id' => $permission->id
    ]);
});

test('admin can force delete permissions', function () {
    $user = User::factory()
        ->has(Role::factory()
            ->state([
                'name' => 'Admin',
                'slug' => 'admin'
            ])->hasAttached(Permission::factory()
                ->state([
                    'resource' => 'permission',
                ]), ['actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)], 'permissions'))
        ->create();

    $this->actingAs($user);

    $permission = Permission::factory()->create();

    $response = $this->delete("/admin/permissions/$permission->id/force");

    $response->assertStatus(302)
        ->assertRedirect('/admin/permissions');

    $this->assertDatabaseMissing('permissions', [
        'id' => $permission->id
    ]);
});

test('admin can restore permissions', function () {
    $user = User::factory()
        ->has(Role::factory()
            ->state([
                'name' => 'Admin',
                'slug' => 'admin'
            ])->hasAttached(Permission::factory()
                ->state([
                    'resource' => 'permission',
                ]), ['actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)], 'permissions'))
        ->create();

    $this->actingAs($user);

    $permission = Permission::factory()->create();

    $response = $this->patch("/admin/permissions/$permission->id/restore");

    $response->assertStatus(302)
        ->assertRedirect('/admin/permissions');

    // Assert that the role is no longer soft-deleted
    $this->assertDatabaseHas('permissions', [
        'id' => $permission->id,
        'deleted_at' => null
    ]);

    // Or alternatively, use the model's methods
    $this->assertFalse(Permission::withTrashed()->find($permission->id)?->trashed());
});
