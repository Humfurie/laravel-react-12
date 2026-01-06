<?php

namespace Database\Seeders;

use App\Models\Blog;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

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

        $this->command->info('Creating blog posts...');

        // Create 3 primary/featured blog posts
        $primaryBlogs = Blog::factory()
            ->published()
            ->primary()
            ->popular()
            ->count(3)
            ->create();
        $this->attachMinIOImages($primaryBlogs);

        // Create 10 regular published blog posts
        $regularBlogs = Blog::factory()
            ->published()
            ->count(10)
            ->create();
        $this->attachMinIOImages($regularBlogs);

        // Create 5 draft blog posts
        $draftBlogs = Blog::factory()
            ->draft()
            ->count(5)
            ->create();
        $this->attachMinIOImages($draftBlogs);

        // Create 2 private blog posts
        $privateBlogs = Blog::factory()
            ->count(2)
            ->state(['status' => 'private'])
            ->create();
        $this->attachMinIOImages($privateBlogs);

        // Create some popular posts
        $popularBlogs = Blog::factory()
            ->published()
            ->popular()
            ->count(3)
            ->create();
        $this->attachMinIOImages($popularBlogs);

        // Create posts with specific featured images
        $featuredBlogs = Blog::factory()
            ->published()
            ->withFeaturedImage()
            ->count(5)
            ->create();
        $this->attachMinIOImages($featuredBlogs);

        // Create posts without featured images (will extract from content)
        Blog::factory()
            ->published()
            ->withoutFeaturedImage()
            ->count(5)
            ->create();

        $this->command->info('Blog seeding completed successfully!');
    }

    /**
     * Attach images to blogs using polymorphic relationship
     */
    private function attachMinIOImages($blogs): void
    {
        // Determine which disk to use based on configuration
        $disk = config('filesystems.default');

        foreach ($blogs as $blog) {
            // Generate a sample image using picsum.photos (reliable service)
            $imageUrl = "https://picsum.photos/800/600";

            try {
                // Download the image
                $response = Http::timeout(10)->get($imageUrl);

                if ($response->successful()) {
                    $imageContent = $response->body();
                    $filename = 'blog-' . $blog->id . '-' . uniqid() . '.jpg';
                    $storagePath = 'images/blogs/' . $filename;

                    // Upload to the configured disk (minio in production, public in local)
                    Storage::disk($disk)->put($storagePath, $imageContent);

                    // Create polymorphic image relationship
                    $blog->image()->create([
                        'name' => $filename,
                        'path' => $storagePath,
                    ]);

                    // Clear the featured_image field since we're using polymorphic relationship
                    $blog->update(['featured_image' => null]);

                    $this->command->info("Uploaded image for blog: {$blog->title}");
                } else {
                    $this->command->warn("Failed to download image for blog {$blog->id}");
                }
            } catch (\Exception $e) {
                $this->command->warn("Error uploading image for blog {$blog->id}: {$e->getMessage()}");
            }
        }
    }
}
