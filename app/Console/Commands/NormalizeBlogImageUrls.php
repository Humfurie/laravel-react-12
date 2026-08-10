<?php

namespace App\Console\Commands;

use App\Models\Blog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NormalizeBlogImageUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blogs:normalize-image-urls {--dry-run : Show what would be changed without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rewrite legacy /storage/ pseudo-paths in featured_image and content to the current disk\'s resolved URL (e.g. R2)';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('DRY RUN - No changes will be made');
        }

        $disk = Storage::disk(config('filesystems.default'));

        $featuredUpdated = $this->normalizeFeaturedImages($disk, $dryRun);
        $contentUpdated = $this->normalizeContentImages($disk, $dryRun);

        $action = $dryRun ? 'would be updated' : 'updated';
        $this->info("{$featuredUpdated} featured_image value(s) {$action}");
        $this->info("{$contentUpdated} blog content body(ies) {$action}");

        return Command::SUCCESS;
    }

    private function normalizeFeaturedImages($disk, bool $dryRun): int
    {
        $blogs = Blog::whereNotNull('featured_image')
            ->whereLike('featured_image', '/storage/%')
            ->get();

        $updated = 0;
        foreach ($blogs as $blog) {
            $path = Str::after($blog->featured_image, '/storage/');
            $newUrl = $disk->url($path);

            $this->line("Blog #{$blog->id}: {$blog->title}");
            $this->line("  Old: {$blog->featured_image}");
            $this->line("  New: {$newUrl}");

            if (! $dryRun) {
                DB::transaction(function () use ($blog, $newUrl) {
                    $lockedBlog = Blog::where('id', $blog->id)->lockForUpdate()->first();
                    if ($lockedBlog) {
                        $lockedBlog->featured_image = $newUrl;
                        $lockedBlog->save();
                    }
                });
            }

            $updated++;
        }

        return $updated;
    }

    private function normalizeContentImages($disk, bool $dryRun): int
    {
        $pattern = '#(["\'])(/storage/(blog-images/[^"\']+))\1#';

        $blogs = Blog::whereNotNull('content')
            ->whereLike('content', '%/storage/blog-images/%')
            ->get();

        $updated = 0;
        foreach ($blogs as $blog) {
            $newContent = preg_replace_callback($pattern, function ($matches) use ($disk) {
                return $matches[1].$disk->url($matches[3]).$matches[1];
            }, $blog->content);

            if ($newContent === $blog->content) {
                continue;
            }

            $this->line("Blog #{$blog->id}: {$blog->title} — content image URLs rewritten");

            if (! $dryRun) {
                DB::transaction(function () use ($blog, $newContent) {
                    $lockedBlog = Blog::where('id', $blog->id)->lockForUpdate()->first();
                    if ($lockedBlog) {
                        $lockedBlog->content = $newContent;
                        $lockedBlog->save();
                    }
                });
            }

            $updated++;
        }

        return $updated;
    }
}
