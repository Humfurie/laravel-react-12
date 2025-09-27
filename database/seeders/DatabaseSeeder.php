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
//        if (app()->environment('local')) {
//            $this->call([
//                PermissionSeeder::class,
//                RoleSeeder::class,
//                UserSeeder::class,
//            ]);
//
//            $adminRole = Role::where('slug', 'admin')->first();
//            $firstUser = User::first();
//
//            if ($adminRole && $firstUser) {
//                $firstUser->roles()->attach($adminRole->id);
//            }
//        } else {

            $actions = [
                'viewAny',  // List/index - view all records
                'view',     // Show - view single record
                'create',   // Create new record
                'update',   // Edit/update existing record
                'delete',   // Delete record
                'restore',  // Restore soft-deleted record
                'forceDelete', // Permanently delete record
            ];

            Permission::create([
                'resource' => 'user',
                'actions' => $actions
            ]);

            Permission::create([
                'resource' => 'role',
                'actions' => $actions
            ]);

            $adminRole = Role::where('slug', 'admin')->first();
            $user = User::create([
                'name' => config('app.user_account_name'),
                'email' => config('app.user_account_email'),
                'email_verified_at' => now(),
                'password' => config('app.user_account_password'),
            ]);

            if ($adminRole && $user) {
                $user->roles()->attach($adminRole->id);
            }
        }
//    }
}
