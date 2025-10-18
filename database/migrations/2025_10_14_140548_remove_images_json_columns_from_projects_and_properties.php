<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * Removes the JSON 'images' columns from properties and real_estate_projects tables
     * since we're now using the polymorphic images table with proper Image model relationships.
     */
    public function up(): void
    {
        Schema::table('real_estate_projects', function (Blueprint $table) {
            $table->dropColumn('images');
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('images');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('real_estate_projects', function (Blueprint $table) {
            $table->json('images')->nullable();
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->json('images')->nullable();
        });
    }
};
