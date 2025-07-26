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
            ->has(Permission::factory()->state([
                'resource' => 'permission',
            ]))
            ->state([
                'name' => 'Admin',
                'slug' => 'admin',
            ])
        )
        ->create();

    Permission::factory()->count(4)->create();

    $this->actingAs($user);

    $response = $this->get('/permissions');

    $response->assertStatus(200)
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('admin/permission') // The React component name
            ->has('permissions', 5) // Assert we have 5 roles
            ->has('roles.0.resource') // Assert first role has name property
        );
});

test('admin can create permissions', function () {

    $user = User::factory()
        ->has(Role::factory()
            ->has(Permission::factory()->state([
                'resource' => 'permission',
            ]))
            ->state([
                'name' => 'Admin',
                'slug' => 'admin',
            ])
        )
        ->create();

    $this->actingAs($user);

    $inputPermission = [
        'resource' => 'permission',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'],
    ];

    $response = $this->post('/permissions', $inputPermission);

    $response->assertStatus(302)
        ->assertRedirect('/permissions');

    $this->assertDatabaseHas('roles', [
        'resource' => $inputPermission['resource'],
        'actions' => $inputPermission['actions']
    ]);
});

test('admin can update permissions', function () {

    $user = User::factory()
        ->has(Role::factory()
            ->has(Permission::factory()->state([
                'resource' => 'permission',
            ]))
            ->state([
                'name' => 'Admin',
                'slug' => 'admin',
            ])
        )
        ->create();

    //Create Permission
    $permission = Permission::factory()->create([
        'resource' => 'user',
    ]);

    $this->actingAs($user);

    $updatedData = [
        'resource' => 'manager'
    ];

    $response = $this->put("/permissions/$permission->id", $updatedData);

    $response->assertStatus(302)
        ->assertRedirect('/permissions');

    $this->assertDatabaseHas('roles', [
        'id' => $permission->id,
        'resource' => $permission['resource']
    ]);

    $record = DB::table('permissions')
        ->where('resource', $permission?->name)
        ->first();

    $this->assertNotNull($record);
});

test('admin can delete permissions', function () {
    $user = User::factory()
        ->has(Role::factory()
            ->has(Permission::factory()->state([
                'resource' => 'permission',
            ]))
            ->state([
                'name' => 'Admin',
                'slug' => 'admin',
            ])
        )
        ->create();

    $this->actingAs($user);

    $permission = Permission::factory()->create();

    $response = $this->delete("/permissions/$permission->id");

    $response->assertStatus(302)
        ->assertRedirect('/permissions');

    $this->assertSoftDeleted('permissions', [
        'id' => $permission->id
    ]);
});

test('admin can force delete permissions', function () {
    $user = User::factory()
        ->has(Role::factory()
            ->has(Permission::factory()->state([
                'resource' => 'permission',
            ]))
            ->state([
                'name' => 'Admin',
                'slug' => 'admin',
            ])
        )
        ->create();

    $this->actingAs($user);

    $permission = Permission::factory()->create();

    $response = $this->delete("/permissions/$permission->id/force");

    $response->assertStatus(302)
        ->assertRedirect('/permissions');

    $this->assertDatabaseMissing('permission', [
        'id' => $permission->id
    ]);
});

test('admin can restore permissions', function () {
    $user = User::factory()
        ->has(Role::factory()
            ->has(Permission::factory()->state([
                'resource' => 'permission',
            ]))
            ->state([
                'name' => 'Admin',
                'slug' => 'admin',
            ])
        )
        ->create();

    $this->actingAs($user);

    $permission = Permission::factory()->create();

    $response = $this->patch("permissions/$permission->id/restore");

    $response->assertStatus(302)
        ->assertRedirect('/permissions');

    // Assert that the role is no longer soft-deleted
    $this->assertDatabaseHas('roles', [
        'id' => $permission->id,
        'deleted_at' => null
    ]);

    // Or alternatively, use the model's methods
    $this->assertFalse(Role::withTrashed()->find($permission->id)?->trashed());
});
