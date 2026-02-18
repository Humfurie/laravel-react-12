<?php

use App\Mcp\Servers\PortfolioServer;
use Laravel\Mcp\Server\Facades\Mcp;

// Remote: HTTP transport (claude.ai) — accessible at POST /mcp/portfolio
// Protected by: bearer token auth + rate limiting (60 req/min)
Mcp::web('portfolio', PortfolioServer::class)
    ->middleware(['mcp.auth', 'throttle:60,1'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

// Local: stdio transport (Claude Code) — start with: php artisan mcp:start portfolio
// No auth needed — runs as a trusted local process
Mcp::local('portfolio', PortfolioServer::class);
