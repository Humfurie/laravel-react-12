<?php

namespace App\Observers;

use App\Models\Expertise;
use Illuminate\Support\Facades\Cache;

class ExpertiseObserver
{
    /**
     * Handle the Expertise "created" event.
     */
    public function created(Expertise $expertise): void
    {
        $this->clearCache();
    }

    /**
     * Clear the homepage expertises cache and admin dashboard.
     */
    protected function clearCache(): void
    {
        Cache::forget(config('cache-ttl.keys.homepage_expertises'));
        Cache::forget(config('cache-ttl.keys.admin_dashboard'));
    }

    /**
     * Handle the Expertise "updated" event.
     */
    public function updated(Expertise $expertise): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Expertise "deleted" event.
     */
    public function deleted(Expertise $expertise): void
    {
        $this->clearCache();
    }
}
