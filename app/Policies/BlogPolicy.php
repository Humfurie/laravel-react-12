<?php

namespace App\Policies;

use App\Models\Blog;
use App\Models\User;
use App\Traits\HasDynamicPermissions;
use Illuminate\Auth\Access\Response;

class BlogPolicy
{
    use HasDynamicPermissions;

    // All permission methods are now inherited from the trait
    // The trait will automatically use 'blog' as the resource name
    // based on the class name 'BlogPolicy'
}
