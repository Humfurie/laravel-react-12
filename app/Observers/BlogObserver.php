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
        $this->clearCache();
    }

    /**
     * Clear the homepage blog cache and admin dashboard.
     */
    protected function clearCache(): void
    {
        Cache::forget(config('cache-ttl.keys.homepage_blogs'));
        Cache::forget(config('cache-ttl.keys.admin_dashboard'));
    }

    /**
     * Handle the Blog "updated" event.
     */
    public function updated(Blog $blog): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Blog "deleted" event.
     */
    public function deleted(Blog $blog): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Blog "restored" event.
     */
    public function restored(Blog $blog): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Blog "force deleted" event.
     */
    public function forceDeleted(Blog $blog): void
    {
        $this->clearCache();
    }
}
