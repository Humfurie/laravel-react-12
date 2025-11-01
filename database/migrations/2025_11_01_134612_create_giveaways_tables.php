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
        // Create giveaways table first (without winner_id foreign key)
        Schema::create('giveaways', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->enum('status', ['draft', 'active', 'ended'])->default('draft');
            $table->unsignedBigInteger('winner_id')->nullable();
            $table->boolean('prize_claimed')->nullable();
            $table->timestamp('prize_claimed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['status', 'start_date', 'end_date'], 'giveaways_status_dates_index');
            $table->index('end_date', 'giveaways_end_date_index');
        });

        // Create giveaway_entries table
        Schema::create('giveaway_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('giveaway_id')->constrained('giveaways')->cascadeOnDelete();
            $table->string('name');
            $table->string('phone');
            $table->string('facebook_url');
            $table->enum('status', ['pending', 'verified', 'winner', 'rejected'])->default('pending');
            $table->timestamp('entry_date')->useCurrent();
            $table->timestamps();

            // Unique constraint: one phone per giveaway
            $table->unique(['giveaway_id', 'phone'], 'giveaway_entries_giveaway_phone_unique');

            // Indexes
            $table->index(['giveaway_id', 'phone'], 'giveaway_entries_giveaway_phone_index');
            $table->index('status', 'giveaway_entries_status_index');
            $table->index(['giveaway_id', 'status'], 'giveaway_entries_giveaway_status_index');
        });

        // Now add the foreign key constraint for winner_id
        Schema::table('giveaways', function (Blueprint $table) {
            $table->foreign('winner_id')
                ->references('id')
                ->on('giveaway_entries')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('giveaway_entries');
        Schema::dropIfExists('giveaways');
    }
};
