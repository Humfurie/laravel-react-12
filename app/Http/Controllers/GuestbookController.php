<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGuestbookEntryRequest;
use App\Models\GuestbookEntry;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GuestbookController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display the guestbook page with approved entries.
     */
    public function index(): InertiaResponse
    {
        $entries = Cache::remember(
            config('cache-ttl.keys.guestbook_entries'),
            config('cache-ttl.listing.guestbook'),
            fn () => GuestbookEntry::with('user')
                ->approved()
                ->latestFirst()
                ->paginate(20)
                ->through(fn ($entry) => [
                    'id' => $entry->id,
                    'message' => $entry->message,
                    'created_at' => $entry->created_at->toISOString(),
                    'user' => [
                        'id' => $entry->user->id,
                        'name' => $entry->user->name,
                        'avatar_url' => $entry->user->avatar_url,
                        'github_username' => $entry->user->github_username,
                    ],
                ])
        );

        return Inertia::render('user/guestbook', [
            'entries' => $entries,
        ]);
    }

    /**
     * Store a new guestbook entry.
     */
    public function store(StoreGuestbookEntryRequest $request)
    {
        $entry = GuestbookEntry::create([
            'user_id' => $request->user()->id,
            'message' => $request->validated('message'),
            'is_approved' => true,
        ]);

        $entry->load('user');

        return response()->json([
            'entry' => [
                'id' => $entry->id,
                'message' => $entry->message,
                'created_at' => $entry->created_at->toISOString(),
                'user' => [
                    'id' => $entry->user->id,
                    'name' => $entry->user->name,
                    'avatar_url' => $entry->user->avatar_url,
                    'github_username' => $entry->user->github_username,
                ],
            ],
        ], 201);
    }

    /**
     * Delete a guestbook entry (own entries only).
     */
    public function destroy(GuestbookEntry $guestbookEntry)
    {
        $this->authorize('delete', $guestbookEntry);

        $guestbookEntry->delete();

        return response()->json(['success' => true]);
    }
}
