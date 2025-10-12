<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->string('position'); // Job title/position
            $table->string('company'); // Company name
            $table->string('location'); // Work location
            $table->json('description'); // Array of bullet points
            $table->unsignedTinyInteger('start_month'); // 0-11 (0 = January)
            $table->unsignedSmallInteger('start_year'); // e.g., 2023
            $table->unsignedTinyInteger('end_month')->nullable(); // null for current positions
            $table->unsignedSmallInteger('end_year')->nullable(); // null for current positions
            $table->boolean('is_current_position')->default(false);
            $table->unsignedInteger('display_order')->default(0); // For custom sorting
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};
