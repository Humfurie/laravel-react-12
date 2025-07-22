<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::factory()->create(['name' => 'Admin', 'slug' => 'admin']);

        $permissions = Permission::all();

        foreach ($permissions as $permission) {
            $role->permissions()->attach($permission->id);
        }
    }
}
