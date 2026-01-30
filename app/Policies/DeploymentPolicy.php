<?php

namespace App\Policies;

use App\Traits\HasDynamicPermissions;

class DeploymentPolicy
{
    use HasDynamicPermissions;

    // All permission methods are inherited from the trait
    // The trait will automatically use 'deployment' as the resource name
    // based on the class name 'DeploymentPolicy'
}
