<?php

use App\Models\Permission;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    /**
     * Default actions for permissions
     */
    protected array $defaultActions = [
        'viewAny',
        'view',
        'create',
        'update',
        'delete',
        'restore',
        'forceDelete',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create 'project' permission for portfolio/website projects
        Permission::firstOrCreate(
            ['resource' => 'project'],
            [
                'resource' => 'project',
                'actions' => $this->defaultActions,
            ]
        );

        // Ensure 'realestate-project' permission exists for real estate projects
        Permission::firstOrCreate(
            ['resource' => 'realestate-project'],
            [
                'resource' => 'realestate-project',
                'actions' => $this->defaultActions,
            ]
        );

        // Create 'inquiry' permission for property inquiries
        Permission::firstOrCreate(
            ['resource' => 'inquiry'],
            [
                'resource' => 'inquiry',
                'actions' => $this->defaultActions,
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: We don't delete permissions on rollback as they may be in use by roles
        // If you need to remove them, uncomment the following:
        // Permission::where('resource', 'project')->delete();
        // Permission::where('resource', 'realestate-project')->delete();
    }
};
