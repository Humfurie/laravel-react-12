<?php

use App\Http\Middleware\AddRequestContext;
use App\Http\Middleware\CacheHeaders;
use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\McpApiKeyAuth;
use App\Http\Middleware\RedirectIfAuthenticated;
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

        $middleware->web(prepend: [
            CacheHeaders::class,
        ]);

        $middleware->web(append: [
            AddRequestContext::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(append: [
            AddRequestContext::class,
        ]);

        $middleware->alias([
            'permission' => CheckPermission::class,
            'guest' => RedirectIfAuthenticated::class,
            'mcp.auth' => McpApiKeyAuth::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule) {
        // Sync GitHub data for all projects daily at 3:00 AM
        $schedule->command('projects:sync-github-data')->dailyAt('03:00');

        // Sync GitHub user contributions daily at 3:30 AM
        $schedule->command('github:sync-contributions')->dailyAt('03:30');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, Throwable $exception, Request $request) {
            // Skip API and MCP requests — they expect JSON, not Inertia HTML
            if ($request->is('api/*', 'mcp/*')) {
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

                try {
                    return inertia('errors/Error', [
                        'status' => $status,
                        'message' => $exception->getMessage() ?: null,
                    ])->toResponse($request)->setStatusCode($status);
                } catch (\Throwable) {
                    return response($status.' | '.($exception->getMessage() ?: 'Error'), $status);
                }
            }

            // For other exceptions in production, show generic 500 error
            if (! app()->environment('local')) {
                try {
                    return inertia('errors/Error', [
                        'status' => 500,
                        'message' => null,
                    ])->toResponse($request)->setStatusCode(500);
                } catch (\Throwable) {
                    return response('500 | Server Error', 500);
                }
            }

            return $response;
        });
    })->create();
