<?php

namespace App\Policies;

use App\Models\Experience;
use App\Models\User;
use App\Traits\HasDynamicPermissions;

class ExperiencePolicy
{
    use HasDynamicPermissions;

    /**
     * Determine whether the user can update the model.
     * Users can update their own experiences, or if they have the update permission.
     */
    public function update(User $user, Experience $experience): bool
    {
        // Allow if user owns the experience
        if ($user->id === $experience->user_id) {
            return true;
        }

        // Otherwise check permissions
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'update');
    }

    /**
     * Determine whether the user can delete the model.
     * Users can delete their own experiences, or if they have the delete permission.
     */
    public function delete(User $user, Experience $experience): bool
    {
        // Allow if user owns the experience
        if ($user->id === $experience->user_id) {
            return true;
        }

        // Otherwise check permissions
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'delete');
    }
}
