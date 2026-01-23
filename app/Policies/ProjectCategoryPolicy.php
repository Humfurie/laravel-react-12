<?php

namespace App\Policies;

use App\Models\User;

class ProjectCategoryPolicy
{
    /**
     * Project categories use the same permissions as projects.
     */
    protected function hasPermission(User $user, string $action): bool
    {
        return $user->hasPermission('project', $action);
    }

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny');
    }

    public function view(User $user, $model): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'create');
    }

    public function update(User $user, $model): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'update');
    }

    public function delete(User $user, $model): bool
    {
        return $this->hasPermission($user, 'viewAny') && $this->hasPermission($user, 'delete');
    }
}
