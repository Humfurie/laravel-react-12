<?php

namespace App\Console\Commands;

use App\Models\Blog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class FixBlogImageUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blogs:fix-image-urls {--dry-run : Show what would be changed without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convert blog featured_image URLs from MinIO direct URLs to /storage/ proxy URLs';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('DRY RUN - No changes will be made');
        }

        // Pattern to match MinIO direct URLs
        // e.g., https://minio.humfurie.org/laravel-uploads/blog-images/filename.jpg
        $pattern = '#^https?://[^/]+/laravel-uploads/(.+)$#';

        $blogs = Blog::whereNotNull('featured_image')
            ->where('featured_image', 'like', 'http%')
            ->get();

        $this->info("Found {$blogs->count()} blogs with HTTP URLs");

        $updated = 0;
        foreach ($blogs as $blog) {
            if (preg_match($pattern, $blog->featured_image, $matches)) {
                $newUrl = '/storage/'.$matches[1];

                $this->line("Blog #{$blog->id}: {$blog->title}");
                $this->line("  Old: {$blog->featured_image}");
                $this->line("  New: {$newUrl}");

                if (! $dryRun) {
                    // Use save() to trigger model observers for cache invalidation
                    $blog->featured_image = $newUrl;
                    $blog->save();
                }

                $updated++;
            } else {
                $this->warn("Blog #{$blog->id}: URL doesn't match pattern - {$blog->featured_image}");
            }
        }

        $action = $dryRun ? 'would be updated' : 'updated';
        $this->info("{$updated} blog(s) {$action}");

        // Clear additional caches that might contain image URLs
        if (! $dryRun && $updated > 0) {
            Cache::forget('homepage.blogs');
            Cache::forget(config('cache-ttl.keys.homepage_blogs'));
            Cache::forget('rss:feed');
            Cache::forget('sitemap:blogs');
            $this->info('Cleared related caches');
        }

        return Command::SUCCESS;
    }
}
