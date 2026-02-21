<?php

namespace App\Http\Middleware;

use App\Models\McpOAuthToken;
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

        $token = $request->bearerToken();

        if (! $token) {
            RateLimiter::hit($rateLimitKey, 60);
            abort(401, 'Unauthorized.');
        }

        // Try API key auth first
        $apiKey = config('services.mcp.api_key');
        if ($apiKey && hash_equals($apiKey, $token)) {
            RateLimiter::clear($rateLimitKey);
            Log::info('MCP request authenticated via API key', ['ip' => $ip]);

            return $next($request);
        }

        // Try OAuth token auth
        $tokenHash = hash('sha256', $token);
        $oauthToken = McpOAuthToken::where('token_hash', $tokenHash)
            ->where('expires_at', '>', now())
            ->first();

        if ($oauthToken) {
            RateLimiter::clear($rateLimitKey);
            Log::info('MCP request authenticated via OAuth', ['ip' => $ip, 'user_id' => $oauthToken->user_id]);

            return $next($request);
        }

        RateLimiter::hit($rateLimitKey, 60);

        Log::warning('MCP authentication failed', [
            'ip' => $ip,
            'has_token' => true,
        ]);

        abort(401, 'Unauthorized.');
    }
}
