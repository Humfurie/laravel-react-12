<?php

namespace App\Policies;

use App\Traits\HasDynamicPermissions;

class GiveawayPolicy
{
    use HasDynamicPermissions;

    // All permission methods are now inherited from the trait
    // The trait will automatically use 'giveaway' as the resource name
    // based on the class name 'GiveawayPolicy'
}
