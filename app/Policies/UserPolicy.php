<?php

namespace App\Policies;

use App\Models\User;
use App\Traits\HasDynamicPermissions;

class UserPolicy
{
    use HasDynamicPermissions;

    /**
     * Prevent modification of user ID 1 (super admin) by others.
     * User ID 1 can update their own profile but cannot change roles.
     */
    public function update(User $authUser, User $targetUser): bool
    {
        // Prevent modification of user ID 1 by anyone except themselves
        if ($targetUser->id === 1 && $authUser->id !== 1) {
            return false;
        }

        return $this->hasPermission($authUser, 'update');
    }

    /**
     * Prevent role assignment/changes for user ID 1.
     * This ensures user ID 1 always remains the super admin.
     */
    public function assignRole(User $authUser, User $targetUser): bool
    {
        // Prevent role changes for user ID 1
        if ($targetUser->id === 1) {
            return false;
        }

        return $this->hasPermission($authUser, 'update');
    }

    /**
     * Prevent deletion of user ID 1.
     */
    public function delete(User $authUser, User $targetUser): bool
    {
        // Prevent deletion of user ID 1
        if ($targetUser->id === 1) {
            return false;
        }

        return $this->hasPermission($authUser, 'delete');
    }

    /**
     * Prevent force deletion of user ID 1.
     */
    public function forceDelete(User $authUser, User $targetUser): bool
    {
        // Prevent force deletion of user ID 1
        if ($targetUser->id === 1) {
            return false;
        }

        return $this->hasPermission($authUser, 'forceDelete');
    }
}
