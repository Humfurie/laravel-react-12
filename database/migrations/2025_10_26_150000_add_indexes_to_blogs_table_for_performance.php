<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $connection = Schema::getConnection();
            $dbName = $connection->getDatabaseName();
            $driver = $connection->getDriverName();

            // Helper function to check if index exists
            $indexExists = function ($indexName) use ($connection, $dbName, $driver) {
                if ($driver === 'pgsql') {
                    $result = DB::select(
                        "SELECT 1 FROM pg_indexes WHERE indexname = ?",
                        [$indexName]
                    );
                    return !empty($result);
                } elseif ($driver === 'mysql') {
                    $result = DB::select(
                        "SELECT 1 FROM information_schema.statistics
                         WHERE table_schema = ? AND table_name = 'blogs' AND index_name = ?",
                        [$dbName, $indexName]
                    );
                    return !empty($result);
                }
                return false;
            };

            // Index for published status and date queries (most common query)
            if (!$indexExists('blogs_status_published_at_index')) {
                $table->index(['status', 'published_at'], 'blogs_status_published_at_index');
            }

            // Index for primary blog filtering
            if (!$indexExists('blogs_is_primary_published_at_index')) {
                $table->index(['isPrimary', 'published_at'], 'blogs_is_primary_published_at_index');
            }

            // Index for slug lookups (route model binding)
            if (!$indexExists('blogs_slug_index')) {
                $table->index('slug', 'blogs_slug_index');
            }

            // Index for view count sorting (if needed)
            if (!$indexExists('blogs_view_count_index')) {
                $table->index('view_count', 'blogs_view_count_index');
            }

            // Index for sort order
            if (!$indexExists('blogs_sort_order_index')) {
                $table->index('sort_order', 'blogs_sort_order_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $connection = Schema::getConnection();
            $driver = $connection->getDriverName();

            // Helper function to check if index exists
            $indexExists = function ($indexName) use ($connection, $driver) {
                if ($driver === 'pgsql') {
                    $result = DB::select(
                        "SELECT 1 FROM pg_indexes WHERE indexname = ?",
                        [$indexName]
                    );
                    return !empty($result);
                } elseif ($driver === 'mysql') {
                    $dbName = $connection->getDatabaseName();
                    $result = DB::select(
                        "SELECT 1 FROM information_schema.statistics
                         WHERE table_schema = ? AND table_name = 'blogs' AND index_name = ?",
                        [$dbName, $indexName]
                    );
                    return !empty($result);
                }
                return false;
            };

            if ($indexExists('blogs_status_published_at_index')) {
                $table->dropIndex('blogs_status_published_at_index');
            }
            if ($indexExists('blogs_is_primary_published_at_index')) {
                $table->dropIndex('blogs_is_primary_published_at_index');
            }
            if ($indexExists('blogs_slug_index')) {
                $table->dropIndex('blogs_slug_index');
            }
            if ($indexExists('blogs_view_count_index')) {
                $table->dropIndex('blogs_view_count_index');
            }
            if ($indexExists('blogs_sort_order_index')) {
                $table->dropIndex('blogs_sort_order_index');
            }
        });
    }
};
