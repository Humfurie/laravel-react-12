<?php

namespace App\Observers;

use App\Models\ProjectCategory;
use Illuminate\Support\Facades\Cache;

class ProjectCategoryObserver
{
    /**
     * Handle the ProjectCategory "created" event.
     */
    public function created(ProjectCategory $category): void
    {
        $this->clearCache();
    }

    /**
     * Handle the ProjectCategory "updated" event.
     */
    public function updated(ProjectCategory $category): void
    {
        $this->clearCache();
    }

    /**
     * Handle the ProjectCategory "deleted" event.
     */
    public function deleted(ProjectCategory $category): void
    {
        $this->clearCache();
    }

    /**
     * Clear the project-related caches when categories change.
     */
    protected function clearCache(): void
    {
        // Homepage projects cache (shows category labels)
        Cache::forget(config('cache-ttl.keys.homepage_projects'));

        // Listing page caches
        Cache::forget(config('cache-ttl.keys.listing_projects_featured'));

        // Admin dashboard cache
        Cache::forget(config('cache-ttl.keys.admin_dashboard'));
    }
}
