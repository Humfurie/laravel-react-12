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
            // Social links (GitHub, LinkedIn, Facebook, Twitter, Website)
            $table->json('social_links')->nullable()->after('bio');

            // Resume/CV file path
            $table->string('resume_path')->nullable()->after('social_links');

            // Profile stats (years of experience, cups of coffee, custom stats)
            $table->json('profile_stats')->nullable()->after('resume_path');

            // Detailed about section (longer than bio)
            $table->text('about')->nullable()->after('profile_stats');

            // Headline/tagline
            $table->string('headline')->nullable()->after('about');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'social_links',
                'resume_path',
                'profile_stats',
                'about',
                'headline',
            ]);
        });
    }
};
