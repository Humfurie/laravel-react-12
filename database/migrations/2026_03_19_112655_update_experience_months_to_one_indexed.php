<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Convert months from 0-indexed (0=Jan, 11=Dec) to 1-indexed (1=Jan, 12=Dec).
     */
    public function up(): void
    {
        DB::table('experiences')->whereNotNull('start_month')->update([
            'start_month' => DB::raw('start_month + 1'),
        ]);

        DB::table('experiences')->whereNotNull('end_month')->update([
            'end_month' => DB::raw('end_month + 1'),
        ]);
    }

    /**
     * Revert months from 1-indexed back to 0-indexed.
     */
    public function down(): void
    {
        DB::table('experiences')->whereNotNull('start_month')->update([
            'start_month' => DB::raw('start_month - 1'),
        ]);

        DB::table('experiences')->whereNotNull('end_month')->update([
            'end_month' => DB::raw('end_month - 1'),
        ]);
    }
};
