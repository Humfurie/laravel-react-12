<?php

namespace App\Policies;

use App\Traits\HasDynamicPermissions;

class DeveloperPolicy
{
    use HasDynamicPermissions;

    // All permission methods are now inherited from the trait
    // The trait will automatically use 'developer' as the resource name
    // based on the class name 'DeveloperPolicy'
}
