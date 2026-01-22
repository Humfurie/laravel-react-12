<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheHeaders
{
    /**
     * Route pattern to config key mapping.
     *
     * @var array<string, string>
     */
    private array $routeConfigMap = [
        '/' => 'homepage',
        '/blog' => 'blog_listing',
        '/blog/*' => 'blog_post',
        '/projects' => 'projects',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $response;
        }

        // Don't cache if user is authenticated
        if ($request->user()) {
            return $response;
        }

        $path = $request->path();
        $cacheSettings = $this->getCacheSettings($path);

        if ($cacheSettings) {
            $response->headers->set(
                'Cache-Control',
                sprintf('public, max-age=%d, s-maxage=%d', $cacheSettings['max_age'], $cacheSettings['s_maxage'])
            );
        }

        return $response;
    }

    /**
     * Get cache settings for the given path.
     *
     * @return array{max_age: int, s_maxage: int}|null
     */
    private function getCacheSettings(string $path): ?array
    {
        // Normalize path
        $path = '/'.ltrim($path, '/');

        $configKey = $this->findConfigKey($path);

        if (! $configKey) {
            return null;
        }

        $config = config("cache-ttl.http_headers.{$configKey}");

        if (! $config) {
            return null;
        }

        return [
            'max_age' => $config['max_age'],
            's_maxage' => $config['s_maxage'],
        ];
    }

    /**
     * Find the config key for the given path.
     */
    private function findConfigKey(string $path): ?string
    {
        // Check exact match first
        if (isset($this->routeConfigMap[$path])) {
            return $this->routeConfigMap[$path];
        }

        // Check wildcard patterns
        foreach ($this->routeConfigMap as $pattern => $configKey) {
            if (str_contains($pattern, '*')) {
                $regex = str_replace(['/', '*'], ['\/', '.*'], $pattern);
                if (preg_match('/^'.$regex.'$/', $path)) {
                    return $configKey;
                }
            }
        }

        return null;
    }
}
