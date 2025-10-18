<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Option 1: Use the automatic permission generation command
        // This will scan all models and create permissions automatically
        $this->command->info('Generating permissions from models...');
        Artisan::call('permissions:generate', ['--fresh' => true]);
        $this->command->info(Artisan::output());

        // Option 2: Manual permission creation (commented out)
        // Uncomment this section if you prefer manual control
        /*
        $actions = [
            'viewAny',  // List/index - view all records
            'view',     // Show - view single record
            'create',   // Create new record
            'update',   // Edit/update existing record
            'delete',   // Delete record
            'restore',  // Restore soft-deleted record
            'forceDelete', // Permanently delete record
        ];

        $resources = [
            'user',
            'role',
            'blog',
            'developer',
            'realestate-project',
            'property',
            'technology',
            'skill',
            'experience',
        ];

        foreach ($resources as $resource) {
            Permission::firstOrCreate(
                ['resource' => $resource],
                ['resource' => $resource, 'actions' => $actions]
            );
        }

        // Create wildcard permission for super admin
        Permission::firstOrCreate(
            ['resource' => '*'],
            ['resource' => '*', 'actions' => ['*']]
        );
        */
    }
}
