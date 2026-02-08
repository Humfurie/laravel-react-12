<?php

use App\Models\GuestbookEntry;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

test('creating guestbook entry clears cache', function () {
    Cache::put(config('cache-ttl.keys.guestbook_entries'), 'cached-data', 3600);

    GuestbookEntry::factory()->create();

    expect(Cache::has(config('cache-ttl.keys.guestbook_entries')))->toBeFalse();
});

test('deleting guestbook entry clears cache', function () {
    $entry = GuestbookEntry::factory()->create();

    Cache::put(config('cache-ttl.keys.guestbook_entries'), 'cached-data', 3600);

    $entry->delete();

    expect(Cache::has(config('cache-ttl.keys.guestbook_entries')))->toBeFalse();
});

test('restoring guestbook entry clears cache', function () {
    $entry = GuestbookEntry::factory()->create();
    $entry->delete();

    Cache::put(config('cache-ttl.keys.guestbook_entries'), 'cached-data', 3600);

    $entry->restore();

    expect(Cache::has(config('cache-ttl.keys.guestbook_entries')))->toBeFalse();
});

test('updating guestbook entry clears cache', function () {
    $entry = GuestbookEntry::factory()->create();

    Cache::put(config('cache-ttl.keys.guestbook_entries'), 'cached-data', 3600);

    $entry->update(['is_approved' => false]);

    expect(Cache::has(config('cache-ttl.keys.guestbook_entries')))->toBeFalse();
});
