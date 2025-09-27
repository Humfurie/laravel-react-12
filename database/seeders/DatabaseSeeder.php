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
            // Production environment - create minimal required data

            $actions = [
                'viewAny',  // List/index - view all records
                'view',     // Show - view single record
                'create',   // Create new record
                'update',   // Edit/update existing record
                'delete',   // Delete record
                'restore',  // Restore soft-deleted record
                'forceDelete', // Permanently delete record
            ];

            // Create permissions
            Permission::firstOrCreate([
                'resource' => 'user',
            ], [
                'actions' => $actions
            ]);

            Permission::firstOrCreate([
                'resource' => 'role',
            ], [
                'actions' => $actions
            ]);

            Permission::firstOrCreate([
                'resource' => 'permission',
            ], [
                'actions' => $actions
            ]);

            Permission::firstOrCreate([
                'resource' => 'blog',
            ], [
                'actions' => $actions
            ]);

            // Create admin role
            $adminRole = Role::firstOrCreate([
                'slug' => 'admin'
            ], [
                'name' => 'Admin',
                'description' => 'Administrator role with full access'
            ]);

            // Create admin user
            $user = User::firstOrCreate([
                'email' => config('app.user_account_email', 'admin@example.com')
            ], [
                'name' => config('app.user_account_name', 'Admin'),
                'email_verified_at' => now(),
                'password' => bcrypt(config('app.user_account_password', 'password')),
            ]);

            // Attach admin role to user
            if ($adminRole && $user && !$user->roles()->where('role_id', $adminRole->id)->exists()) {
                $user->roles()->attach($adminRole->id);
            }
//        }
    }
}
