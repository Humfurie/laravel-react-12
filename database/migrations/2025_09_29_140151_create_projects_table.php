<?php

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
        Schema::create('real_estate_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('developer_id')->constrained()->onDelete('cascade');
            $table->string('name')->index();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('project_type', 50)->index(); // 'condominium', 'house_and_lot', 'townhouse', 'commercial'
            $table->text('address')->nullable();
            $table->string('city', 100)->index();
            $table->string('province', 100)->index();
            $table->string('region', 100)->index();
            $table->string('country', 50)->default('Philippines');
            $table->string('postal_code', 20)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('turnover_date', 100)->nullable(); // e.g., '2027-2028'
            $table->integer('completion_year')->nullable();
            $table->string('status', 50)->default('pre-selling')->index(); // 'pre-selling', 'ready_for_occupancy', 'completed'
            $table->integer('total_units')->nullable();
            $table->integer('total_floors')->nullable();
            $table->json('amenities')->nullable(); // Array of amenities
            $table->json('images')->nullable(); // Array of image URLs
            $table->string('virtual_tour_url', 500)->nullable();
            $table->boolean('featured')->default(false)->index();
            $table->timestamps();

            // Indexes
            $table->index(['city', 'province', 'region']);
            $table->index(['project_type', 'status']);
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('real_estate_projects');
    }
};
