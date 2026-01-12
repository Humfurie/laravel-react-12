<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Video Upload Configuration
    |--------------------------------------------------------------------------
    |
    | Configure video upload settings including max file size, allowed formats,
    | storage disk, and storage path.
    |
    */

    'video' => [
        // Maximum video file size in kilobytes (2GB = 2097152 KB)
        // Can be overridden via SOCIAL_MEDIA_VIDEO_MAX_SIZE env variable
        'max_size' => env('SOCIAL_MEDIA_VIDEO_MAX_SIZE', 2097152),

        // Allowed video MIME types
        'allowed_mimes' => ['mp4', 'mov', 'avi', 'wmv', 'webm', 'mkv'],

        // Storage disk to use for video files (public, minio, s3, etc.)
        // Recommended: 'minio' for scalability, 'public' for local development
        'storage_disk' => env('SOCIAL_MEDIA_STORAGE_DISK', 'public'),

        // Base path within the storage disk for video files
        'storage_path' => 'social-media/videos',
    ],

    /*
    |--------------------------------------------------------------------------
    | Thumbnail Configuration
    |--------------------------------------------------------------------------
    |
    | Configure thumbnail generation settings for videos.
    |
    */

    'thumbnail' => [
        // Maximum thumbnail file size in kilobytes (5MB)
        'max_size' => 5120,

        // Time in seconds to extract thumbnail from video
        // Default: Extract frame at 2 seconds mark
        'default_time' => 2,

        // Storage path for thumbnails
        'storage_path' => 'social-media/thumbnails',

        // Thumbnail dimensions
        'width' => 1280,
        'height' => 720,

        // Quality for WebP conversion (0-100)
        'quality' => 85,
    ],

    /*
    |--------------------------------------------------------------------------
    | Platform-Specific Configuration
    |--------------------------------------------------------------------------
    |
    | Configure platform-specific settings including character limits,
    | hashtag limits, and video requirements.
    |
    */

    'platforms' => [
        'youtube' => [
            // Enable/disable YouTube integration
            'enabled' => env('YOUTUBE_ENABLED', true),

            // Character limits
            'title_max_length' => 100,
            'description_max_length' => 5000,

            // Maximum number of hashtags
            'hashtags_max' => 15,

            // Video requirements
            'video_min_duration' => 1, // seconds
            'video_max_duration' => 43200, // 12 hours in seconds
            'video_max_size' => 262144000, // 256GB in KB

            // Supported video formats
            'supported_formats' => ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'],

            // OAuth scopes required
            'oauth_scopes' => [
                'https://www.googleapis.com/auth/youtube.upload',
                'https://www.googleapis.com/auth/youtube',
                'https://www.googleapis.com/auth/youtube.readonly',
                'https://www.googleapis.com/auth/yt-analytics.readonly',
            ],
        ],

        'facebook' => [
            'enabled' => env('FACEBOOK_ENABLED', true),

            // Character limits
            'description_max_length' => 63206,

            // Hashtag limits (Facebook doesn't enforce strict limits)
            'hashtags_max' => 30,

            // Video requirements
            'video_min_duration' => 1,
            'video_max_duration' => 14400, // 4 hours
            'video_max_size' => 10485760, // 10GB in KB

            // Supported formats
            'supported_formats' => ['mp4', 'mov'],

            // OAuth scopes
            'oauth_scopes' => [
                'pages_manage_posts',
                'pages_read_engagement',
                'read_insights',
            ],
        ],

        'instagram' => [
            'enabled' => env('INSTAGRAM_ENABLED', true),

            // Character limits
            'caption_max_length' => 2200,

            // Hashtag limits
            'hashtags_max' => 30,

            // Video requirements for Feed
            'video_min_duration' => 3,
            'video_max_duration' => 600, // 10 minutes
            'video_max_size' => 4194304, // 4GB in KB

            // Video requirements for Reels
            'reels_min_duration' => 3,
            'reels_max_duration' => 60,
            'reels_max_size' => 4194304,

            // Supported formats
            'supported_formats' => ['mp4', 'mov'],

            // OAuth scopes
            'oauth_scopes' => [
                'instagram_basic',
                'instagram_content_publish',
                'instagram_manage_insights',
            ],
        ],

        'tiktok' => [
            'enabled' => env('TIKTOK_ENABLED', true),

            // Character limits
            'caption_max_length' => 150,

            // Hashtag limits
            'hashtags_max' => 5,

            // Video requirements
            'video_min_duration' => 3,
            'video_max_duration' => 600, // 10 minutes
            'video_max_size' => 4194304, // 4GB in KB

            // Supported formats
            'supported_formats' => ['mp4', 'mov', 'webm'],

            // OAuth scopes
            'oauth_scopes' => [
                'video.upload',
                'video.list',
                'user.info.stats',
            ],
        ],

        'threads' => [
            'enabled' => env('THREADS_ENABLED', true),

            // Character limits
            'caption_max_length' => 500,

            // Hashtag limits
            'hashtags_max' => 30,

            // Video requirements (similar to Instagram)
            'video_min_duration' => 3,
            'video_max_duration' => 300, // 5 minutes
            'video_max_size' => 4194304, // 4GB in KB

            // Supported formats
            'supported_formats' => ['mp4', 'mov'],

            // OAuth scopes
            'oauth_scopes' => [
                'threads_basic',
                'threads_content_publish',
                'threads_manage_insights',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Metrics & Analytics Configuration
    |--------------------------------------------------------------------------
    |
    | Configure how often metrics are fetched and how long they're retained.
    |
    */

    'metrics' => [
        // How often to fetch metrics from platforms (in seconds)
        // Default: 3600 seconds (1 hour)
        'fetch_interval' => env('SOCIAL_MEDIA_METRICS_INTERVAL', 3600),

        // How many days to retain historical metrics
        // Default: 90 days
        'retention_days' => env('SOCIAL_MEDIA_METRICS_RETENTION', 90),

        // Whether to fetch metrics in real-time or via queue
        // Recommended: true (use queue for better performance)
        'use_queue' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Publishing Configuration
    |--------------------------------------------------------------------------
    |
    | Configure publishing behavior, retry settings, and queue handling.
    |
    */

    'publishing' => [
        // Maximum number of retry attempts for failed publishes
        'max_retries' => 3,

        // Delay between retry attempts (in seconds)
        'retry_delay' => 120,

        // Whether to use queue for publishing (highly recommended)
        'use_queue' => true,

        // Queue name for publishing jobs
        'queue_name' => 'social-media',

        // Maximum execution time for publishing jobs (in seconds)
        'timeout' => 300,
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Configuration
    |--------------------------------------------------------------------------
    |
    | Configure rate limits for API requests to prevent hitting platform limits.
    |
    */

    'rate_limiting' => [
        'enabled' => true,

        // Cache key prefix for rate limit tracking
        'cache_prefix' => 'social_media_rate_limit',

        // Time window for rate limiting (in seconds)
        'window' => 60,

        // Per-platform rate limits (requests per window)
        'limits' => [
            'youtube' => 100,
            'facebook' => 200,
            'instagram' => 200,
            'tiktok' => 100,
            'threads' => 200,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Configure caching for API responses and analytics data.
    |
    */

    'cache' => [
        // Enable caching of API responses
        'enabled' => true,

        // Cache key prefix
        'prefix' => 'social_media',

        // Default TTL for cached data (in seconds)
        // Default: 3600 seconds (1 hour)
        'ttl' => 3600,

        // Cache driver (null = use default Laravel cache driver)
        'driver' => null,
    ],
];
