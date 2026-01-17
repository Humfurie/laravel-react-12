<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        $this->clearCache($user);
    }

    /**
     * Clear the homepage user profile cache and admin dashboard.
     *
     * Only clears homepage cache if the modified user is the admin user.
     */
    protected function clearCache(User $user): void
    {
        $adminId = config('app.admin_user_id');

        // Only invalidate homepage cache if this is the admin user shown on homepage
        // Guard against null/empty admin_user_id to prevent matching user ID 0
        if ($adminId && $user->id === (int) $adminId) {
            Cache::forget(config('cache-ttl.keys.homepage_user_profile'));
        }

        // Always clear admin dashboard cache on any user change
        Cache::forget(config('cache-ttl.keys.admin_dashboard'));
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        $this->clearCache($user);
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        $this->clearCache($user);
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        $this->clearCache($user);
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        $this->clearCache($user);
    }
}
