<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * Creates the social_metrics table to store analytics data for posts and accounts.
     * Metrics are fetched periodically from platform APIs and stored for historical analysis.
     */
    public function up(): void
    {
        Schema::create('social_metrics', function (Blueprint $table) {
            $table->id();

            // Foreign key to social_posts table (nullable for account-level metrics)
            $table->foreignId('social_post_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            // Foreign key to social_accounts table (nullable for post-only metrics)
            $table->foreignId('social_account_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            // Type of metric: post_performance, account_analytics, audience_insights
            $table->enum('metric_type', ['post_performance', 'account_analytics', 'audience_insights']);

            // Date the metrics are for (allows tracking over time)
            $table->date('date')->index();

            // Number of views/impressions
            $table->bigInteger('views')->default(0);

            // Number of likes/favorites
            $table->bigInteger('likes')->default(0);

            // Number of comments
            $table->bigInteger('comments')->default(0);

            // Number of shares/retweets
            $table->bigInteger('shares')->default(0);

            // Number of saves/bookmarks (Instagram, TikTok)
            $table->bigInteger('saves')->default(0);

            // Total impressions (how many times shown in feeds)
            $table->bigInteger('impressions')->default(0);

            // Unique accounts reached
            $table->bigInteger('reach')->default(0);

            // Engagement rate as percentage (likes + comments + shares / reach * 100)
            $table->decimal('engagement_rate', 5, 2)->nullable();

            // Total watch time in seconds (for videos)
            $table->bigInteger('watch_time')->default(0);

            // Demographics breakdown (age, gender, location) as JSON
            $table->json('demographics')->nullable();

            // Platform-specific metrics as JSON
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index(['social_post_id', 'date']); // Track post metrics over time
            $table->index(['social_account_id', 'date']); // Track account metrics over time
            $table->index('metric_type'); // Filter by metric type
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_metrics');
    }
};
