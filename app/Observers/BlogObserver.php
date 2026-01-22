<?php

namespace App\Observers;

use App\Models\Blog;
use Illuminate\Support\Facades\Cache;

class BlogObserver
{
    /**
     * Handle the Blog "created" event.
     */
    public function created(Blog $blog): void
    {
        $this->clearCache($blog);
    }

    /**
     * Clear the homepage blog cache, admin dashboard, RSS feed, sitemap, and OG image caches.
     */
    protected function clearCache(?Blog $blog = null): void
    {
        Cache::forget(config('cache-ttl.keys.homepage_blogs'));
        Cache::forget(config('cache-ttl.keys.admin_dashboard'));
        Cache::forget('rss:feed');
        Cache::forget('sitemap:latest_blog');
        Cache::forget('sitemap:blogs');

        // Clear OG image cache for specific blog
        if ($blog) {
            Cache::forget("og:blog:{$blog->slug}");
        }
    }

    /**
     * Handle the Blog "updated" event.
     */
    public function updated(Blog $blog): void
    {
        // If slug changed, clear cache for old slug too
        if ($blog->wasChanged('slug')) {
            $oldSlug = $blog->getOriginal('slug');
            Cache::forget("og:blog:{$oldSlug}");
        }

        $this->clearCache($blog);
    }

    /**
     * Handle the Blog "deleted" event.
     */
    public function deleted(Blog $blog): void
    {
        $this->clearCache($blog);
    }

    /**
     * Handle the Blog "restored" event.
     */
    public function restored(Blog $blog): void
    {
        $this->clearCache($blog);
    }

    /**
     * Handle the Blog "force deleted" event.
     */
    public function forceDeleted(Blog $blog): void
    {
        $this->clearCache($blog);
    }
}
