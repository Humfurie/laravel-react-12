<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only run in local environment to avoid creating fake content in production
        if (!app()->environment('local')) {
            return;
        }

        // Create 3 primary/featured blog posts
        \App\Models\Blog::factory()
            ->published()
            ->primary()
            ->popular()
            ->count(3)
            ->create();

        // Create 10 regular published blog posts
        \App\Models\Blog::factory()
            ->published()
            ->count(10)
            ->create();

        // Create 5 draft blog posts
        \App\Models\Blog::factory()
            ->draft()
            ->count(5)
            ->create();

        // Create 2 private blog posts
        \App\Models\Blog::factory()
            ->count(2)
            ->state(['status' => 'private'])
            ->create();

        // Create some popular posts
        \App\Models\Blog::factory()
            ->published()
            ->popular()
            ->count(3)
            ->create();

        // Create posts with specific featured images
        \App\Models\Blog::factory()
            ->published()
            ->withFeaturedImage()
            ->count(5)
            ->create();

        // Create posts without featured images (will extract from content)
        \App\Models\Blog::factory()
            ->published()
            ->withoutFeaturedImage()
            ->count(5)
            ->create();
    }
}
