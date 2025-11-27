<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use App\Models\Image;
use Exception;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GiveawayController extends Controller
{
    /**
     * Display a listing of giveaways
     */
    public function index(Request $request)
    {
        $query = Giveaway::query()->with(['images', 'winner', 'winners']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $giveaways = $query->withCount('entries')
            ->latest()
            ->paginate(10)
            ->through(function ($giveaway) {
                return [
                    'id' => $giveaway->id,
                    'title' => $giveaway->title,
                    'slug' => $giveaway->slug,
                    'description' => Str::limit($giveaway->description, 100),
                    'start_date' => $giveaway->start_date,
                    'end_date' => $giveaway->end_date,
                    'number_of_winners' => $giveaway->number_of_winners,
                    'status' => $giveaway->status,
                    'is_active' => $giveaway->is_active,
                    'has_ended' => $giveaway->has_ended,
                    'entries_count' => $giveaway->entries_count,
                    'winners_count' => $giveaway->winners->count(),
                    'winner' => $giveaway->winner ? [
                        'id' => $giveaway->winner->id,
                        'name' => $giveaway->winner->name,
                    ] : null,
                    'primary_image_url' => $giveaway->primary_image_url,
                    'created_at' => $giveaway->created_at,
                ];
            });

        return Inertia::render('admin/giveaways/index', [
            'giveaways' => $giveaways,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Store a newly created giveaway
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'number_of_winners' => 'nullable|integer|min:1|max:100',
            'status' => 'required|in:draft,active,ended',
        ]);

        // Set default number of winners if not provided
        if (!isset($validated['number_of_winners'])) {
            $validated['number_of_winners'] = 1;
        }

        try {
            $giveaway = Giveaway::create($validated);

            return redirect()->route('admin.giveaways.edit', $giveaway)
                ->with('success', 'Giveaway created successfully.');
        } catch (UniqueConstraintViolationException $e) {
            return back()
                ->withInput()
                ->with('error', 'A giveaway with this title already exists. Please use a different title or modify the slug manually.');
        } catch (Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create giveaway: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new giveaway
     */
    public function create()
    {
        return Inertia::render('admin/giveaways/create');
    }

    /**
     * Show the form for editing a giveaway
     */
    public function edit(Giveaway $giveaway)
    {
        $giveaway->load(['images' => function ($query) {
            $query->ordered();
        }, 'entries', 'winner', 'winners']);

        return Inertia::render('admin/giveaways/edit', [
            'giveaway' => [
                'id' => $giveaway->id,
                'title' => $giveaway->title,
                'slug' => $giveaway->slug,
                'description' => $giveaway->description,
                'start_date' => $giveaway->start_date,
                'end_date' => $giveaway->end_date,
                'number_of_winners' => $giveaway->number_of_winners,
                'status' => $giveaway->status,
                'is_active' => $giveaway->is_active,
                'has_ended' => $giveaway->has_ended,
                'can_accept_entries' => $giveaway->can_accept_entries,
                'winner_id' => $giveaway->winner_id,
                'prize_claimed' => $giveaway->prize_claimed,
                'prize_claimed_at' => $giveaway->prize_claimed_at,
                'rejection_reason' => $giveaway->rejection_reason,
                'winner' => $giveaway->winner ? [
                    'id' => $giveaway->winner->id,
                    'name' => $giveaway->winner->name,
                    'phone' => $giveaway->winner->phone,
                    'facebook_url' => $giveaway->winner->facebook_url,
                ] : null,
                'winners' => $giveaway->winners->map(function ($winner) {
                    return [
                        'id' => $winner->id,
                        'name' => $winner->name,
                        'phone' => $winner->phone,
                        'facebook_url' => $winner->facebook_url,
                        'entry_date' => $winner->entry_date,
                    ];
                }),
                'winners_count' => $giveaway->winners->count(),
                'images' => $giveaway->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'name' => $image->name,
                        'url' => $image->url,
                        'is_primary' => $image->is_primary,
                        'order' => $image->order,
                    ];
                }),
                'entries_count' => $giveaway->entries->count(),
                'entries' => $giveaway->entries->map(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'name' => $entry->name,
                        'phone' => $entry->phone,
                        'facebook_url' => $entry->facebook_url,
                        'status' => $entry->status,
                        'created_at' => $entry->created_at,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Remove the specified giveaway (soft delete)
     */
    public function destroy(Giveaway $giveaway)
    {
        $giveaway->delete();

        return redirect()->route('admin.giveaways.index')
            ->with('success', 'Giveaway deleted successfully.');
    }

    /**
     * Restore a soft-deleted giveaway
     */
    public function restore($id)
    {
        $giveaway = Giveaway::withTrashed()->findOrFail($id);
        $giveaway->restore();

        return back()->with('success', 'Giveaway restored successfully.');
    }

    /**
     * Permanently delete a giveaway
     */
    public function forceDestroy($id)
    {
        $giveaway = Giveaway::withTrashed()->findOrFail($id);
        $giveaway->forceDelete();

        return redirect()->route('admin.giveaways.index')
            ->with('success', 'Giveaway permanently deleted.');
    }

    /**
     * Upload an image for the giveaway (prize photo)
     */
    public function uploadImage(Request $request, Giveaway $giveaway)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:10240', // 10MB max
        ]);

        DB::beginTransaction();
        try {
            $file = $request->file('image');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('giveaways', $filename, 'minio');

            // Get the next order number
            $maxOrder = $giveaway->images()->max('order') ?? 0;
            $isPrimary = $giveaway->images()->count() === 0; // First image is primary

            $image = $giveaway->images()->create([
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'filename' => $filename,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'order' => $maxOrder + 1,
                'is_primary' => $isPrimary,
            ]);

            DB::commit();

            return back()->with('success', 'Image uploaded successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to upload image: ' . $e->getMessage());
        }
    }

    /**
     * Reorder images
     */
    public function reorderImages(Request $request, Giveaway $giveaway)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:images,id',
            'images.*.order' => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->images as $imageData) {
                Image::where('id', $imageData['id'])
                    ->where('imageable_id', $giveaway->id)
                    ->where('imageable_type', Giveaway::class)
                    ->update(['order' => $imageData['order']]);
            }

            DB::commit();
            return back()->with('success', 'Images reordered successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to reorder images.');
        }
    }

    /**
     * Update the specified giveaway
     */
    public function update(Request $request, Giveaway $giveaway)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'number_of_winners' => 'nullable|integer|min:1|max:100',
            'status' => 'required|in:draft,active,ended',
        ]);

        try {
            $giveaway->update($validated);

            return back()->with('success', 'Giveaway updated successfully.');
        } catch (UniqueConstraintViolationException $e) {
            return back()
                ->withInput()
                ->with('error', 'A giveaway with this title already exists. Please use a different title or modify the slug manually.');
        } catch (Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update giveaway: ' . $e->getMessage());
        }
    }

    /**
     * Set an image as primary
     */
    public function setPrimaryImage(Giveaway $giveaway, Image $image)
    {
        if ($image->imageable_id !== $giveaway->id || $image->imageable_type !== Giveaway::class) {
            return back()->with('error', 'Image does not belong to this giveaway.');
        }

        $image->setPrimary();

        return back()->with('success', 'Primary image set successfully.');
    }

    /**
     * Delete an image
     */
    public function deleteImage(Giveaway $giveaway, Image $image)
    {
        if ($image->imageable_id !== $giveaway->id || $image->imageable_type !== Giveaway::class) {
            return back()->with('error', 'Image does not belong to this giveaway.');
        }

        $image->delete();

        return back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Get all entries for a giveaway
     */
    public function getEntries(Giveaway $giveaway)
    {
        $entries = $giveaway->entries()
            ->orderBy('entry_date', 'desc')
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'name' => $entry->name,
                    'phone' => $entry->phone,
                    'facebook_url' => $entry->facebook_url,
                    'status' => $entry->status,
                    'entry_date' => $entry->entry_date,
                    'is_winner' => $entry->isWinner(),
                ];
            });

        return response()->json(['entries' => $entries]);
    }

    /**
     * Show winner selection page
     */
    public function showWinnerSelection(Giveaway $giveaway)
    {
        $giveaway->load(['entries', 'winner', 'winners']);

        return Inertia::render('admin/giveaways/winner-selection', [
            'giveaway' => [
                'id' => $giveaway->id,
                'title' => $giveaway->title,
                'slug' => $giveaway->slug,
                'status' => $giveaway->status,
                'number_of_winners' => $giveaway->number_of_winners,
                'winner_id' => $giveaway->winner_id,
                'winner' => $giveaway->winner ? [
                    'id' => $giveaway->winner->id,
                    'name' => $giveaway->winner->name,
                    'phone' => $giveaway->winner->phone,
                    'facebook_url' => $giveaway->winner->facebook_url,
                ] : null,
                'winners' => $giveaway->winners->map(function ($winner) {
                    return [
                        'id' => $winner->id,
                        'name' => $winner->name,
                        'phone' => $winner->phone,
                        'facebook_url' => $winner->facebook_url,
                        'entry_date' => $winner->entry_date,
                    ];
                }),
                'winners_count' => $giveaway->winners->count(),
                'entries' => $giveaway->entries->map(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'name' => $entry->name,
                        'phone' => $entry->phone,
                        'facebook_url' => $entry->facebook_url,
                        'status' => $entry->status,
                        'entry_date' => $entry->entry_date,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Select random winner(s)
     */
    public function selectWinner(Giveaway $giveaway)
    {
        $requiredWinners = $giveaway->number_of_winners ?? 1;
        $currentWinnersCount = $giveaway->winners()->count();

        if ($currentWinnersCount >= $requiredWinners) {
            return back()->with('error', 'All winners have already been selected for this giveaway.');
        }

        if ($giveaway->entries()->count() === 0) {
            return back()->with('error', 'No entries found for this giveaway.');
        }

        $winner = $giveaway->selectWinner();

        if (!$winner) {
            return back()->with('error', 'Failed to select winner(s). No eligible entries found.');
        }

        $totalWinners = $giveaway->winners()->count();
        $message = $totalWinners === $requiredWinners
            ? "All {$totalWinners} winner(s) selected successfully!"
            : "Winner(s) selected! Total: {$totalWinners}/{$requiredWinners}";

        return back()->with('success', $message);
    }

    /**
     * Update entry status
     */
    public function updateEntryStatus(Request $request, Giveaway $giveaway, GiveawayEntry $entry)
    {
        $request->validate([
            'status' => 'required|in:pending,verified,winner,rejected',
        ]);

        if ($entry->giveaway_id !== $giveaway->id) {
            return back()->with('error', 'Entry does not belong to this giveaway.');
        }

        $entry->update(['status' => $request->status]);

        return back()->with('success', 'Entry status updated successfully.');
    }

    /**
     * Delete an entry
     */
    public function deleteEntry(Giveaway $giveaway, GiveawayEntry $entry)
    {
        if ($entry->giveaway_id !== $giveaway->id) {
            return back()->with('error', 'Entry does not belong to this giveaway.');
        }

        $entry->delete();

        return back()->with('success', 'Entry deleted successfully.');
    }

    /**
     * Mark prize as claimed
     */
    public function claimPrize(Giveaway $giveaway)
    {
        if (!$giveaway->winner_id) {
            return back()->with('error', 'No winner selected for this giveaway.');
        }

        if ($giveaway->prize_claimed) {
            return back()->with('error', 'Prize has already been marked as claimed.');
        }

        $giveaway->markPrizeAsClaimed();

        return back()->with('success', 'Prize marked as claimed successfully.');
    }

    /**
     * Reject current winner and select a new one
     */
    public function rejectWinner(Request $request, Giveaway $giveaway)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (!$giveaway->winner_id) {
            return back()->with('error', 'No winner selected for this giveaway.');
        }

        if ($giveaway->prize_claimed) {
            return back()->with('error', 'Cannot reject winner after prize has been claimed.');
        }

        $rejectedWinnerName = $giveaway->winner->name;
        $newWinner = $giveaway->rejectWinner($request->reason);

        if (!$newWinner) {
            return back()->with('error', 'Failed to select a new winner.');
        }

        return back()->with('success', "Winner '{$rejectedWinnerName}' rejected. New winner selected: {$newWinner->name}");
    }
}
