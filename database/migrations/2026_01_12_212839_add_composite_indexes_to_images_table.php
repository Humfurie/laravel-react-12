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
        Schema::table('images', function (Blueprint $table) {
            // Add composite index for polymorphic queries
            // This complements (not replaces) the individual morphs() indexes
            $table->index(['imageable_type', 'imageable_id'], 'images_morph_composite_index');

            // Add index for is_primary filtering (used in primaryImage() relationships)
            $table->index(['imageable_type', 'imageable_id', 'is_primary'], 'images_morph_primary_index');

            // Add index for order (used in ordered() scopes)
            $table->index(['imageable_type', 'imageable_id', 'order'], 'images_morph_order_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->dropIndex('images_morph_composite_index');
            $table->dropIndex('images_morph_primary_index');
            $table->dropIndex('images_morph_order_index');
        });
    }
};
