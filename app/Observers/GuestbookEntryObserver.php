<?php

namespace App\Observers;

use App\Models\GuestbookEntry;
use Illuminate\Support\Facades\Cache;

class GuestbookEntryObserver
{
    /**
     * Handle the GuestbookEntry "created" event.
     */
    public function created(GuestbookEntry $entry): void
    {
        $this->clearCache();
    }

    /**
     * Handle the GuestbookEntry "updated" event.
     */
    public function updated(GuestbookEntry $entry): void
    {
        $this->clearCache();
    }

    /**
     * Handle the GuestbookEntry "deleted" event.
     */
    public function deleted(GuestbookEntry $entry): void
    {
        $this->clearCache();
    }

    /**
     * Handle the GuestbookEntry "restored" event.
     */
    public function restored(GuestbookEntry $entry): void
    {
        $this->clearCache();
    }

    /**
     * Handle the GuestbookEntry "force deleted" event.
     */
    public function forceDeleted(GuestbookEntry $entry): void
    {
        $this->clearCache();
    }

    /**
     * Clear guestbook-related caches.
     */
    protected function clearCache(): void
    {
        Cache::forget(config('cache-ttl.keys.guestbook_entries'));
        Cache::forget(config('cache-ttl.keys.admin_dashboard'));
    }
}
