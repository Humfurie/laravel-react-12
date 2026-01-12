<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * Creates the social_posts table to store scheduled and published social media posts.
     * Each post is associated with a specific social account and can be scheduled for future publishing.
     */
    public function up(): void
    {
        Schema::create('social_posts', function (Blueprint $table) {
            $table->id();

            // Foreign key to users table - who created this post
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Foreign key to social_accounts table - which account will publish this
            $table->foreignId('social_account_id')
                ->constrained()
                ->cascadeOnDelete();

            // Post title (primarily for YouTube videos)
            $table->string('title')->nullable();

            // Post description/caption
            $table->text('description')->nullable();

            // Hashtags as JSON array (e.g., ["travel", "vlog", "adventure"])
            $table->json('hashtags')->nullable();

            // Local video file path in storage
            $table->string('video_path')->nullable();

            // Video URL on the platform after publishing
            $table->string('video_url')->nullable();

            // Local thumbnail file path in storage
            $table->string('thumbnail_path')->nullable();

            // Thumbnail URL on the platform after publishing
            $table->string('thumbnail_url')->nullable();

            // Platform's post/video ID (e.g., YouTube video ID, Instagram media ID)
            $table->string('platform_post_id')->nullable()->index();

            // Post status: draft, scheduled, processing, published, failed
            $table->enum('status', ['draft', 'scheduled', 'processing', 'published', 'failed'])->default('draft');

            // When the post is scheduled to be published
            $table->timestamp('scheduled_at')->nullable()->index();

            // When the post was actually published to the platform
            $table->timestamp('published_at')->nullable()->index();

            // Error message if publishing failed
            $table->text('error_message')->nullable();

            // Platform-specific metadata (visibility, privacy settings, etc.)
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['user_id', 'status']); // Find user's posts by status
            $table->index(['social_account_id', 'status']); // Find account's posts by status
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_posts');
    }
};
