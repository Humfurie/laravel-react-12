<?php

namespace App\Policies;

use App\Models\Inquiry;
use App\Models\User;
use App\Traits\HasDynamicPermissions;

class InquiryPolicy
{
    use HasDynamicPermissions;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Inquiry $inquiry): bool
    {
        return $this->hasPermission($user, 'view');
    }

    /**
     * Determine whether the user can create models.
     * Public can create inquiries (contact forms)
     */
    public function create(?User $user): bool
    {
        // Anyone can create an inquiry (including guests)
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Inquiry $inquiry): bool
    {
        return $this->hasPermission($user, 'update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Inquiry $inquiry): bool
    {
        return $this->hasPermission($user, 'delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Inquiry $inquiry): bool
    {
        return $this->hasPermission($user, 'restore');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Inquiry $inquiry): bool
    {
        return $this->hasPermission($user, 'forceDelete');
    }
}
