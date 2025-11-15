<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Jobs\RefreshCryptoCache;
use App\Jobs\RefreshStockCache;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->trustProxies(at: '*', headers: Request::HEADER_X_FORWARDED_FOR |
            Request::HEADER_X_FORWARDED_HOST |
            Request::HEADER_X_FORWARDED_PORT |
            Request::HEADER_X_FORWARDED_PROTO |
            Request::HEADER_X_FORWARDED_AWS_ELB
        );

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'permission' => CheckPermission::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule) {
        // Update raffle statuses based on dates every 5 minutes
        $schedule->command('raffles:update-statuses')->everyFiveMinutes();

        // Automatically select winners for ended raffles every hour
        $schedule->command('raffles:select-winners')->hourly();

        // Refresh crypto data cache every 15 minutes
        $schedule->job(new RefreshCryptoCache)->everyFifteenMinutes();

        // Refresh stock data cache every 15 minutes
        $schedule->job(new RefreshStockCache)->everyFifteenMinutes();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
