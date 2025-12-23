<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportCommentRequest;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\CommentReport;
use App\Models\Giveaway;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class CommentController extends Controller
{
    use AuthorizesRequests;

    /**
     * Store a new comment on a blog.
     */
    public function store(StoreCommentRequest $request, Blog $blog): JsonResponse|RedirectResponse
    {
        return $this->storeComment($request, $blog);
    }

    /**
     * Store a new comment on a giveaway.
     */
    public function storeOnGiveaway(StoreCommentRequest $request, Giveaway $giveaway): JsonResponse|RedirectResponse
    {
        return $this->storeComment($request, $giveaway);
    }

    /**
     * Store a new comment (shared logic).
     */
    protected function storeComment(StoreCommentRequest $request, Blog|Giveaway $commentable): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();

        // Sanitize content - strip ALL HTML tags for security
        $validated['content'] = strip_tags($validated['content']);

        // Create comment
        $comment = $commentable->comments()->create([
            'user_id' => $request->user()->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => $validated['content'],
            'status' => 'approved', // Auto-approve all comments
        ]);

        // Load relationships
        $comment->load('user', 'replies.user');

        return response()->json([
            'message' => 'Comment posted successfully.',
            'comment' => $comment,
        ], 201);
    }

    /**
     * Update an existing comment.
     */
    public function update(UpdateCommentRequest $request, Comment $comment): JsonResponse|RedirectResponse
    {
        // Authorize (policy checks ownership or admin)
        $this->authorize('update', $comment);

        $validated = $request->validated();

        // Sanitize content - strip ALL HTML tags for security
        $validated['content'] = strip_tags($validated['content']);

        // Update comment
        $comment->update(['content' => $validated['content']]);

        // Mark as edited
        $comment->markAsEdited();

        // Reload relationships
        $comment->load('user', 'replies.user');

        return response()->json([
            'message' => 'Comment updated successfully.',
            'comment' => $comment,
        ]);
    }

    /**
     * Delete a comment (soft delete).
     */
    public function destroy(Comment $comment): JsonResponse|RedirectResponse
    {
        // Authorize (policy checks ownership or admin)
        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully.',
        ]);
    }

    /**
     * Report a comment.
     */
    public function report(ReportCommentRequest $request, Comment $comment): JsonResponse
    {
        $validated = $request->validated();

        // Check if user has already reported this comment
        $existingReport = CommentReport::where('comment_id', $comment->id)
            ->where('reported_by', $request->user()->id)
            ->first();

        if ($existingReport) {
            return response()->json([
                'message' => 'You have already reported this comment.',
            ], 422);
        }

        // Create report
        CommentReport::create([
            'comment_id' => $comment->id,
            'reported_by' => $request->user()->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Comment reported successfully. Our team will review it shortly.',
        ], 201);
    }
}
