<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if index already exists (MySQL/MariaDB/PostgreSQL compatible)
        $indexExists = $this->indexExists('projects', 'project_category_id');

        if (! $indexExists) {
            Schema::table('projects', function (Blueprint $table) {
                $table->index('project_category_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if our explicit index exists (not the FK auto-index)
        $connection = DB::connection()->getDriverName();

        if ($connection === 'mysql') {
            $indexes = DB::select("SHOW INDEX FROM projects WHERE Key_name = 'projects_project_category_id_index'");
            if (count($indexes) > 0) {
                Schema::table('projects', function (Blueprint $table) {
                    $table->dropIndex(['project_category_id']);
                });
            }
        }
    }

    /**
     * Check if an index exists on the column.
     */
    private function indexExists(string $table, string $column): bool
    {
        $connection = DB::connection()->getDriverName();

        if ($connection === 'mysql') {
            $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Column_name = ?", [$column]);

            return count($indexes) > 0;
        }

        if ($connection === 'pgsql') {
            $result = DB::select("
                SELECT 1 FROM pg_indexes
                WHERE tablename = ?
                AND indexdef LIKE ?
            ", [$table, "%{$column}%"]);

            return count($result) > 0;
        }

        // SQLite and others - assume no index
        return false;
    }
};
