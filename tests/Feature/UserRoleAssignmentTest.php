<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    // Clear any existing users in this test's transaction
    DB::table('users')->delete();

    // Reset auto-increment for PostgreSQL
    if (DB::getDriverName() === 'pgsql') {
        DB::statement("SELECT setval('users_id_seq', 1, false)");
    } elseif (DB::getDriverName() === 'mysql') {
        DB::statement("ALTER TABLE users AUTO_INCREMENT = 1");
    } elseif (DB::getDriverName() === 'sqlite') {
        DB::statement("DELETE FROM sqlite_sequence WHERE name = 'users'");
    }

    // Create a user with permissions to manage users
    $this->adminUser = User::factory()->create();
    $role = Role::factory()->create(['name' => 'User Manager']);
    $permission = Permission::firstOrCreate(
        ['resource' => 'user'],
        ['actions' => ['viewAny', 'create', 'update', 'delete']]
    );
    $permission->update(['actions' => ['viewAny', 'create', 'update', 'delete']]);
    $role->permissions()->sync([
        $permission->id => ['actions' => json_encode(['viewAny', 'create', 'update', 'delete'], JSON_THROW_ON_ERROR)]
    ]);
    $this->adminUser->roles()->attach($role);

    // Create test roles using firstOrCreate to avoid unique constraint violations
    $this->editorRole = Role::firstOrCreate(
        ['slug' => 'editor-test'],
        ['name' => 'Editor Test']
    );
    $this->viewerRole = Role::firstOrCreate(
        ['slug' => 'viewer-test'],
        ['name' => 'Viewer Test']
    );
});

test('user ID 1 cannot be deleted', function () {
    // Find or create user ID 1
    $superAdmin = User::find(1);
    if (!$superAdmin) {
        $superAdmin = User::factory()->create(['id' => 1]);
    }

    $this->actingAs($this->adminUser)
        ->delete(route('users.destroy', $superAdmin))
        ->assertForbidden();

    expect(User::find(1))->not->toBeNull();
});

test('user ID 1 cannot be force deleted', function () {
    // Find or create user ID 1
    $superAdmin = User::find(1);
    if (!$superAdmin) {
        $superAdmin = User::factory()->create(['id' => 1]);
    }

    $this->actingAs($this->adminUser)
        ->delete(route('users.forceDestroy', $superAdmin))
        ->assertForbidden();

    expect(User::find(1))->not->toBeNull();
});

test('user ID 1 cannot have roles assigned via assignRole endpoint', function () {
    // Find or create user ID 1
    $superAdmin = User::find(1);
    if (!$superAdmin) {
        $superAdmin = User::factory()->create(['id' => 1]);
    }

    $originalRoleIds = $superAdmin->roles->pluck('id')->toArray();

    $this->actingAs($this->adminUser)
        ->patch(route('users.assign-role', $superAdmin), [
            'role_ids' => [$this->editorRole->id],
        ])
        ->assertForbidden();

    // Roles should remain unchanged
    expect($superAdmin->fresh()->roles->pluck('id')->toArray())->toBe($originalRoleIds);
});

test('user ID 1 cannot have roles changed via update endpoint', function () {
    // Find or create user ID 1
    $superAdmin = User::find(1);
    if (!$superAdmin) {
        $superAdmin = User::factory()->create(['id' => 1]);
    }

    $originalRoleIds = $superAdmin->roles->pluck('id')->toArray();

    $this->actingAs($superAdmin)
        ->put(route('users.update', $superAdmin), [
            'name' => $superAdmin->name,
            'email' => $superAdmin->email,
            'role_ids' => [$this->viewerRole->id],
        ])
        ->assertRedirect();

    // Roles should remain unchanged even though update was successful
    expect($superAdmin->fresh()->roles->pluck('id')->toArray())->toBe($originalRoleIds);
});

test('regular user can have roles assigned', function () {
    $regularUser = User::factory()->create();

    $this->actingAs($this->adminUser)
        ->patch(route('users.assign-role', $regularUser), [
            'role_ids' => [$this->editorRole->id, $this->viewerRole->id],
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'User roles updated successfully.');

    expect($regularUser->fresh()->roles->pluck('id')->toArray())
        ->toContain($this->editorRole->id)
        ->toContain($this->viewerRole->id);
});

test('regular user can be deleted', function () {
    $regularUser = User::factory()->create();

    $this->actingAs($this->adminUser)
        ->delete(route('users.destroy', $regularUser))
        ->assertRedirect()
        ->assertSessionHas('success', 'User deleted successfully.');

    expect($regularUser->fresh()->trashed())->toBeTrue();
});

test('regular user roles can be updated', function () {
    $regularUser = User::factory()->create();
    $regularUser->roles()->attach($this->viewerRole);

    $this->actingAs($this->adminUser)
        ->put(route('users.update', $regularUser), [
            'name' => 'Updated Name',
            'email' => $regularUser->email,
            'role_ids' => [$this->editorRole->id],
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'User updated successfully.');

    $regularUser = $regularUser->fresh();
    expect($regularUser->name)->toBe('Updated Name');
    expect($regularUser->roles->pluck('id')->toArray())->toBe([$this->editorRole->id]);
});

test('user without permission cannot assign roles', function () {
    $regularUser = User::factory()->create();
    $unprivilegedUser = User::factory()->create();

    $this->actingAs($unprivilegedUser)
        ->patch(route('users.assign-role', $regularUser), [
            'role_ids' => [$this->editorRole->id],
        ])
        ->assertForbidden();
});

test('assignRole endpoint validates role_ids', function () {
    $regularUser = User::factory()->create();

    $this->actingAs($this->adminUser)
        ->patch(route('users.assign-role', $regularUser), [
            'role_ids' => [999999], // Non-existent role ID
        ])
        ->assertSessionHasErrors(['role_ids.0']);
});

test('assignRole endpoint requires role_ids array', function () {
    $regularUser = User::factory()->create();

    $this->actingAs($this->adminUser)
        ->patch(route('users.assign-role', $regularUser), [
            // Missing role_ids
        ])
        ->assertSessionHasErrors(['role_ids']);
});
