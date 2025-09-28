<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $actions = [
            'viewAny',  // List/index - view all records
            'view',     // Show - view single record
            'create',   // Create new record
            'update',   // Edit/update existing record
            'delete',   // Delete record
            'restore',  // Restore soft-deleted record
            'forceDelete', // Permanently delete record
        ];

        Permission::firstOrCreate(
            ['resource' => 'user'],
            ['resource' => 'user', 'actions' => $actions]
        );

        Permission::firstOrCreate(
            ['resource' => 'role'],
            ['resource' => 'role', 'actions' => $actions]
        );

        Permission::firstOrCreate(
            ['resource' => 'blog'],
            ['resource' => 'blog', 'actions' => $actions]
        );

        // Create wildcard permission for admin role
        Permission::firstOrCreate(
            ['resource' => '*'],
            ['resource' => '*', 'actions' => ['*']]
        );
    }
}
