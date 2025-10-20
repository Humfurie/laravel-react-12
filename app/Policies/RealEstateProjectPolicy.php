<?php

namespace App\Policies;

use App\Traits\HasDynamicPermissions;

class RealEstateProjectPolicy
{
    use HasDynamicPermissions;

    /**
     * Override the resource name to match the permission resource name.
     */
    protected function getResourceName(): string
    {
        return 'realestate-project';
    }

    // All permission methods are now inherited from the trait
}
