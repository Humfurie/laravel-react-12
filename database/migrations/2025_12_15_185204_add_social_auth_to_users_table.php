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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable()->after('name');
            $table->text('bio')->nullable()->after('telephone');
            $table->string('avatar_url')->nullable()->after('bio');
            $table->string('github_username')->nullable()->after('avatar_url');
            $table->string('google_id')->nullable()->after('github_username');
            $table->string('facebook_id')->nullable()->after('google_id');
            $table->string('github_id')->nullable()->after('facebook_id');
            $table->json('github_contributions')->nullable()->after('github_id');
            $table->timestamp('github_synced_at')->nullable()->after('github_contributions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'bio',
                'avatar_url',
                'github_username',
                'google_id',
                'facebook_id',
                'github_id',
                'github_contributions',
                'github_synced_at',
            ]);
        });
    }
};
