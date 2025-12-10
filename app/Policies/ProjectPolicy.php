<?php

namespace App\Policies;

use App\Traits\HasDynamicPermissions;

class ProjectPolicy
{
    use HasDynamicPermissions;

    // All permission methods are inherited from the trait
    // The trait will automatically use 'project' as the resource name
    // based on the class name 'ProjectPolicy'
}
