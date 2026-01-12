<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'fmp' => [
        'api_key' => env('FMP_API_KEY'),
        'base_url' => 'https://financialmodelingprep.com/stable',
    ],

    'google_analytics' => [
        'measurement_id' => env('GOOGLE_ANALYTICS_ID'),
    ],

    'adsense' => [
        'client_id' => env('ADSENSE_CLIENT_ID'),
        'slots' => [
            'blog_post_top' => env('ADSENSE_BLOG_POST_TOP_SLOT'),
            'blog_post_bottom' => env('ADSENSE_BLOG_POST_BOTTOM_SLOT'),
            'blog_post_sidebar' => env('ADSENSE_BLOG_POST_SIDEBAR_SLOT'),
            'giveaway_top' => env('ADSENSE_GIVEAWAY_TOP_SLOT'),
            'giveaway_sidebar' => env('ADSENSE_GIVEAWAY_SIDEBAR_SLOT'),
        ],
    ],

    'facebook' => [
        'app_id' => env('FACEBOOK_APP_ID'),
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => '/auth/facebook/callback',
    ],

    'github' => [
        'token' => env('GITHUB_TOKEN'),
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => '/auth/github/callback',
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => '/auth/google/callback',
    ],

    /*
    |--------------------------------------------------------------------------
    | Social Media Management Platforms
    |--------------------------------------------------------------------------
    |
    | Credentials for social media platforms used in the social media dashboard.
    | These are separate from the general social auth (facebook, google, github)
    | and are specifically for managing social media accounts and posting content.
    |
    */

    'youtube' => [
        'client_id' => env('YOUTUBE_CLIENT_ID'),
        'client_secret' => env('YOUTUBE_CLIENT_SECRET'),
        'redirect' => env('APP_URL') . '/admin/social-media/connect/youtube/callback',
    ],

    'facebook_page' => [
        'app_id' => env('FACEBOOK_PAGE_APP_ID', env('FACEBOOK_APP_ID')),
        'client_id' => env('FACEBOOK_PAGE_APP_ID', env('FACEBOOK_APP_ID')),
        'client_secret' => env('FACEBOOK_PAGE_APP_SECRET', env('FACEBOOK_APP_SECRET')),
        'redirect' => env('APP_URL') . '/admin/social-media/connect/facebook/callback',
    ],

    'instagram' => [
        'app_id' => env('INSTAGRAM_APP_ID'),
        'client_id' => env('INSTAGRAM_APP_ID'), // Instagram uses app_id as client_id
        'client_secret' => env('INSTAGRAM_APP_SECRET'),
        'redirect' => env('APP_URL') . '/admin/social-media/connect/instagram/callback',
    ],

    'tiktok' => [
        'client_key' => env('TIKTOK_CLIENT_KEY'),
        'client_secret' => env('TIKTOK_CLIENT_SECRET'),
        'redirect' => env('APP_URL') . '/admin/social-media/connect/tiktok/callback',
    ],

    'threads' => [
        'app_id' => env('THREADS_APP_ID'),
        'client_id' => env('THREADS_APP_ID'), // Threads uses app_id as client_id
        'client_secret' => env('THREADS_APP_SECRET'),
        'redirect' => env('APP_URL') . '/admin/social-media/connect/threads/callback',
    ],

];
