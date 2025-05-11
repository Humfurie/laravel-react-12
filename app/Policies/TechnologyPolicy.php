<?php

namespace App\Policies;

use App\Models\Technology;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TechnologyPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {

    }

    public function view(User $user, Technology $technology): bool
    {
    }

    public function create(User $user): bool
    {
    }

    public function update(User $user, Technology $technology): bool
    {
    }

    public function delete(User $user, Technology $technology): bool
    {
    }

    public function restore(User $user, Technology $technology): bool
    {
    }

    public function forceDelete(User $user, Technology $technology): bool
    {
    }
}
