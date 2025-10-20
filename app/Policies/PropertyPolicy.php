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
     * Override to allow public access for guests, but check permissions for authenticated users.
     */
    public function viewAny(?User $user): bool
    {
        // Guests can view properties list (for public API)
        if (!$user) {
            return true;
        }

        // Authenticated users need proper permissions
        return $this->hasPermission($user, 'viewAny');
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
