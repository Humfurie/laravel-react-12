<?php

namespace App\Http\Controllers;

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Inertia\Inertia;

class GiveawayController extends Controller
{
    /**
     * Display a listing of active giveaways
     * Shows all giveaways with status='active', including upcoming ones
     */
    public function index()
    {
        $giveaways = Giveaway::where('status', Giveaway::STATUS_ACTIVE)
            ->with(['images' => function ($query) {
                $query->ordered();
            }])
            ->withCount('entries')
            ->orderBy('start_date', 'asc') // Upcoming first, then active
            ->get()
            ->map(function ($giveaway) {
                return [
                    'id' => $giveaway->id,
                    'title' => $giveaway->title,
                    'slug' => $giveaway->slug,
                    'description' => $giveaway->description,
                    'start_date' => $giveaway->start_date,
                    'end_date' => $giveaway->end_date,
                    'is_active' => $giveaway->is_active,
                    'can_accept_entries' => $giveaway->can_accept_entries,
                    'entries_count' => $giveaway->entries_count,
                    'images' => $giveaway->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'is_primary' => $image->is_primary,
                            'order' => $image->order,
                        ];
                    }),
                    'primary_image_url' => $giveaway->primary_image_url,
                ];
            });

        return Inertia::render('giveaways/index', [
            'giveaways' => $giveaways,
        ]);
    }

    /**
     * Display the specified giveaway
     */
    public function show(Giveaway $giveaway)
    {
        // Don't show draft giveaways to public
        if ($giveaway->status === Giveaway::STATUS_DRAFT) {
            abort(404);
        }

        // Update status if needed (e.g., end date passed or winner selected)
        $giveaway->updateStatusIfNeeded();

        $giveaway->load(['images' => function ($query) {
            $query->ordered();
        }, 'winner', 'entries']);

        // Determine if giveaway can be started (backend conditions only)
        // Admin can start anytime between start_date and end_date if there are entries
        $canStartGiveaway = !$giveaway->winner_id
            && $giveaway->entries->count() > 0
            && $giveaway->start_date <= now()
            && $giveaway->status === Giveaway::STATUS_ACTIVE;

        // Set meta data in request for blade template
        request()->merge([
            '_meta' => [
                'title' => $giveaway->title,
                'description' => substr($giveaway->description, 0, 160),
                'image' => $giveaway->primary_image_url,
            ]
        ]);

        return Inertia::render('giveaways/show', [
            'giveaway' => [
                'id' => $giveaway->id,
                'title' => $giveaway->title,
                'slug' => $giveaway->slug,
                'description' => $giveaway->description,
                'start_date' => $giveaway->start_date,
                'end_date' => $giveaway->end_date,
                'status' => $giveaway->status,
                'is_active' => $giveaway->is_active,
                'has_ended' => $giveaway->has_ended,
                'can_accept_entries' => $giveaway->can_accept_entries,
                'can_start_giveaway' => $canStartGiveaway,
                'entries_count' => $giveaway->entries->count(),
                'winner' => $giveaway->winner ? [
                    'name' => $giveaway->winner->name,
                ] : null,
                // Only show eligible entries (exclude rejected participants)
                'entry_names' => $giveaway->entries
                    ->whereNotIn('status', [GiveawayEntry::STATUS_REJECTED])
                    ->pluck('name')
                    ->toArray(),
                'images' => $giveaway->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'is_primary' => $image->is_primary,
                        'order' => $image->order,
                    ];
                }),
                'primary_image_url' => $giveaway->primary_image_url,
            ],
        ]);
    }

    /**
     * Display all giveaways with winners
     */
    public function winners()
    {
        $giveaways = Giveaway::ended()
            ->whereNotNull('winner_id')
            ->with(['winner', 'images' => function ($query) {
                $query->primary();
            }])
            ->withCount('entries')
            ->orderBy('end_date', 'desc')
            ->get()
            ->map(function ($giveaway) {
                return [
                    'id' => $giveaway->id,
                    'title' => $giveaway->title,
                    'slug' => $giveaway->slug,
                    'end_date' => $giveaway->end_date,
                    'winner' => [
                        'name' => $giveaway->winner->name,
                    ],
                    'primary_image_url' => $giveaway->primary_image_url,
                    'entries_count' => $giveaway->entries_count,
                ];
            });

        return Inertia::render('giveaways/winners', [
            'giveaways' => $giveaways,
        ]);
    }

    /**
     * Activate giveaway (Admin only - sets status to active)
     */
    public function activateGiveaway(Giveaway $giveaway)
    {
        // Ensure user is authenticated and is admin
        if (!auth()->check() || !auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized. Admin access required.');
        }

        // Check if giveaway is draft
        if ($giveaway->status !== Giveaway::STATUS_DRAFT) {
            return back()->with('error', 'Giveaway is already active or ended.');
        }

        // Activate the giveaway
        $giveaway->update(['status' => Giveaway::STATUS_ACTIVE]);

        return redirect()->route('giveaways.show', $giveaway)
            ->with('success', 'Giveaway has been activated and is now live!');
    }

    /**
     * Select winner (Admin can trigger when giveaway is active)
     */
    public function startGiveaway(Giveaway $giveaway)
    {
        // Validate giveaway can be started
        if ($giveaway->winner_id) {
            return back()->with('error', 'A winner has already been selected for this giveaway.');
        }

        if ($giveaway->entries()->count() === 0) {
            return back()->with('error', 'No entries found for this giveaway.');
        }

        // Select winner
        $winner = $giveaway->selectWinner();

        if (!$winner) {
            return back()->with('error', 'Failed to select a winner.');
        }

        // Return back with success message (Inertia will handle this properly)
        return back()->with('success', "Winner selected: {$winner->name}");
    }

    /**
     * Display entries for a specific giveaway (names only)
     */
    public function entries(Giveaway $giveaway)
    {
        // Don't show draft giveaways to public
        if ($giveaway->status === Giveaway::STATUS_DRAFT) {
            abort(404);
        }

        // Only show names, no phone or facebook info
        // Exclude rejected entries from public view
        $entries = $giveaway->entries()
            ->whereNotIn('status', [GiveawayEntry::STATUS_REJECTED])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'name' => $entry->name,
                    'created_at' => $entry->created_at,
                ];
            });

        return Inertia::render('giveaways/entries', [
            'giveaway' => [
                'id' => $giveaway->id,
                'title' => $giveaway->title,
                'slug' => $giveaway->slug,
                'primary_image_url' => $giveaway->primary_image_url,
                'entries_count' => $entries->count(),
            ],
            'entries' => $entries,
        ]);
    }
}
