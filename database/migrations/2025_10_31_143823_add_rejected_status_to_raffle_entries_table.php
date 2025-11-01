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
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            // PostgreSQL: Drop and recreate the check constraint
            DB::statement("ALTER TABLE raffle_entries DROP CONSTRAINT IF EXISTS raffle_entries_status_check");
            DB::statement("ALTER TABLE raffle_entries ADD CONSTRAINT raffle_entries_status_check CHECK (status IN ('pending', 'verified', 'winner', 'rejected'))");
        } else {
            // MySQL: Use ALTER COLUMN with enum (Laravel's default behavior)
            Schema::table('raffle_entries', function (Blueprint $table) {
                $table->enum('status', ['pending', 'verified', 'winner', 'rejected'])
                    ->default('pending')
                    ->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            // PostgreSQL: Drop and recreate the check constraint
            DB::statement("ALTER TABLE raffle_entries DROP CONSTRAINT IF EXISTS raffle_entries_status_check");
            DB::statement("ALTER TABLE raffle_entries ADD CONSTRAINT raffle_entries_status_check CHECK (status IN ('pending', 'verified', 'winner'))");
        } else {
            // MySQL: Use ALTER COLUMN with enum
            Schema::table('raffle_entries', function (Blueprint $table) {
                $table->enum('status', ['pending', 'verified', 'winner'])
                    ->default('pending')
                    ->change();
            });
        }
    }
};
