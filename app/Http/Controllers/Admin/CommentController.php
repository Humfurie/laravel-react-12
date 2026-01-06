<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentReport;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CommentController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of all comments.
     */
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', Comment::class);

        $query = Comment::query()
            ->with(['user', 'commentable', 'reports'])
            ->withTrashed();

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by commentable type
        if ($request->filled('commentable_type')) {
            $query->where('commentable_type', 'App\\Models\\' . ucfirst($request->commentable_type));
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search content
        if ($request->filled('search')) {
            $query->where('content', 'like', '%' . $request->search . '%');
        }

        // Filter comments with reports
        if ($request->boolean('has_reports')) {
            $query->has('reports');
        }

        $comments = $query->latest()->paginate(25);

        // Get stats for dashboard
        $stats = [
            'total' => Comment::count(),
            'approved' => Comment::where('status', 'approved')->count(),
            'pending' => Comment::where('status', 'pending')->count(),
            'hidden' => Comment::where('status', 'hidden')->count(),
            'reported' => CommentReport::where('status', 'pending')->count(),
        ];

        return Inertia::render('admin/comments/index', [
            'comments' => $comments,
            'stats' => $stats,
            'filters' => $request->only(['status', 'commentable_type', 'user_id', 'search', 'has_reports']),
        ]);
    }

    /**
     * Display reported comments.
     */
    public function reportedIndex(): InertiaResponse
    {
        $this->authorize('moderate', Comment::class);

        $reports = CommentReport::query()
            ->with(['comment.user', 'comment.commentable', 'reporter', 'reviewer'])
            ->latest()
            ->paginate(20);

        // Calculate stats
        $stats = [
            'pending' => CommentReport::where('status', 'pending')->count(),
            'today' => CommentReport::whereDate('created_at', today())->count(),
            // Database-agnostic average resolution time calculation
            'avg_resolution_time' => CommentReport::where('status', '!=', 'pending')
                ->whereNotNull('reviewed_at')
                ->get()
                ->map(function ($report) {
                    return $report->created_at->diffInHours($report->reviewed_at);
                })
                ->average(),
            'top_reason' => CommentReport::select('reason', DB::raw('count(*) as total'))
                    ->whereDate('created_at', '>=', now()->subDays(7))
                    ->groupBy('reason')
                    ->orderByDesc('total')
                    ->first()?->reason ?? 'N/A',
        ];

        return Inertia::render('admin/comments/reported', [
            'reports' => $reports,
            'stats' => $stats,
        ]);
    }

    /**
     * Update a comment (admin edit).
     */
    public function update(Request $request, Comment $comment)
    {
        $this->authorize('update', $comment);

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        // Sanitize content - strip ALL HTML tags for security
        // Even admins shouldn't be able to inject HTML for consistency and security
        $validated['content'] = strip_tags($validated['content']);

        $comment->update(['content' => $validated['content']]);
        $comment->markAsEdited();

        return back()->with('success', 'Comment updated successfully.');
    }

    /**
     * Delete a comment (admin).
     */
    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return back()->with('success', 'Comment deleted successfully.');
    }

    /**
     * Update comment status.
     */
    public function updateStatus(Request $request, Comment $comment)
    {
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'status' => ['required', 'in:approved,pending,hidden'],
        ]);

        $comment->update(['status' => $validated['status']]);

        return back()->with('success', 'Comment status updated successfully.');
    }

    /**
     * Review and action a comment report.
     */
    public function reviewReport(Request $request, CommentReport $report)
    {
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'action' => ['required', 'in:dismiss,hide,delete'],
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($report, $validated, $request) {
            // Perform action on comment
            if ($validated['action'] === 'hide') {
                $report->comment->update(['status' => 'hidden']);
            } elseif ($validated['action'] === 'delete') {
                $report->comment->delete();
            }

            // Mark report as reviewed
            $report->markAsReviewed(
                $request->user(),
                $validated['action'],
                $validated['admin_notes'] ?? null
            );
        });

        return back()->with('success', 'Report reviewed successfully.');
    }

    /**
     * Bulk delete comments.
     */
    public function bulkDelete(Request $request)
    {
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'comment_ids' => ['required', 'array'],
            'comment_ids.*' => ['exists:comments,id'],
        ]);

        $count = Comment::whereIn('id', $validated['comment_ids'])->delete();

        return back()->with('success', "{$count} comments deleted successfully.");
    }

    /**
     * Bulk approve comments.
     */
    public function bulkApprove(Request $request)
    {
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'comment_ids' => ['required', 'array'],
            'comment_ids.*' => ['exists:comments,id'],
        ]);

        $count = Comment::whereIn('id', $validated['comment_ids'])
            ->update(['status' => 'approved']);

        return back()->with('success', "{$count} comments approved successfully.");
    }

    /**
     * Bulk hide comments.
     */
    public function bulkHide(Request $request)
    {
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'comment_ids' => ['required', 'array'],
            'comment_ids.*' => ['exists:comments,id'],
        ]);

        $count = Comment::whereIn('id', $validated['comment_ids'])
            ->update(['status' => 'hidden']);

        return back()->with('success', "{$count} comments hidden successfully.");
    }
}
