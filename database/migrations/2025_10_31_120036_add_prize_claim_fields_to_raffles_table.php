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
        Schema::table('raffles', function (Blueprint $table) {
            $table->boolean('prize_claimed')->nullable()->after('winner_id');
            $table->timestamp('prize_claimed_at')->nullable()->after('prize_claimed');
            $table->text('rejection_reason')->nullable()->after('prize_claimed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->dropColumn(['prize_claimed', 'prize_claimed_at', 'rejection_reason']);
        });
    }
};
