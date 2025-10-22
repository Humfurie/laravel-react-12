<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

pest()->extend(Tests\TestCase::class)
 // ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature', 'Unit');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Create a user with admin role and specified permissions.
 *
 * @param string|array $resources Resource(s) to grant permissions for (e.g., 'blog', ['blog', 'user'])
 * @param array $actions Actions to grant (default: all CRUD actions)
 * @return User
 */
function createAdminUser(string|array $resources = [], array $actions = ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']): User
{
    $resources = is_string($resources) ? [$resources] : $resources;

    // Use firstOrCreate to avoid duplicate role errors
    $role = Role::firstOrCreate(
        ['slug' => 'admin'],
        ['name' => 'Admin']
    );

    // Attach permissions for each resource
    foreach ($resources as $resource) {
        $permission = Permission::firstOrCreate(
            ['resource' => $resource],
            ['actions' => $actions] // Provide default actions for the permission
        );

        // Only attach if not already attached
        if (!$role->permissions()->where('permission_id', $permission->id)->exists()) {
            $role->permissions()->attach($permission->id, [
                'actions' => json_encode($actions, JSON_THROW_ON_ERROR)
            ]);
        }
    }

    return User::factory()
        ->hasAttached($role)
        ->create();
}

/**
 * Create a user with a specific role and permissions.
 *
 * @param string $roleName
 * @param string $roleSlug
 * @param string|array $resources
 * @param array $actions
 * @return User
 */
function createUserWithRole(string $roleName, string $roleSlug, string|array $resources, array $actions = ['viewAny', 'view']): User
{
    $resources = is_string($resources) ? [$resources] : $resources;

    // Use firstOrCreate to avoid duplicate role errors
    $role = Role::firstOrCreate(
        ['slug' => $roleSlug],
        ['name' => $roleName]
    );

    foreach ($resources as $resource) {
        $permission = Permission::firstOrCreate(
            ['resource' => $resource],
            ['actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']] // All possible actions
        );

        // Only attach if not already attached
        if (!$role->permissions()->where('permission_id', $permission->id)->exists()) {
            $role->permissions()->attach($permission->id, [
                'actions' => json_encode($actions, JSON_THROW_ON_ERROR)
            ]);
        }
    }

    return User::factory()
        ->hasAttached($role)
        ->create();
}
