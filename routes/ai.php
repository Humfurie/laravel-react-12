<?php

use App\Http\Controllers\McpController;
use App\Mcp\Servers\PortfolioServer;
use Illuminate\Support\Facades\Route;
use Laravel\Mcp\Facades\Mcp;

// Remote: HTTP transport (claude.ai) — accessible at POST /mcp/portfolio
// Custom controller for Octane/Swoole compatibility (fixes response offset bug)
Route::post('mcp/portfolio', McpController::class)
    ->middleware(['mcp.auth', 'throttle:60,1'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

Route::get('mcp/portfolio', fn () => response('', 405, ['Allow' => 'POST']));

// Local: stdio transport (Claude Code) — start with: php artisan mcp:start portfolio
Mcp::local('portfolio', PortfolioServer::class);
