<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Image;
use App\Models\Raffle;
use App\Models\RaffleEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RaffleController extends Controller
{
    /**
     * Display a listing of raffles
     */
    public function index(Request $request)
    {
        $query = Raffle::query()->with(['images', 'winner']);

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

        $raffles = $query->withCount('entries')
            ->latest()
            ->paginate(10)
            ->through(function ($raffle) {
                return [
                    'id' => $raffle->id,
                    'title' => $raffle->title,
                    'slug' => $raffle->slug,
                    'description' => Str::limit($raffle->description, 100),
                    'start_date' => $raffle->start_date,
                    'end_date' => $raffle->end_date,
                    'status' => $raffle->status,
                    'is_active' => $raffle->is_active,
                    'has_ended' => $raffle->has_ended,
                    'entries_count' => $raffle->entries_count,
                    'winner' => $raffle->winner ? [
                        'id' => $raffle->winner->id,
                        'name' => $raffle->winner->name,
                    ] : null,
                    'primary_image_url' => $raffle->primary_image_url,
                    'created_at' => $raffle->created_at,
                ];
            });

        return Inertia::render('admin/raffles/index', [
            'raffles' => $raffles,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new raffle
     */
    public function create()
    {
        return Inertia::render('admin/raffles/create');
    }

    /**
     * Store a newly created raffle
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:draft,active,ended',
        ]);

        try {
            $raffle = Raffle::create($validated);

            return redirect()->route('admin.raffles.edit', $raffle)
                ->with('success', 'Raffle created successfully.');
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            return back()
                ->withInput()
                ->with('error', 'A raffle with this title already exists. Please use a different title or modify the slug manually.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create raffle: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing a raffle
     */
    public function edit(Raffle $raffle)
    {
        $raffle->load(['images' => function ($query) {
            $query->ordered();
        }, 'entries', 'winner']);

        return Inertia::render('admin/raffles/edit', [
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
                'winner_id' => $raffle->winner_id,
                'prize_claimed' => $raffle->prize_claimed,
                'prize_claimed_at' => $raffle->prize_claimed_at,
                'rejection_reason' => $raffle->rejection_reason,
                'winner' => $raffle->winner ? [
                    'id' => $raffle->winner->id,
                    'name' => $raffle->winner->name,
                    'phone' => $raffle->winner->phone,
                    'facebook_url' => $raffle->winner->facebook_url,
                ] : null,
                'images' => $raffle->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'name' => $image->name,
                        'url' => $image->url,
                        'is_primary' => $image->is_primary,
                        'order' => $image->order,
                    ];
                }),
                'entries_count' => $raffle->entries->count(),
                'entries' => $raffle->entries->map(function ($entry) {
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
     * Update the specified raffle
     */
    public function update(Request $request, Raffle $raffle)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:draft,active,ended',
        ]);

        try {
            $raffle->update($validated);

            return back()->with('success', 'Raffle updated successfully.');
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            return back()
                ->withInput()
                ->with('error', 'A raffle with this title already exists. Please use a different title or modify the slug manually.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update raffle: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified raffle (soft delete)
     */
    public function destroy(Raffle $raffle)
    {
        $raffle->delete();

        return redirect()->route('admin.raffles.index')
            ->with('success', 'Raffle deleted successfully.');
    }

    /**
     * Restore a soft-deleted raffle
     */
    public function restore($id)
    {
        $raffle = Raffle::withTrashed()->findOrFail($id);
        $raffle->restore();

        return back()->with('success', 'Raffle restored successfully.');
    }

    /**
     * Permanently delete a raffle
     */
    public function forceDestroy($id)
    {
        $raffle = Raffle::withTrashed()->findOrFail($id);
        $raffle->forceDelete();

        return redirect()->route('admin.raffles.index')
            ->with('success', 'Raffle permanently deleted.');
    }

    /**
     * Upload an image for the raffle (prize photo)
     */
    public function uploadImage(Request $request, Raffle $raffle)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:10240', // 10MB max
        ]);

        DB::beginTransaction();
        try {
            $file = $request->file('image');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('raffles', $filename, 'public');

            // Get the next order number
            $maxOrder = $raffle->images()->max('order') ?? 0;
            $isPrimary = $raffle->images()->count() === 0; // First image is primary

            $image = $raffle->images()->create([
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
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to upload image: ' . $e->getMessage());
        }
    }

    /**
     * Reorder images
     */
    public function reorderImages(Request $request, Raffle $raffle)
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
                    ->where('imageable_id', $raffle->id)
                    ->where('imageable_type', Raffle::class)
                    ->update(['order' => $imageData['order']]);
            }

            DB::commit();
            return back()->with('success', 'Images reordered successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to reorder images.');
        }
    }

    /**
     * Set an image as primary
     */
    public function setPrimaryImage(Raffle $raffle, Image $image)
    {
        if ($image->imageable_id !== $raffle->id || $image->imageable_type !== Raffle::class) {
            return back()->with('error', 'Image does not belong to this raffle.');
        }

        $image->setPrimary();

        return back()->with('success', 'Primary image set successfully.');
    }

    /**
     * Delete an image
     */
    public function deleteImage(Raffle $raffle, Image $image)
    {
        if ($image->imageable_id !== $raffle->id || $image->imageable_type !== Raffle::class) {
            return back()->with('error', 'Image does not belong to this raffle.');
        }

        $image->delete();

        return back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Get all entries for a raffle
     */
    public function getEntries(Raffle $raffle)
    {
        $entries = $raffle->entries()
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
    public function showWinnerSelection(Raffle $raffle)
    {
        $raffle->load(['entries', 'winner']);

        return Inertia::render('admin/raffles/winner-selection', [
            'raffle' => [
                'id' => $raffle->id,
                'title' => $raffle->title,
                'slug' => $raffle->slug,
                'status' => $raffle->status,
                'winner_id' => $raffle->winner_id,
                'winner' => $raffle->winner ? [
                    'id' => $raffle->winner->id,
                    'name' => $raffle->winner->name,
                    'phone' => $raffle->winner->phone,
                    'facebook_url' => $raffle->winner->facebook_url,
                ] : null,
                'entries' => $raffle->entries->map(function ($entry) {
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
     * Select a random winner
     */
    public function selectWinner(Raffle $raffle)
    {
        if ($raffle->winner_id) {
            return back()->with('error', 'A winner has already been selected for this raffle.');
        }

        if ($raffle->entries()->count() === 0) {
            return back()->with('error', 'No entries found for this raffle.');
        }

        $winner = $raffle->selectWinner();

        if (!$winner) {
            return back()->with('error', 'Failed to select a winner.');
        }

        return back()->with('success', "Winner selected: {$winner->name}");
    }

    /**
     * Update entry status
     */
    public function updateEntryStatus(Request $request, Raffle $raffle, RaffleEntry $entry)
    {
        $request->validate([
            'status' => 'required|in:pending,verified,winner,rejected',
        ]);

        if ($entry->raffle_id !== $raffle->id) {
            return back()->with('error', 'Entry does not belong to this raffle.');
        }

        $entry->update(['status' => $request->status]);

        return back()->with('success', 'Entry status updated successfully.');
    }

    /**
     * Delete an entry
     */
    public function deleteEntry(Raffle $raffle, RaffleEntry $entry)
    {
        if ($entry->raffle_id !== $raffle->id) {
            return back()->with('error', 'Entry does not belong to this raffle.');
        }

        $entry->delete();

        return back()->with('success', 'Entry deleted successfully.');
    }

    /**
     * Mark prize as claimed
     */
    public function claimPrize(Raffle $raffle)
    {
        if (!$raffle->winner_id) {
            return back()->with('error', 'No winner selected for this raffle.');
        }

        if ($raffle->prize_claimed) {
            return back()->with('error', 'Prize has already been marked as claimed.');
        }

        $raffle->markPrizeAsClaimed();

        return back()->with('success', 'Prize marked as claimed successfully.');
    }

    /**
     * Reject current winner and select a new one
     */
    public function rejectWinner(Request $request, Raffle $raffle)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (!$raffle->winner_id) {
            return back()->with('error', 'No winner selected for this raffle.');
        }

        if ($raffle->prize_claimed) {
            return back()->with('error', 'Cannot reject winner after prize has been claimed.');
        }

        $rejectedWinnerName = $raffle->winner->name;
        $newWinner = $raffle->rejectWinner($request->reason);

        if (!$newWinner) {
            return back()->with('error', 'Failed to select a new winner.');
        }

        return back()->with('success', "Winner '{$rejectedWinnerName}' rejected. New winner selected: {$newWinner->name}");
    }
}
