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
        $permissions = [
            'viewAny',  // List/index - view all records
            'view',     // Show - view single record
            'create',   // Create new record
            'update',   // Edit/update existing record
            'delete',   // Delete record
            'restore',  // Restore soft-deleted record
            'forceDelete', // Permanently delete record
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }
}
