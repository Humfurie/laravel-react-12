<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add check constraints for data integrity (defense in depth)
        DB::statement("ALTER TABLE deployments ADD CONSTRAINT deployments_client_type_check CHECK (client_type IN ('family', 'friend', 'business', 'personal'))");
        DB::statement("ALTER TABLE deployments ADD CONSTRAINT deployments_status_check CHECK (status IN ('active', 'maintenance', 'archived'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE deployments DROP CONSTRAINT IF EXISTS deployments_client_type_check');
        DB::statement('ALTER TABLE deployments DROP CONSTRAINT IF EXISTS deployments_status_check');
    }
};
