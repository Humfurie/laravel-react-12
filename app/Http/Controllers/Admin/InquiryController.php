<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    /**
     * Display a listing of inquiries.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Inquiry::class);

        $query = Inquiry::with(['property.project.developer'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by inquiry type
        if ($request->filled('type')) {
            $query->where('inquiry_type', $request->get('type'));
        }

        // Search by customer name, email, or phone
        if ($request->filled('search')) {
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

        $inquiries = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Inquiry::count(),
            'new' => Inquiry::where('status', Inquiry::STATUS_NEW)->count(),
            'in_progress' => Inquiry::where('status', Inquiry::STATUS_IN_PROGRESS)->count(),
            'responded' => Inquiry::where('status', Inquiry::STATUS_RESPONDED)->count(),
            'closed' => Inquiry::where('status', Inquiry::STATUS_CLOSED)->count(),
            'needs_follow_up' => Inquiry::needsFollowUp()->count(),
        ];

        return Inertia::render('admin/inquiries/index', [
            'inquiries' => $inquiries,
            'stats' => $stats,
            'filters' => $request->only(['status', 'type', 'search', 'needs_follow_up']),
            'statuses' => [
                ['value' => Inquiry::STATUS_NEW, 'label' => 'New'],
                ['value' => Inquiry::STATUS_IN_PROGRESS, 'label' => 'In Progress'],
                ['value' => Inquiry::STATUS_RESPONDED, 'label' => 'Responded'],
                ['value' => Inquiry::STATUS_CLOSED, 'label' => 'Closed'],
            ],
            'types' => [
                ['value' => Inquiry::TYPE_SITE_VISIT, 'label' => 'Site Visit'],
                ['value' => Inquiry::TYPE_PRICING_INFO, 'label' => 'Pricing Info'],
                ['value' => Inquiry::TYPE_AVAILABILITY, 'label' => 'Availability'],
                ['value' => Inquiry::TYPE_FINANCING, 'label' => 'Financing'],
                ['value' => Inquiry::TYPE_GENERAL, 'label' => 'General'],
            ],
        ]);
    }

    /**
     * Display the specified inquiry.
     */
    public function show(Inquiry $inquiry): Response
    {
        Gate::authorize('view', $inquiry);

        $inquiry->load(['property.project.developer']);

        return Inertia::render('admin/inquiries/show', [
            'inquiry' => $inquiry,
        ]);
    }

    /**
     * Update the inquiry status.
     */
    public function updateStatus(Request $request, Inquiry $inquiry): RedirectResponse
    {
        Gate::authorize('update', $inquiry);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in([
                Inquiry::STATUS_NEW,
                Inquiry::STATUS_IN_PROGRESS,
                Inquiry::STATUS_RESPONDED,
                Inquiry::STATUS_CLOSED,
            ])],
            'agent_notes' => 'nullable|string|max:1000',
        ]);

        $inquiry->update($validated);

        // Auto-update followed_up_at when status changes to responded
        if ($validated['status'] === Inquiry::STATUS_RESPONDED) {
            $inquiry->update(['followed_up_at' => now()]);
        }

        return back()->with('success', 'Inquiry status updated successfully.');
    }

    /**
     * Remove the specified inquiry.
     */
    public function destroy(Inquiry $inquiry): RedirectResponse
    {
        Gate::authorize('delete', $inquiry);

        $inquiry->delete();

        return redirect()->route('inquiries.index')->with('success', 'Inquiry deleted successfully.');
    }
}
