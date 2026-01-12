<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * Creates the social_accounts table to store user-connected social media accounts.
     * Supports multiple accounts per platform (e.g., 2 YouTube channels, 3 Instagram accounts).
     */
    public function up(): void
    {
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();

            // Foreign key to users table - who owns this account
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Platform identifier (youtube, facebook, instagram, tiktok, threads)
            $table->enum('platform', ['youtube', 'facebook', 'instagram', 'tiktok', 'threads']);

            // Platform's unique user ID (e.g., YouTube channel ID, Facebook Page ID)
            $table->string('platform_user_id')->index();

            // Platform username/handle (for display purposes)
            $table->string('username')->nullable();

            // Platform account name (e.g., YouTube channel name, Facebook Page name)
            $table->string('name')->nullable();

            // User's custom nickname for this account (e.g., "Personal", "Business")
            $table->string('nickname')->nullable();

            // Avatar/profile picture URL from the platform
            $table->string('avatar_url')->nullable();

            // OAuth access token (encrypted for security)
            $table->text('access_token');

            // OAuth refresh token (encrypted, nullable for platforms that don't provide it)
            $table->text('refresh_token')->nullable();

            // When the access token expires
            $table->timestamp('token_expires_at')->nullable();

            // OAuth scopes granted by the user (stored as JSON array)
            $table->json('scopes')->nullable();

            // Account status: active, expired, revoked, error
            $table->enum('status', ['active', 'expired', 'revoked', 'error'])->default('active');

            // Whether this is the default account for this platform
            $table->boolean('is_default')->default(false);

            // Platform-specific metadata (follower count, channel stats, etc.)
            $table->json('metadata')->nullable();

            // Last time we synced data from this account
            $table->timestamp('last_synced_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['user_id', 'platform']); // Find all accounts for a user on a platform
            $table->index('status'); // Filter by account status

            // Unique constraint: one user can't connect the same platform account twice
            $table->unique(['user_id', 'platform', 'platform_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
