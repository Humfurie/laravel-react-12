<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * This migration handles the transition from "projects" (real estate)
     * to separate tables: "real_estate_projects" and "projects" (portfolio/website).
     */
    public function up(): void
    {
        // Step 1: Check if projects table has real estate schema (has developer_id column)
        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'developer_id')) {

            // Step 2: Create real_estate_projects if it doesn't exist
            if (!Schema::hasTable('real_estate_projects')) {
                Schema::create('real_estate_projects', function (Blueprint $table) {
                    $table->id();
                    $table->foreignId('developer_id')->constrained()->onDelete('cascade');
                    $table->string('name')->index();
                    $table->string('slug')->unique();
                    $table->text('description')->nullable();
                    $table->string('project_type', 50)->index();
                    $table->text('address')->nullable();
                    $table->string('city', 100)->index();
                    $table->string('province', 100)->index();
                    $table->string('region', 100)->index();
                    $table->string('country', 50)->default('Philippines');
                    $table->string('postal_code', 20)->nullable();
                    $table->decimal('latitude', 10, 8)->nullable();
                    $table->decimal('longitude', 11, 8)->nullable();
                    $table->string('turnover_date', 100)->nullable();
                    $table->integer('completion_year')->nullable();
                    $table->string('status', 50)->default('pre-selling')->index();
                    $table->integer('total_units')->nullable();
                    $table->integer('total_floors')->nullable();
                    $table->json('amenities')->nullable();
                    $table->string('virtual_tour_url', 500)->nullable();
                    $table->boolean('featured')->default(false)->index();
                    $table->timestamps();

                    $table->index(['city', 'province', 'region']);
                    $table->index(['project_type', 'status']);
                    $table->index(['latitude', 'longitude']);
                });
            }

            // Step 3: Migrate data from projects to real_estate_projects
            $columns = Schema::getColumnListing('projects');
            $realEstateColumns = Schema::getColumnListing('real_estate_projects');
            $commonColumns = array_intersect($columns, $realEstateColumns);

            // Remove 'id' from common columns to let it auto-increment
            $commonColumns = array_filter($commonColumns, fn($col) => $col !== 'id');

            if (!empty($commonColumns)) {
                $columnList = implode(', ', $commonColumns);
                DB::statement("INSERT INTO real_estate_projects ({$columnList}) SELECT {$columnList} FROM projects");
            }

            // Step 4: Update polymorphic image relationships
            DB::table('images')
                ->where('imageable_type', 'App\\Models\\Project')
                ->update(['imageable_type' => 'App\\Models\\RealEstateProject']);

            // Step 5: Drop the old projects table
            Schema::dropIfExists('projects');
        }

        // Step 6: Create the new projects table (for portfolio/website projects)
        if (!Schema::hasTable('projects')) {
            Schema::create('projects', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->longText('description');
                $table->text('short_description')->nullable();
                $table->string('category'); // web_app, mobile_app, api, library, cli, design
                $table->json('tech_stack')->nullable();
                $table->json('links')->nullable(); // {demo_url, repo_url, docs_url}
                $table->string('status')->default('development'); // live, archived, maintenance, development
                $table->boolean('is_featured')->default(false);
                $table->boolean('is_public')->default(true);
                $table->json('metrics')->nullable(); // {users, stars, downloads}
                $table->longText('case_study')->nullable();
                $table->json('testimonials')->nullable();
                $table->date('started_at')->nullable();
                $table->date('completed_at')->nullable();
                $table->timestamp('featured_at')->nullable();
                $table->integer('sort_order')->default(0);
                $table->unsignedInteger('view_count')->default(0);
                $table->softDeletes();
                $table->timestamps();

                $table->index(['status', 'is_public']);
                $table->index(['is_featured', 'sort_order']);
                $table->index('slug');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a complex migration - manual intervention required for rollback
        // Drop new projects table
        Schema::dropIfExists('projects');

        // Note: Data in real_estate_projects would need manual migration back
    }
};
