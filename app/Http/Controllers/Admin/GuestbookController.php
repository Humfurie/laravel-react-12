<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GuestbookEntry;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GuestbookController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of all guestbook entries.
     */
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', GuestbookEntry::class);

        $validated = $request->validate([
            'status' => ['nullable', 'in:approved,hidden'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $query = GuestbookEntry::query()
            ->with('user')
            ->withTrashed();

        if (! empty($validated['status'])) {
            $query->where('is_approved', $validated['status'] === 'approved');
        }

        if (! empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', '%'.$search.'%')
                    ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', '%'.$search.'%')
                    );
            });
        }

        $entries = $query->latest()->paginate(25);

        $stats = [
            'total' => GuestbookEntry::withTrashed()->count(),
            'approved' => GuestbookEntry::where('is_approved', true)->count(),
            'hidden' => GuestbookEntry::where('is_approved', false)->count(),
        ];

        return Inertia::render('admin/guestbook/index', [
            'entries' => $entries,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Toggle the approval status of a guestbook entry.
     */
    public function updateStatus(Request $request, GuestbookEntry $guestbookEntry)
    {
        $this->authorize('update', $guestbookEntry);

        $validated = $request->validate([
            'is_approved' => ['required', 'boolean'],
        ]);

        $guestbookEntry->update(['is_approved' => $validated['is_approved']]);

        $status = $validated['is_approved'] ? 'approved' : 'hidden';

        return back()->with('success', "Entry has been {$status}.");
    }

    /**
     * Soft delete a guestbook entry.
     */
    public function destroy(GuestbookEntry $guestbookEntry)
    {
        $this->authorize('delete', $guestbookEntry);

        $guestbookEntry->delete();

        return back()->with('success', 'Entry has been deleted.');
    }

    /**
     * Restore a soft-deleted guestbook entry.
     */
    public function restore(GuestbookEntry $guestbookEntry)
    {
        $this->authorize('restore', $guestbookEntry);

        $guestbookEntry->restore();

        return back()->with('success', 'Entry has been restored.');
    }

    /**
     * Permanently delete a guestbook entry.
     */
    public function forceDestroy(GuestbookEntry $guestbookEntry)
    {
        $this->authorize('forceDelete', $guestbookEntry);

        $guestbookEntry->forceDelete();

        return back()->with('success', 'Entry has been permanently deleted.');
    }
}
