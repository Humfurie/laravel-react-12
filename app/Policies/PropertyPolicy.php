<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;
use App\Traits\HasDynamicPermissions;

class PropertyPolicy
{
    use HasDynamicPermissions;

    /**
     * Determine whether the user can view any models.
     * Override to allow public access.
     */
    public function viewAny(?User $user): bool
    {
        // Anyone can view properties list (including guests for public API)
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * Override to allow public access with restrictions.
     */
    public function view(?User $user, Property $property): bool
    {
        // Anyone can view non-deleted properties
        if (!$property->trashed()) {
            return true;
        }

        // Admin can view soft-deleted properties
        return $user && $this->hasPermission($user, 'view');
    }
}
