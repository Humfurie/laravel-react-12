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
        // Add featured_until column to blogs table
        Schema::table('blogs', function (Blueprint $table) {
            $table->timestamp('featured_until')->nullable()->after('isPrimary');
        });

        // Create blog_views table to track daily views for trending calculation
        Schema::create('blog_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blog_id')->constrained()->onDelete('cascade');
            $table->date('view_date');
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamps();

            // Unique constraint to ensure one record per blog per day
            $table->unique(['blog_id', 'view_date']);

            // Index for efficient querying
            $table->index(['view_date', 'view_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_views');

        Schema::table('blogs', function (Blueprint $table) {
            $table->dropColumn('featured_until');
        });
    }
};
