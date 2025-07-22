<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
        ]);

        $adminRole = Role::where('slug', 'admin')->first();
        $firstUser = User::first();

        if ($adminRole && $firstUser) {
            $firstUser->roles()->attach($adminRole->id);
        }

    }
}
