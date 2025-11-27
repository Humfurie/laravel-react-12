<?php

namespace Database\Seeders;

use App\Models\Permission;
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
        // Always run core seeders (permissions, roles, admin user)
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
        ]);

        // Only run demo/fake data seeders in local environment
        if (app()->environment('local')) {
            $this->call([
                BlogSeeder::class,
                AboutSeeder::class,
                SkillsSeeder::class,
                ExperienceSeeder::class,
                ExpertiseSeeder::class,
            ]);
        }
    }
}
