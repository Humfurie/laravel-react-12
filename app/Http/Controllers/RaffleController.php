<?php

namespace App\Http\Controllers;

use App\Models\Raffle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RaffleController extends Controller
{
    /**
     * Display a listing of active raffles
     * Shows all raffles with status='active', including upcoming ones
     */
    public function index()
    {
        $raffles = Raffle::where('status', Raffle::STATUS_ACTIVE)
            ->with(['images' => function ($query) {
                $query->ordered();
            }])
            ->withCount('entries')
            ->orderBy('start_date', 'asc') // Upcoming first, then active
            ->get()
            ->map(function ($raffle) {
                return [
                    'id' => $raffle->id,
                    'title' => $raffle->title,
                    'slug' => $raffle->slug,
                    'description' => $raffle->description,
                    'start_date' => $raffle->start_date,
                    'end_date' => $raffle->end_date,
                    'is_active' => $raffle->is_active,
                    'can_accept_entries' => $raffle->can_accept_entries,
                    'entries_count' => $raffle->entries_count,
                    'images' => $raffle->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'is_primary' => $image->is_primary,
                            'order' => $image->order,
                        ];
                    }),
                    'primary_image_url' => $raffle->primary_image_url,
                ];
            });

        return Inertia::render('raffles/index', [
            'raffles' => $raffles,
        ]);
    }

    /**
     * Display the specified raffle
     */
    public function show(Raffle $raffle)
    {
        // Don't show draft raffles to public
        if ($raffle->status === Raffle::STATUS_DRAFT) {
            abort(404);
        }

        // Update status if needed (e.g., end date passed or winner selected)
        $raffle->updateStatusIfNeeded();

        $raffle->load(['images' => function ($query) {
            $query->ordered();
        }, 'winner', 'entries']);

        // Determine if raffle can be started (backend conditions only)
        $canStartRaffle = !$raffle->winner_id
            && $raffle->entries->count() > 0
            && $raffle->end_date < now();

        return Inertia::render('raffles/show', [
            'raffle' => [
                'id' => $raffle->id,
                'title' => $raffle->title,
                'slug' => $raffle->slug,
                'description' => $raffle->description,
                'start_date' => $raffle->start_date,
                'end_date' => $raffle->end_date,
                'status' => $raffle->status,
                'is_active' => $raffle->is_active,
                'has_ended' => $raffle->has_ended,
                'can_accept_entries' => $raffle->can_accept_entries,
                'can_start_raffle' => $canStartRaffle,
                'entries_count' => $raffle->entries->count(),
                'winner' => $raffle->winner ? [
                    'name' => $raffle->winner->name,
                ] : null,
                // Only show eligible entries (exclude rejected participants)
                'entry_names' => $raffle->entries
                    ->whereNotIn('status', [\App\Models\RaffleEntry::STATUS_REJECTED])
                    ->pluck('name')
                    ->toArray(),
                'images' => $raffle->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'is_primary' => $image->is_primary,
                        'order' => $image->order,
                    ];
                }),
                'primary_image_url' => $raffle->primary_image_url,
            ],
        ]);
    }

    /**
     * Display all raffles with winners
     */
    public function winners()
    {
        $raffles = Raffle::ended()
            ->whereNotNull('winner_id')
            ->with(['winner', 'images' => function ($query) {
                $query->primary();
            }])
            ->withCount('entries')
            ->orderBy('end_date', 'desc')
            ->get()
            ->map(function ($raffle) {
                return [
                    'id' => $raffle->id,
                    'title' => $raffle->title,
                    'slug' => $raffle->slug,
                    'end_date' => $raffle->end_date,
                    'winner' => [
                        'name' => $raffle->winner->name,
                    ],
                    'primary_image_url' => $raffle->primary_image_url,
                    'entries_count' => $raffle->entries_count,
                ];
            });

        return Inertia::render('raffles/winners', [
            'raffles' => $raffles,
        ]);
    }

    /**
     * Display entries for a specific raffle (names only)
     */
    public function entries(Raffle $raffle)
    {
        // Don't show draft raffles to public
        if ($raffle->status === Raffle::STATUS_DRAFT) {
            abort(404);
        }

        // Only show names, no phone or facebook info
        // Exclude rejected entries from public view
        $entries = $raffle->entries()
            ->whereNotIn('status', [\App\Models\RaffleEntry::STATUS_REJECTED])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'name' => $entry->name,
                    'created_at' => $entry->created_at,
                ];
            });

        return Inertia::render('raffles/entries', [
            'raffle' => [
                'id' => $raffle->id,
                'title' => $raffle->title,
                'slug' => $raffle->slug,
                'primary_image_url' => $raffle->primary_image_url,
                'entries_count' => $entries->count(),
            ],
            'entries' => $entries,
        ]);
    }

    /**
     * Activate raffle (Admin only - sets status to active)
     */
    public function activateRaffle(Raffle $raffle)
    {
        // Ensure user is authenticated and is admin
        if (!auth()->check() || !auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized. Admin access required.');
        }

        // Check if raffle is draft
        if ($raffle->status !== Raffle::STATUS_DRAFT) {
            return back()->with('error', 'Raffle is already active or ended.');
        }

        // Activate the raffle
        $raffle->update(['status' => Raffle::STATUS_ACTIVE]);

        return redirect()->route('raffles.show', $raffle)
            ->with('success', 'Raffle has been activated and is now live!');
    }

    /**
     * Select winner (Admin can trigger when raffle is active)
     */
    public function startRaffle(Raffle $raffle)
    {
        // Validate raffle can be started
        if ($raffle->winner_id) {
            return back()->with('error', 'A winner has already been selected for this raffle.');
        }

        if ($raffle->entries()->count() === 0) {
            return back()->with('error', 'No entries found for this raffle.');
        }

        // Select winner
        $winner = $raffle->selectWinner();

        if (!$winner) {
            return back()->with('error', 'Failed to select a winner.');
        }

        // Return back with success message (Inertia will handle this properly)
        return back()->with('success', "Winner selected: {$winner->name}");
    }
}
