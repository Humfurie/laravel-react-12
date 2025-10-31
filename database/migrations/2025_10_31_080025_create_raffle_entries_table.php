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
        Schema::create('raffle_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Raffle::class)->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone');
            $table->string('facebook_url');
            $table->enum('status', ['pending', 'verified', 'winner'])->default('pending');
            $table->timestamp('entry_date')->useCurrent();
            $table->timestamps();

            // Ensure phone number is unique per raffle
            $table->unique(['raffle_id', 'phone']);
            $table->index(['raffle_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('raffle_entries');
    }
};
