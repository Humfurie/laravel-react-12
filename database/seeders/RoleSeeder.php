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
        $role = Role::create(['name' => 'Admin', 'slug' => 'admin']);

        $permissions = Permission::all();

        foreach ($permissions as $permission) {
            $role->permissions()->attach($permission->id, ['actions' => json_encode($permission->actions, JSON_THROW_ON_ERROR)]);
        }
    }
}
