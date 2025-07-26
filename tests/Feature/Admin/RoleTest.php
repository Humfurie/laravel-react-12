<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

test('admin can get all role', function () {
    $roles = Role::factory()->count(5)->create();

    $user = User::factory()->createOne();

    $user->roles()->attach($roles->pluck('id')->first());

    $this->actingAs($user);

    $response = $this->get('/roles');

    $response->assertStatus(200)
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('admin/role') // The React component name
            ->has('roles', 5) // Assert we have 5 roles
            ->hasAll([
                'roles.0.name',
                'roles.0.slug',
                'roles.0.permissions',
            ])
        );

});

/**
 * @throws JsonException
 */
test('admin can create role', function () {

    $role = Role::factory()->createOne([
        'name' => 'Admin',
        'slug' => 'admin',
    ]);

    $permission = Permission::factory()->create([
        'resource' => 'user',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);

    $role->permissions()->attach($permission->id, ['actions' => json_encode(['user.viewAny', 'user.view', 'user.create', 'user.update', 'user.delete', 'user.restore', 'user.forceDelete'], JSON_THROW_ON_ERROR)]);

    $user = User::factory()->createOne();

    $user->roles()->attach($role->id);

    $this->actingAs($user);

    $inputRole = [
        'name' => 'Manager',
        'slug' => 'manager',
        'permissions' => ['user.viewAny', 'user.view', 'role.viewAny', 'role.view']
    ];

    $response = $this->post('/roles', $inputRole);

    $response->assertStatus(302)
        ->assertRedirect('/roles');

    $this->assertDatabaseHas('roles', [
        'name' => $inputRole['name'],
        'slug' => $inputRole['slug']
    ]);
});

test('admin can update role', function () {
    // Create the Admin role
    $adminRole = Role::factory()->createOne([
        'name' => 'Admin',
        'slug' => 'admin',
    ]);

    // Create permissions
    $userPermission = Permission::factory()->create([
        'resource' => 'user',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);

    //Create Role
    $rolePermissions = Permission::factory()->create([
        'resource' => 'role',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);

    // Attach permissions to the Admin role with specific actions
    $adminRole->permissions()->attach($userPermission->id, [
        'actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)
    ]);

    // Assign permissions to admin role
    $adminRole->permissions()->attach($rolePermissions->id, [
        'actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)
    ]);

    // Create a second role (User)
    $userRole = Role::factory()->createOne([
        'name' => 'User',
        'slug' => 'user',
    ]);

    // Attach limited permissions to the User role
    $userRole->permissions()->attach($rolePermissions->id, [
        'actions' => json_encode(['viewAny', 'view'], JSON_THROW_ON_ERROR)
    ]);

    $user = User::factory()->createOne();

    $user->roles()->attach($adminRole->id);

    $this->actingAs($user);

    $updatedData = [
        'name' => 'Updated Editor',
        'slug' => 'updated-editor',
        'permissions' => ['user.viewAny', 'user.view', 'role.viewAny', 'role.view']
    ];

    $response = $this->put("/roles/$userRole->slug", $updatedData);

    $response->assertStatus(302)
        ->assertRedirect('/roles');

    $this->assertDatabaseHas('roles', [
        'id' => $userRole->id,
        'name' => 'Updated Editor',
        'slug' => 'updated-editor',
    ]);

    $record = DB::table('permission_role')
        ->where('role_id', $userRole->id)
        ->where('permission_id', $userPermission->id)
        ->first();

    $this->assertNotNull($record);
    $this->assertJsonStringEqualsJsonString(
        json_encode(['viewAny', 'view'], JSON_THROW_ON_ERROR),
        $record->actions
    );

});

test('admin can delete role', function () {
    // Create the Admin role
    $adminRole = Role::factory()->createOne([
        'name' => 'Admin',
        'slug' => 'admin',
    ]);

    // Create permissions
    $userPermission = Permission::factory()->create([
        'resource' => 'user',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);

    //Create Role
    $rolePermissions = Permission::factory()->create([
        'resource' => 'role',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);

    // Attach permissions to the Admin role with specific actions
    $adminRole->permissions()->attach($userPermission->id, [
        'actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)
    ]);

    // Assign permissions to admin role
    $adminRole->permissions()->attach($rolePermissions->id, [
        'actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)
    ]);

    $user = User::factory()->createOne();

    $user->roles()->attach($adminRole->id);

    $this->actingAs($user);

    $response = $this->delete("/roles/$adminRole->slug");

    $response->assertStatus(302)
        ->assertRedirect('/roles');

    $this->assertSoftDeleted('roles', [
        'id' => $adminRole->id
    ]);
});

test('admin can restore role', function () {
    // Create the Admin role
    $adminRole = Role::factory()->createOne([
        'name' => 'Admin',
        'slug' => 'admin',
    ]);

    // Create permissions
    $userPermission = Permission::factory()->create([
        'resource' => 'user',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);

    //Create Role
    $rolePermissions = Permission::factory()->create([
        'resource' => 'role',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);

    // Attach permissions to the Admin role with specific actions
    $adminRole->permissions()->attach($userPermission->id, [
        'actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)
    ]);

    // Assign permissions to admin role
    $adminRole->permissions()->attach($rolePermissions->id, [
        'actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)
    ]);

    // Create a second role (User)
    $userRole = Role::factory()->createOne([
        'name' => 'User',
        'slug' => 'user',
    ]);

    // Attach limited permissions to the User role
    $userRole->permissions()->attach($rolePermissions->id, [
        'actions' => json_encode(['viewAny', 'view'], JSON_THROW_ON_ERROR)
    ]);

    $user = User::factory()->createOne();

    $user->roles()->attach($adminRole->id);

    $this->actingAs($user);

    $userRole->delete();

    $response = $this->patch("roles/$userRole->slug/restore");

    $response->assertStatus(302)
        ->assertRedirect('/roles');

    // Assert that the role is no longer soft-deleted
    $this->assertDatabaseHas('roles', [
        'id' => $userRole->id,
        'deleted_at' => null
    ]);

    // Or alternatively, use the model's methods
    $this->assertFalse(Role::withTrashed()->find($userRole->id)?->trashed());

});

test('admin can force delete role', function () {
    // Create the Admin role
    $adminRole = Role::factory()->createOne([
        'name' => 'Admin',
        'slug' => 'admin',
    ]);

    // Create permissions
    $userPermission = Permission::factory()->create([
        'resource' => 'user',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);

    //Create Role
    $rolePermissions = Permission::factory()->create([
        'resource' => 'role',
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);

    // Attach permissions to the Admin role with specific actions
    $adminRole->permissions()->attach($userPermission->id, [
        'actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)
    ]);

    // Assign permissions to admin role
    $adminRole->permissions()->attach($rolePermissions->id, [
        'actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)
    ]);

    $user = User::factory()->createOne();

    $user->roles()->attach($adminRole->id);

    $this->actingAs($user);

    // Create a second role (User)
    $userRole = Role::factory()->createOne([
        'name' => 'User',
        'slug' => 'user',
    ]);

    // Attach limited permissions to the User role
    $userRole->permissions()->attach($rolePermissions->id, [
        'actions' => json_encode(['viewAny', 'view'], JSON_THROW_ON_ERROR)
    ]);

    $response = $this->delete("/roles/$userRole->slug/force");

    $response->assertStatus(302)
        ->assertRedirect('/roles');

    $this->assertDatabaseMissing('roles', [
        'id' => $userRole->id
    ]);
});


