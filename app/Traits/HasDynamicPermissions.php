<?php

namespace App\Traits;

use App\Models\User;

trait HasDynamicPermissions
{
    /**
     * Get the resource name for permission checks.
     * Override this method in your policy if needed.
     */
    protected function getResourceName(): string
    {
        // Extract model name from policy class name
        // e.g., BlogPolicy -> blog, UserPolicy -> user
        $className = class_basename(static::class);
        $modelName = str_replace('Policy', '', $className);

        return strtolower($modelName);
    }

    /**
     * Check if user has permission for a specific action on this resource.
     */
    protected function hasPermission(User $user, string $action): bool
    {
        return $user->hasPermission($this->getResourceName(), $action);
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny');
    }

    /**
     * Determine whether the user can view the model.
     * Requires viewAny permission as prerequisite.
     */
    public function view(User $user, $model): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'view');
    }

    /**
     * Determine whether the user can create models.
     * Requires viewAny permission as prerequisite.
     */
    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'create');
    }

    /**
     * Determine whether the user can update the model.
     * Requires viewAny permission as prerequisite.
     */
    public function update(User $user, $model): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'update');
    }

    /**
     * Determine whether the user can delete the model.
     * Requires viewAny permission as prerequisite.
     */
    public function delete(User $user, $model): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'delete');
    }

    /**
     * Determine whether the user can restore the model.
     * Requires viewAny permission as prerequisite.
     */
    public function restore(User $user, $model): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'restore');
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Requires viewAny permission as prerequisite.
     */
    public function forceDelete(User $user, $model): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'forceDelete');
    }
}
