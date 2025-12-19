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
     * Store a new comment.
     */
    public function store(StoreCommentRequest $request, string $type, int $id): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();

        // Determine commentable type
        $commentable = match ($type) {
            'blog' => Blog::findOrFail($id),
            'giveaway' => Giveaway::findOrFail($id),
            default => abort(404, 'Invalid commentable type.')
        };

        // Sanitize content
        $validated['content'] = strip_tags($validated['content'], '<p><br><strong><em><a>');
        $validated['content'] = htmlspecialchars($validated['content'], ENT_QUOTES, 'UTF-8');

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
        $validated = $request->validated();

        // Sanitize content
        $validated['content'] = strip_tags($validated['content'], '<p><br><strong><em><a>');
        $validated['content'] = htmlspecialchars($validated['content'], ENT_QUOTES, 'UTF-8');

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

        try {
            // Create report (unique constraint prevents duplicates)
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

        } catch (\Illuminate\Database\QueryException $e) {
            // Catch duplicate report error
            if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json([
                    'message' => 'You have already reported this comment.',
                ], 422);
            }

            throw $e;
        }
    }
}
