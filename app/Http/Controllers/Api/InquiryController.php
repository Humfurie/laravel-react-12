<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class InquiryController extends Controller
{
    /**
     * Display a listing of inquiries with filters
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Inquiry::class);

        $query = Inquiry::with(['property.project.developer'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by inquiry type
        if ($request->has('inquiry_type')) {
            $query->where('inquiry_type', $request->get('inquiry_type'));
        }

        // Filter by property
        if ($request->has('property_id')) {
            $query->where('property_id', $request->get('property_id'));
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->get('from_date'));
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->get('to_date'));
        }

        // Search by customer name or email
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        // Show only inquiries that need follow-up
        if ($request->boolean('needs_follow_up')) {
            $query->needsFollowUp();
        }

        $perPage = min($request->get('per_page', 15), 50);
        $inquiries = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $inquiries->items(),
            'meta' => [
                'current_page' => $inquiries->currentPage(),
                'per_page' => $inquiries->perPage(),
                'total' => $inquiries->total(),
                'last_page' => $inquiries->lastPage(),
            ],
        ]);
    }

    /**
     * Display the specified inquiry
     */
    public function show(Inquiry $inquiry): JsonResponse
    {
        Gate::authorize('view', $inquiry);

        $inquiry->load(['property.project.developer']);

        return response()->json([
            'success' => true,
            'data' => $inquiry,
        ]);
    }

    /**
     * Delete the inquiry
     */
    public function destroy(Inquiry $inquiry): JsonResponse
    {
        Gate::authorize('delete', $inquiry);

        $inquiry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inquiry deleted successfully',
        ]);
    }

    /**
     * Bulk update inquiries status
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Inquiry::class);

        $validated = $request->validate([
            'inquiry_ids' => 'required|array',
            'inquiry_ids.*' => 'required|integer|exists:inquiries,id',
            'status' => ['required', 'string', Rule::in([
                Inquiry::STATUS_NEW,
                Inquiry::STATUS_IN_PROGRESS,
                Inquiry::STATUS_RESPONDED,
                Inquiry::STATUS_CLOSED,
            ])],
        ]);

        $inquiries = Inquiry::whereIn('id', $validated['inquiry_ids'])->get();

        // Check authorization for each inquiry
        foreach ($inquiries as $inquiry) {
            Gate::authorize('update', $inquiry);
        }

        // Update all inquiries
        Inquiry::whereIn('id', $validated['inquiry_ids'])
            ->update(['status' => $validated['status']]);

        // If status is responded, update followed_up_at
        if ($validated['status'] === Inquiry::STATUS_RESPONDED) {
            Inquiry::whereIn('id', $validated['inquiry_ids'])
                ->update(['followed_up_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Inquiries updated successfully',
            'updated_count' => count($validated['inquiry_ids']),
        ]);
    }

    /**
     * Update the inquiry (status, notes, etc.)
     */
    public function update(Request $request, Inquiry $inquiry): JsonResponse
    {
        Gate::authorize('update', $inquiry);

        $validated = $request->validate([
            'status' => ['sometimes', 'string', Rule::in([
                Inquiry::STATUS_NEW,
                Inquiry::STATUS_IN_PROGRESS,
                Inquiry::STATUS_RESPONDED,
                Inquiry::STATUS_CLOSED,
            ])],
            'agent_notes' => 'nullable|string',
        ]);

        $inquiry->update($validated);

        // Auto-update followed_up_at when status changes to responded
        if (isset($validated['status']) && $validated['status'] === Inquiry::STATUS_RESPONDED) {
            $inquiry->markAsResponded();
        }

        return response()->json([
            'success' => true,
            'message' => 'Inquiry updated successfully',
            'data' => $inquiry->fresh(),
        ]);
    }

    /**
     * Mark inquiry as in progress
     */
    public function markInProgress(Inquiry $inquiry): JsonResponse
    {
        Gate::authorize('update', $inquiry);

        $inquiry->markAsInProgress();

        return response()->json([
            'success' => true,
            'message' => 'Inquiry marked as in progress',
            'data' => $inquiry->fresh(),
        ]);
    }

    /**
     * Mark inquiry as responded
     */
    public function markResponded(Inquiry $inquiry): JsonResponse
    {
        Gate::authorize('update', $inquiry);

        $inquiry->markAsResponded();

        return response()->json([
            'success' => true,
            'message' => 'Inquiry marked as responded',
            'data' => $inquiry->fresh(),
        ]);
    }

    /**
     * Get inquiry statistics
     */
    public function statistics(): JsonResponse
    {
        Gate::authorize('viewAny', Inquiry::class);

        $stats = [
            'total' => Inquiry::count(),
            'new' => Inquiry::where('status', Inquiry::STATUS_NEW)->count(),
            'in_progress' => Inquiry::where('status', Inquiry::STATUS_IN_PROGRESS)->count(),
            'responded' => Inquiry::where('status', Inquiry::STATUS_RESPONDED)->count(),
            'closed' => Inquiry::where('status', Inquiry::STATUS_CLOSED)->count(),
            'needs_follow_up' => Inquiry::needsFollowUp()->count(),
            'by_type' => [
                'site_visit' => Inquiry::where('inquiry_type', Inquiry::TYPE_SITE_VISIT)->count(),
                'pricing_info' => Inquiry::where('inquiry_type', Inquiry::TYPE_PRICING_INFO)->count(),
                'availability' => Inquiry::where('inquiry_type', Inquiry::TYPE_AVAILABILITY)->count(),
                'financing' => Inquiry::where('inquiry_type', Inquiry::TYPE_FINANCING)->count(),
                'general' => Inquiry::where('inquiry_type', Inquiry::TYPE_GENERAL)->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
