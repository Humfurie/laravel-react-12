<?php

namespace App\Policies;

use App\Models\GuestbookEntry;
use App\Models\User;

class GuestbookEntryPolicy
{
    /**
     * Determine whether the user can view any models (admin panel).
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, GuestbookEntry $entry): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, GuestbookEntry $entry): bool
    {
        return $entry->isOwnedBy($user) || $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, GuestbookEntry $entry): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, GuestbookEntry $entry): bool
    {
        return $user->isAdmin();
    }
}
