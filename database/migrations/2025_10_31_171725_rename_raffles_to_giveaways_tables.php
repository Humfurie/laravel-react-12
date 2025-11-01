<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Rename raffles table to giveaways
        Schema::rename('raffles', 'giveaways');

        // Rename raffle_entries table to giveaway_entries
        Schema::rename('raffle_entries', 'giveaway_entries');

        // Update the foreign key column name in giveaway_entries
        Schema::table('giveaway_entries', function (Blueprint $table) {
            $table->renameColumn('raffle_id', 'giveaway_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the column rename
        Schema::table('giveaway_entries', function (Blueprint $table) {
            $table->renameColumn('giveaway_id', 'raffle_id');
        });

        // Reverse the table renames
        Schema::rename('giveaway_entries', 'raffle_entries');
        Schema::rename('giveaways', 'raffles');
    }
};
