<?php

namespace App\Observers;

use App\Models\Deployment;
use Illuminate\Support\Facades\Cache;

class DeploymentObserver
{
    public function created(Deployment $deployment): void
    {
        $this->clearCache();
    }

    public function updated(Deployment $deployment): void
    {
        $this->clearCache();
    }

    public function deleted(Deployment $deployment): void
    {
        $this->clearCache();
    }

    public function restored(Deployment $deployment): void
    {
        $this->clearCache();
    }

    public function forceDeleted(Deployment $deployment): void
    {
        $this->clearCache();
    }

    protected function clearCache(): void
    {
        Cache::forget(config('cache-ttl.keys.listing_deployments'));
        Cache::forget(config('cache-ttl.keys.admin_dashboard'));
    }
}
