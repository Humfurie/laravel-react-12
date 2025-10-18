<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use JsonException;

class RoleSeeder extends Seeder
{
    /**
     * @throws JsonException
     */
    public function run(): void
    {
        // Super Admin - has all permissions via wildcard
        $superAdmin = Role::firstOrCreate(
            ['slug' => 'super-admin'],
            ['name' => 'Super Admin', 'slug' => 'super-admin']
        );
        $superAdmin->permissions()->detach();
        $wildcardPermission = Permission::where('resource', '*')->first();
        if ($wildcardPermission) {
            $superAdmin->permissions()->attach($wildcardPermission->id, [
                'actions' => json_encode(['*'], JSON_THROW_ON_ERROR),
            ]);
        }

        // Admin - has all permissions except wildcard
        $admin = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin', 'slug' => 'admin']
        );
        $admin->permissions()->detach();
        $allPermissions = Permission::where('resource', '!=', '*')->get();
        foreach ($allPermissions as $permission) {
            $admin->permissions()->attach($permission->id, [
                'actions' => json_encode($permission->actions, JSON_THROW_ON_ERROR),
            ]);
        }

        // User - limited permissions
        $user = Role::firstOrCreate(
            ['slug' => 'user'],
            ['name' => 'User', 'slug' => 'user']
        );
        $user->permissions()->detach();

        // Example: Give user role view-only access to blog
        $blogPermission = Permission::where('resource', 'blog')->first();
        if ($blogPermission) {
            $user->permissions()->attach($blogPermission->id, [
                'actions' => json_encode(['viewAny', 'view'], JSON_THROW_ON_ERROR),
            ]);
        }
    }
}
