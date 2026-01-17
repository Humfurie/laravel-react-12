<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Homepage Cache Time-To-Live Values
    |--------------------------------------------------------------------------
    |
    | These values define how long homepage data should be cached (in seconds).
    | Different resources have different TTLs based on update frequency:
    | - Blogs: 600s (10 min) - frequently updated content
    | - Projects: 1800s (30 min) - moderately updated
    | - Experiences/Expertises/User Profile: 3600s (1 hour) - rarely updated
    |
    */

    'homepage' => [
        'blogs' => env('CACHE_TTL_HOMEPAGE_BLOGS', 600),
        'projects' => env('CACHE_TTL_HOMEPAGE_PROJECTS', 1800),
        'projects_limit' => env('HOMEPAGE_PROJECTS_LIMIT', 6),
        'experiences' => env('CACHE_TTL_HOMEPAGE_EXPERIENCES', 3600),
        'expertises' => env('CACHE_TTL_HOMEPAGE_EXPERTISES', 3600),
        'user_profile' => env('CACHE_TTL_HOMEPAGE_USER_PROFILE', 3600),
    ],

    /*
    |--------------------------------------------------------------------------
    | Listing Page Cache Time-To-Live Values
    |--------------------------------------------------------------------------
    |
    | Cache TTLs for listing/index pages.
    |
    */

    'listing' => [
        'projects_featured' => env('CACHE_TTL_LISTING_PROJECTS_FEATURED', 1800),
        'projects_tech_stack' => env('CACHE_TTL_LISTING_PROJECTS_TECH_STACK', 1800),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Key Prefixes
    |--------------------------------------------------------------------------
    |
    | Centralized cache key definitions for easier management and refactoring.
    |
    */

    'keys' => [
        'homepage_blogs' => 'homepage.blogs',
        'homepage_projects' => 'homepage.projects',
        'homepage_experiences' => 'homepage.experiences',
        'homepage_expertises' => 'homepage.expertises',
        'homepage_user_profile' => 'homepage.user_profile',
        'listing_projects_featured' => 'projects.featured',
        'listing_projects_tech_stack' => 'projects.tech_stack',
        'admin_dashboard' => 'admin:dashboard',
    ],
];
