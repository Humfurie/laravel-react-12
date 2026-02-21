<?php

use App\Models\GuestbookEntry;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

test('creating guestbook entry clears cache', function () {
    $cacheKey = config('cache-ttl.keys.guestbook_entries').'.page.1';
    Cache::put($cacheKey, 'cached-data', 3600);

    GuestbookEntry::factory()->create();

    expect(Cache::has($cacheKey))->toBeFalse();
});

test('deleting guestbook entry clears cache', function () {
    $cacheKey = config('cache-ttl.keys.guestbook_entries').'.page.1';
    $entry = GuestbookEntry::factory()->create();

    Cache::put($cacheKey, 'cached-data', 3600);

    $entry->delete();

    expect(Cache::has($cacheKey))->toBeFalse();
});

test('restoring guestbook entry clears cache', function () {
    $cacheKey = config('cache-ttl.keys.guestbook_entries').'.page.1';
    $entry = GuestbookEntry::factory()->create();
    $entry->delete();

    Cache::put($cacheKey, 'cached-data', 3600);

    $entry->restore();

    expect(Cache::has($cacheKey))->toBeFalse();
});

test('updating guestbook entry clears cache', function () {
    $cacheKey = config('cache-ttl.keys.guestbook_entries').'.page.1';
    $entry = GuestbookEntry::factory()->create();

    Cache::put($cacheKey, 'cached-data', 3600);

    $entry->update(['is_approved' => false]);

    expect(Cache::has($cacheKey))->toBeFalse();
});
