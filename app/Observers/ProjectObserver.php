<?php

namespace App\Observers;

use App\Models\Project;
use Illuminate\Support\Facades\Cache;

class ProjectObserver
{
    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        $this->clearCache();
    }

    /**
     * Clear the project-related caches and admin dashboard.
     */
    protected function clearCache(): void
    {
        // Listing page caches
        Cache::forget(config('cache-ttl.keys.listing_projects_featured'));
        Cache::forget(config('cache-ttl.keys.listing_projects_tech_stack'));

        // Homepage cache
        Cache::forget(config('cache-ttl.keys.homepage_projects'));

        // Admin dashboard cache
        Cache::forget(config('cache-ttl.keys.admin_dashboard'));
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Project "deleted" event.
     */
    public function deleted(Project $project): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Project "restored" event.
     */
    public function restored(Project $project): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Project "force deleted" event.
     */
    public function forceDeleted(Project $project): void
    {
        $this->clearCache();
    }
}
