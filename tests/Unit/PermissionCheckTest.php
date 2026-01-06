<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('admin user has all permissions', function () {
    // User with ID 1 is admin
    // Find existing admin or create if database is empty
    $admin = User::find(1);
    if (!$admin) {
        $admin = User::factory()->create(['id' => 1]);
    }

    expect($admin->isAdmin())->toBeTrue();
    expect($admin->hasPermission('developer', 'viewAny'))->toBeTrue();
    expect($admin->hasPermission('blog', 'create'))->toBeTrue();
    expect($admin->hasPermission('any-resource', 'any-action'))->toBeTrue();
});

test('user with specific permission can perform action', function () {
    $role = Role::factory()->create(['name' => 'Developer Manager']);
    $permission = Permission::firstOrCreate(
        ['resource' => 'developer'],
        ['actions' => ['viewAny', 'create', 'update']]
    );
    $permission->update(['actions' => ['viewAny', 'create', 'update']]);

    $role->permissions()->sync([
        $permission->id => ['actions' => json_encode(['viewAny', 'create'], JSON_THROW_ON_ERROR)]
    ]);
    $this->user->roles()->attach($role);

    expect($this->user->hasPermission('developer', 'viewAny'))->toBeTrue();
    expect($this->user->hasPermission('developer', 'create'))->toBeTrue();
    expect($this->user->hasPermission('developer', 'delete'))->toBeFalse();
});

test('user with wildcard resource permission can perform any action on that resource', function () {
    $role = Role::factory()->create(['name' => 'Developer Admin']);
    $permission = Permission::firstOrCreate(
        ['resource' => 'developer'],
        ['actions' => ['*']]
    );
    $permission->update(['actions' => ['*']]);

    $role->permissions()->sync([
        $permission->id => ['actions' => json_encode(['*'], JSON_THROW_ON_ERROR)]
    ]);
    $this->user->roles()->attach($role);

    expect($this->user->hasPermission('developer', 'viewAny'))->toBeTrue();
    expect($this->user->hasPermission('developer', 'create'))->toBeTrue();
    expect($this->user->hasPermission('developer', 'delete'))->toBeTrue();
    expect($this->user->hasPermission('blog', 'create'))->toBeFalse();
});

test('user with wildcard action permission can perform specific action on any resource', function () {
    $role = Role::factory()->create(['name' => 'Viewer']);
    $permission = Permission::firstOrCreate(
        ['resource' => '*'],
        ['actions' => ['viewAny']]
    );
    $permission->update(['actions' => ['viewAny']]);

    $role->permissions()->sync([
        $permission->id => ['actions' => json_encode(['viewAny'], JSON_THROW_ON_ERROR)]
    ]);
    $this->user->roles()->attach($role);

    expect($this->user->hasPermission('developer', 'viewAny'))->toBeTrue();
    expect($this->user->hasPermission('blog', 'viewAny'))->toBeTrue();
    expect($this->user->hasPermission('developer', 'create'))->toBeFalse();
});

test('user with full wildcard permission can perform any action on any resource', function () {
    $role = Role::factory()->create(['name' => 'Super Admin']);
    $permission = Permission::firstOrCreate(
        ['resource' => '*'],
        ['actions' => ['*']]
    );
    $permission->update(['actions' => ['*']]);

    $role->permissions()->sync([
        $permission->id => ['actions' => json_encode(['*'], JSON_THROW_ON_ERROR)]
    ]);
    $this->user->roles()->attach($role);

    expect($this->user->hasPermission('developer', 'viewAny'))->toBeTrue();
    expect($this->user->hasPermission('blog', 'create'))->toBeTrue();
    expect($this->user->hasPermission('any-resource', 'any-action'))->toBeTrue();
});

test('user without permission cannot perform action', function () {
    $role = Role::factory()->create(['name' => 'Basic User']);

    $this->user->roles()->attach($role);

    expect($this->user->hasPermission('developer', 'viewAny'))->toBeFalse();
    expect($this->user->hasPermission('blog', 'create'))->toBeFalse();
});
