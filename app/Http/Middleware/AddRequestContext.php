<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AddRequestContext
{
    /**
     * Handle an incoming request.
     *
     * Adds request context that will be automatically included in all log entries.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Add trace ID for request tracking
        Context::add('trace_id', (string)Str::uuid());

        // Add request information
        Context::add('request_url', $request->url());
        Context::add('request_method', $request->method());

        // Add user context if authenticated
        if ($request->user()) {
            Context::add('user_id', $request->user()->id);
            Context::add('user_email', $request->user()->email);
        }

        // Add IP address (hidden from logs for privacy)
        Context::addHidden('ip_address', $request->ip());

        return $next($request);
    }
}
