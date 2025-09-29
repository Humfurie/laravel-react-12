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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('real_estate_projects')->onDelete('cascade');
            $table->string('title')->index();
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Unit Details
            $table->string('unit_number', 50)->nullable();
            $table->integer('floor_level')->nullable();
            $table->string('building_phase', 50)->nullable(); // 'Tower A', 'Phase 1', etc.
            $table->string('property_type', 50)->index(); // 'studio', '1br', '2br', '3br', 'penthouse'

            // Dimensions
            $table->decimal('floor_area', 10, 2)->nullable(); // in square meters
            $table->string('floor_area_unit', 10)->default('sq.m.');
            $table->decimal('balcony_area', 10, 2)->nullable();

            // Room Details
            $table->integer('bedrooms')->nullable();
            $table->decimal('bathrooms', 3, 1)->nullable(); // Allows 1.5, 2.5, etc.
            $table->integer('parking_spaces')->default(0);

            // Orientation & View
            $table->string('orientation', 50)->nullable(); // 'North', 'South', 'East', 'West'
            $table->string('view_type', 100)->nullable(); // 'City View', 'Sea View', 'Mountain View'

            // Status
            $table->string('listing_status', 50)->default('available')->index(); // 'available', 'reserved', 'sold', 'not_available'

            // Features
            $table->json('features')->nullable(); // Array of features
            $table->json('images')->nullable(); // Array of image URLs
            $table->string('floor_plan_url', 500)->nullable();

            // Metadata
            $table->boolean('featured')->default(false)->index();
            $table->integer('view_count')->default(0);

            // Legacy/Compatibility fields (from original migration)
            $table->string('status')->default('available')->index(); // Compatibility with old tests
            $table->string('listing_type')->nullable(); // sale, rent, lease
            $table->decimal('price', 12, 2)->nullable();
            $table->string('currency', 3)->default('PHP');
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamp('listed_at')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('agent_license')->nullable();

            // Additional legacy fields from original migration
            $table->decimal('square_feet', 8, 2)->nullable();
            $table->decimal('lot_size', 10, 2)->nullable();
            $table->integer('year_built')->nullable();
            $table->string('garage_type')->nullable(); // attached, detached, carport, none
            $table->string('virtual_tour_url')->nullable();
            $table->json('meta_data')->nullable(); // SEO and additional data

            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index(['property_type', 'listing_status']);
            $table->index(['bedrooms', 'bathrooms']);
            $table->index(['floor_level', 'building_phase']);
            $table->index(['city', 'state', 'country']);
            $table->index(['price', 'listing_type']);
            $table->index(['latitude', 'longitude']);
            $table->index(['property_type', 'listing_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
