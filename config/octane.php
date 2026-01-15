<?php

use Laravel\Octane\Octane;

return [
    'server' => env('OCTANE_SERVER', 'swoole'),

    'https' => env('OCTANE_HTTPS', false),

    'listeners' => [],

    /*
    |--------------------------------------------------------------------------
    | Warm Services
    |--------------------------------------------------------------------------
    |
    | Pre-resolve these services on worker boot to eliminate cold start latency.
    | This significantly reduces TTFB variance on first requests.
    |
    */
    'warm' => [
        ...Octane::defaultServicesToWarm(),
        \Illuminate\Cache\CacheManager::class,
        \Illuminate\Database\DatabaseManager::class,
        \Inertia\ResponseFactory::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Flush Services
    |--------------------------------------------------------------------------
    |
    | Services that should be flushed/reset between requests to prevent
    | state leakage. Add any services that cache request-specific data.
    |
    */
    'flush' => [
        \Inertia\ResponseFactory::class,
    ],

    'cache' => [
        'rows' => 1000,
        'bytes' => 10000,
    ],

    'tables' => [],

    'tick' => true,

    'workers' => env('OCTANE_WORKERS', 'auto'),

    'task_workers' => env('OCTANE_TASK_WORKERS', 'auto'),

    'max_requests' => env('OCTANE_MAX_REQUESTS', 500),

    'reset' => [],

    'garbage' => 50,

    'swoole' => [
        'options' => [
            'log_file' => storage_path('logs/swoole_http.log'),
            'package_max_length' => 10 * 1024 * 1024,
            // Performance optimizations
            'buffer_output_size' => 4 * 1024 * 1024,
            'socket_buffer_size' => 4 * 1024 * 1024,
            'enable_coroutine' => true,
        ],
    ],
];
