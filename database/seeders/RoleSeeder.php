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
        $role = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin', 'slug' => 'admin']
        );

        // Clear existing permissions before re-attaching
        $role->permissions()->detach();

        $permissions = Permission::all();

        foreach ($permissions as $permission) {
            $role->permissions()->attach($permission->id, ['actions' => json_encode($permission->actions, JSON_THROW_ON_ERROR)]);
        }
    }
}
