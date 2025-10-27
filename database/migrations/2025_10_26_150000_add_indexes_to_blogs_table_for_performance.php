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
        Schema::table('blogs', function (Blueprint $table) {
            // Index for published status and date queries (most common query)
            $table->index(['status', 'published_at'], 'blogs_status_published_at_index');

            // Index for primary blog filtering
            $table->index(['isPrimary', 'published_at'], 'blogs_is_primary_published_at_index');

            // Index for slug lookups (route model binding)
            $table->index('slug', 'blogs_slug_index');

            // Index for view count sorting (if needed)
            $table->index('view_count', 'blogs_view_count_index');

            // Index for sort order
            $table->index('sort_order', 'blogs_sort_order_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropIndex('blogs_status_published_at_index');
            $table->dropIndex('blogs_is_primary_published_at_index');
            $table->dropIndex('blogs_slug_index');
            $table->dropIndex('blogs_view_count_index');
            $table->dropIndex('blogs_sort_order_index');
        });
    }
};
