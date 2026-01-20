<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheHeaders
{
    /**
     * Cache configuration for public pages.
     * max-age: browser cache duration (seconds)
     * s-maxage: CDN/proxy cache duration (seconds)
     *
     * @var array<string, array{max_age: int, s_maxage: int}>
     */
    private array $cacheConfig = [
        '/' => ['max_age' => 300, 's_maxage' => 3600],           // Homepage: 5min browser, 1hr CDN
        '/blog' => ['max_age' => 300, 's_maxage' => 1800],       // Blog listing: 5min browser, 30min CDN
        '/blog/*' => ['max_age' => 300, 's_maxage' => 3600],     // Blog posts: 5min browser, 1hr CDN
        '/projects' => ['max_age' => 300, 's_maxage' => 3600],   // Projects: 5min browser, 1hr CDN
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

        // Check exact match first
        if (isset($this->cacheConfig[$path])) {
            return $this->cacheConfig[$path];
        }

        // Check wildcard patterns
        foreach ($this->cacheConfig as $pattern => $settings) {
            if (str_contains($pattern, '*')) {
                $regex = str_replace(['/', '*'], ['\/', '.*'], $pattern);
                if (preg_match('/^'.$regex.'$/', $path)) {
                    return $settings;
                }
            }
        }

        return null;
    }
}
