<?php

namespace App\Console\Commands;

use App\Models\Blog;
use Illuminate\Console\Command;

class FixPrimaryBlogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blogs:fix-primary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ensure only one blog is marked as primary (keeps the most recently published)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for multiple primary blogs...');

        // Get all primary blogs
        $primaryBlogs = Blog::where('isPrimary', true)->get();

        if ($primaryBlogs->count() === 0) {
            $this->info('No primary blogs found.');

            return self::SUCCESS;
        }

        if ($primaryBlogs->count() === 1) {
            $this->info('Only one primary blog found. Everything is correct!');
            $this->line('Primary blog: ' . $primaryBlogs->first()->title);

            return self::SUCCESS;
        }

        $this->warn("Found {$primaryBlogs->count()} primary blogs. Fixing...");

        // Keep the most recently published one as primary
        $latestPrimary = $primaryBlogs
            ->sortByDesc('published_at')
            ->first();

        // Unset all others
        Blog::where('isPrimary', true)
            ->where('id', '!=', $latestPrimary->id)
            ->update(['isPrimary' => false]);

        $this->info("Fixed! Kept '{$latestPrimary->title}' as the primary blog.");
        $this->line('Published at: ' . $latestPrimary->published_at);

        return self::SUCCESS;
    }
}
