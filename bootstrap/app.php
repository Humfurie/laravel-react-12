<?php

use App\Http\Middleware\AddRequestContext;
use App\Http\Middleware\CacheHeaders;
use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectIfAuthenticated;
use App\Jobs\RefreshCryptoCache;
use App\Jobs\RefreshStockCache;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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
            AddRequestContext::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            CacheHeaders::class,
        ]);

        $middleware->api(append: [
            AddRequestContext::class,
        ]);

        $middleware->alias([
            'permission' => CheckPermission::class,
            'guest' => RedirectIfAuthenticated::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule) {
        // Update giveaway statuses based on dates every 5 minutes
        $schedule->command('giveaways:update-statuses')->everyFiveMinutes();

        // Automatically select winners for ended giveaways every hour
        $schedule->command('giveaways:select-winners')->hourly();

        // Refresh crypto data cache every 15 minutes
        $schedule->job(new RefreshCryptoCache)->everyFifteenMinutes();

        // Refresh stock data cache every 15 minutes
        $schedule->job(new RefreshStockCache)->everyFifteenMinutes();

        // Sync GitHub data for all projects daily at 3:00 AM
        $schedule->command('projects:sync-github-data')->dailyAt('03:00');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, Throwable $exception, Request $request) {
            // Skip API requests
            if ($request->is('api/*')) {
                return $response;
            }

            // Skip authentication exceptions - let Laravel handle the redirect
            if ($exception instanceof AuthenticationException) {
                return $response;
            }

            // Skip validation exceptions - let Laravel handle them normally
            if ($exception instanceof ValidationException) {
                return $response;
            }

            // Handle HTTP exceptions (404, 403, etc.)
            if ($exception instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                $status = $exception->getStatusCode();

                // For Inertia requests, render the Error page
                return inertia('errors/Error', [
                    'status' => $status,
                    'message' => $exception->getMessage() ?: null,
                ])->toResponse($request)->setStatusCode($status);
            }

            // For other exceptions in production, show generic 500 error
            if (! app()->environment('local')) {
                return inertia('errors/Error', [
                    'status' => 500,
                    'message' => null,
                ])->toResponse($request)->setStatusCode(500);
            }

            return $response;
        });
    })->create();
