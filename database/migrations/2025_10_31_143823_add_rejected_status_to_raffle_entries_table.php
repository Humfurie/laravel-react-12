<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the existing check constraint
        DB::statement("
            ALTER TABLE raffle_entries
            DROP CONSTRAINT IF EXISTS raffle_entries_status_check
        ");

        // Add the new constraint with 'rejected' status included
        DB::statement("
            ALTER TABLE raffle_entries
            ADD CONSTRAINT raffle_entries_status_check
            CHECK (status IN ('pending', 'verified', 'winner', 'rejected'))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original constraint
        DB::statement("
            ALTER TABLE raffle_entries
            DROP CONSTRAINT IF EXISTS raffle_entries_status_check
        ");

        DB::statement("
            ALTER TABLE raffle_entries
            ADD CONSTRAINT raffle_entries_status_check
            CHECK (status IN ('pending', 'verified', 'winner'))
        ");
    }
};
