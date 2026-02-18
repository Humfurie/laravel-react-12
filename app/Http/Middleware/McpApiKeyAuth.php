<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class McpApiKeyAuth
{
    /**
     * Maximum auth attempts per minute per IP.
     */
    private const MAX_ATTEMPTS = 10;

    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();
        $rateLimitKey = 'mcp-auth:'.$ip;

        // IP allowlist check (if configured)
        $allowedIps = config('services.mcp.allowed_ips', []);
        if (! empty($allowedIps) && ! in_array($ip, $allowedIps, true)) {
            Log::warning('MCP access denied — IP not in allowlist', ['ip' => $ip]);

            abort(403, 'Forbidden.');
        }

        // Rate limit authentication attempts
        if (RateLimiter::tooManyAttempts($rateLimitKey, self::MAX_ATTEMPTS)) {
            Log::warning('MCP rate limit exceeded', ['ip' => $ip]);

            abort(429, 'Too many requests.');
        }

        $apiKey = config('services.mcp.api_key');

        // If no API key configured, remote access is completely disabled
        if (! $apiKey) {
            Log::error('MCP API key not configured — remote access is disabled.');

            abort(503, 'Service unavailable.');
        }

        $token = $request->bearerToken();

        if (! $token || ! hash_equals($apiKey, $token)) {
            RateLimiter::hit($rateLimitKey, 60);

            Log::warning('MCP authentication failed', [
                'ip' => $ip,
                'has_token' => (bool) $token,
            ]);

            abort(401, 'Unauthorized.');
        }

        // Clear rate limiter on successful auth
        RateLimiter::clear($rateLimitKey);

        Log::info('MCP request authenticated', ['ip' => $ip]);

        return $next($request);
    }
}
