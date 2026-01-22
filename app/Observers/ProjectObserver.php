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
        $this->clearCache($project);
    }

    /**
     * Clear the project-related caches, admin dashboard, sitemap, and OG image caches.
     */
    protected function clearCache(?Project $project = null): void
    {
        // Listing page caches
        Cache::forget(config('cache-ttl.keys.listing_projects_featured'));
        Cache::forget(config('cache-ttl.keys.listing_projects_tech_stack'));

        // Homepage cache
        Cache::forget(config('cache-ttl.keys.homepage_projects'));

        // Admin dashboard cache
        Cache::forget(config('cache-ttl.keys.admin_dashboard'));

        // Sitemap caches
        Cache::forget('sitemap:latest_project');
        Cache::forget('sitemap:projects');

        // Clear OG image cache for specific project
        if ($project) {
            Cache::forget("og:project:{$project->slug}");
        }
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        $this->clearCache($project);
    }

    /**
     * Handle the Project "deleted" event.
     */
    public function deleted(Project $project): void
    {
        $this->clearCache($project);
    }

    /**
     * Handle the Project "restored" event.
     */
    public function restored(Project $project): void
    {
        $this->clearCache($project);
    }

    /**
     * Handle the Project "force deleted" event.
     */
    public function forceDeleted(Project $project): void
    {
        $this->clearCache($project);
    }
}
