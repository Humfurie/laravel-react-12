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
     * Only clears cache if the modified user is the admin user.
     */
    protected function clearCache(User $user): void
    {
        // Only invalidate cache if this is the admin user shown on homepage
        if ($user->id === (int) config('app.admin_user_id')) {
            Cache::forget('homepage.user_profile');
        }
        Cache::forget('admin:dashboard');
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
