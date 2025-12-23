<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    /**
     * Determine if the user can view any comments (admin interface).
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can view the comment.
     */
    public function view(User $user, Comment $comment): bool
    {
        // Anyone can view approved comments
        if ($comment->status === 'approved') {
            return true;
        }

        // Only owner or admin can view non-approved comments
        return $comment->user_id === $user->id || $user->isAdmin();
    }

    /**
     * Determine if the user can update the comment.
     */
    public function update(User $user, Comment $comment): bool
    {
        // Owner or admin can update
        return $comment->user_id === $user->id || $user->isAdmin();
    }

    /**
     * Determine if the user can delete the comment.
     */
    public function delete(User $user, Comment $comment): bool
    {
        // Owner or admin can delete
        return $comment->user_id === $user->id || $user->isAdmin();
    }

    /**
     * Determine if the user can restore the comment.
     */
    public function restore(User $user, Comment $comment): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can permanently delete the comment.
     */
    public function forceDelete(User $user, Comment $comment): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can moderate comments.
     */
    public function moderate(User $user): bool
    {
        return $user->isAdmin();
    }
}
