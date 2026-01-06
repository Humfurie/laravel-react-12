<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     * @param string $resource The resource name (e.g., 'blog', 'developer')
     * @param string $action The action name (e.g., 'viewAny', 'create', 'update')
     */
    public function handle(Request $request, Closure $next, string $resource, string $action): Response
    {
        // Redirect to login if not authenticated
        if (!$request->user()) {
            return redirect()->route('login')->with('error', 'Please login to continue.');
        }

        // Check if user has permission
        if (!$request->user()->hasPermission($resource, $action)) {
            abort(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
