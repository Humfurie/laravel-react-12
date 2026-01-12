<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Rate Limit Service
 *
 * Tracks and enforces API rate limits for social media platforms to prevent
 * hitting platform-specific rate limits. Uses Laravel's cache to store request
 * counts with automatic expiry.
 *
 * Features:
 * - Per-platform rate limiting
 * - Per-account rate limiting
 * - Automatic request count expiry
 * - Rate limit checking before API calls
 * - Logging of rate limit hits
 *
 * Platform Rate Limits (approximate):
 * - YouTube: 10,000 quota units/day (video upload = 1,600 units)
 * - Facebook: 200 calls/hour/user
 * - Instagram: 200 calls/hour/user
 * - TikTok: 100 requests/day
 * - Threads: Similar to Instagram (200/hour)
 *
 * Usage:
 * ```php
 * $rateLimiter = app(RateLimitService::class);
 *
 * if ($rateLimiter->canMakeRequest('youtube', $accountId)) {
 *     // Make API call
 *     $rateLimiter->recordRequest('youtube', $accountId);
 * } else {
 *     // Handle rate limit exceeded
 * }
 * ```
 */
class RateLimitService
{
    /**
     * Platform rate limit configurations
     *
     * Defines the maximum requests allowed per time window for each platform.
     * These are conservative limits to ensure we stay well below platform maximums.
     *
     * @var array<string, array{max_requests: int, window_minutes: int, cost_per_request: int}>
     */
    protected array $platformLimits = [
        'youtube' => [
            'max_requests' => 50, // Conservative limit (actual: 10,000 quota/day)
            'window_minutes' => 1440, // 24 hours
            'cost_per_request' => 100, // Quota units per request
        ],
        'facebook' => [
            'max_requests' => 180, // Conservative (actual: 200/hour)
            'window_minutes' => 60,
            'cost_per_request' => 1,
        ],
        'instagram' => [
            'max_requests' => 180, // Conservative (actual: 200/hour)
            'window_minutes' => 60,
            'cost_per_request' => 1,
        ],
        'tiktok' => [
            'max_requests' => 90, // Conservative (actual: 100/day)
            'window_minutes' => 1440, // 24 hours
            'cost_per_request' => 1,
        ],
        'threads' => [
            'max_requests' => 180, // Conservative (similar to Instagram)
            'window_minutes' => 60,
            'cost_per_request' => 1,
        ],
    ];

    /**
     * Get the remaining requests available for a platform/account.
     *
     * @param string $platform Platform name
     * @param int|null $accountId Optional account ID
     * @return int Remaining requests before rate limit
     */
    public function getRemainingRequests(string $platform, ?int $accountId = null): int
    {
        $config = $this->platformLimits[$platform] ?? null;

        if (!$config) {
            return 999; // Unlimited for unknown platforms
        }

        $currentCount = $this->getCurrentCount($platform, $accountId);
        $maxAllowed = $config['max_requests'] * $config['cost_per_request'];

        return max(0, $maxAllowed - $currentCount);
    }

    /**
     * Get the current request count for a platform/account.
     *
     * Useful for monitoring and debugging rate limit usage.
     *
     * @param string $platform Platform name
     * @param int|null $accountId Optional account ID
     * @return int Current request count
     */
    public function getCurrentCount(string $platform, ?int $accountId = null): int
    {
        $cacheKey = $this->getCacheKey($platform, $accountId);

        return Cache::get($cacheKey, 0);
    }

    /**
     * Get cache key for platform/account combination.
     *
     * @param string $platform Platform name
     * @param int|null $accountId Optional account ID
     * @return string Cache key
     */
    protected function getCacheKey(string $platform, ?int $accountId = null): string
    {
        $base = "rate_limit:{$platform}";

        if ($accountId) {
            return "{$base}:account:{$accountId}";
        }

        return "{$base}:global";
    }

    /**
     * Reset the rate limit counter for a platform/account.
     *
     * Useful for testing or manual intervention.
     *
     * @param string $platform Platform name
     * @param int|null $accountId Optional account ID
     */
    public function resetLimit(string $platform, ?int $accountId = null): void
    {
        $cacheKey = $this->getCacheKey($platform, $accountId);
        Cache::forget($cacheKey);

        Log::info('Rate limit reset', [
            'platform' => $platform,
            'account_id' => $accountId,
        ]);
    }

    /**
     * Get the time remaining until the rate limit resets.
     *
     * @param string $platform Platform name
     * @param int|null $accountId Optional account ID
     * @return int|null Seconds until reset, or null if no limit active
     */
    public function getTimeUntilReset(string $platform, ?int $accountId = null): ?int
    {
        $cacheKey = $this->getCacheKey($platform, $accountId);

        // Check if key exists and get TTL
        if (!Cache::has($cacheKey)) {
            return null;
        }

        // Laravel doesn't provide direct TTL access, so we store it separately
        $ttlCacheKey = $cacheKey . '_ttl';
        $expiryTime = Cache::get($ttlCacheKey);

        if (!$expiryTime) {
            return null;
        }

        return max(0, $expiryTime - time());
    }

    /**
     * Throttle an API call to respect rate limits.
     *
     * Wraps an API call with rate limiting logic. If the rate limit is hit,
     * waits until it resets before making the call.
     *
     * @param string $platform Platform name
     * @param callable $callback API call to make
     * @param int|null $accountId Optional account ID
     * @param int $cost Cost of this request
     * @return mixed Result of the callback
     *
     * @throws Exception If rate limit exceeded and max wait time reached
     */
    public function throttle(string $platform, callable $callback, ?int $accountId = null, int $cost = 1): mixed
    {
        $maxWaitSeconds = 300; // 5 minutes max wait
        $waitedSeconds = 0;

        while (!$this->canMakeRequest($platform, $accountId, $cost)) {
            // Rate limit hit, wait and retry
            $waitTime = min(10, $maxWaitSeconds - $waitedSeconds); // Wait up to 10 seconds at a time

            if ($waitTime <= 0) {
                throw new Exception("Rate limit exceeded for {$platform} and max wait time reached");
            }

            Log::info('Rate limit hit, waiting before retry', [
                'platform' => $platform,
                'account_id' => $accountId,
                'wait_seconds' => $waitTime,
            ]);

            sleep($waitTime);
            $waitedSeconds += $waitTime;
        }

        // Make the API call
        $this->recordRequest($platform, $accountId, $cost);

        return $callback();
    }

    /**
     * Check if an API request can be made for a platform and account.
     *
     * Verifies that making a request would not exceed the platform's rate limit.
     *
     * @param string $platform Platform name (youtube, facebook, etc.)
     * @param int|null $accountId Optional account ID for per-account limiting
     * @param int $cost Cost of this request (default 1, some operations cost more)
     * @return bool True if request can be made, false if rate limited
     */
    public function canMakeRequest(string $platform, ?int $accountId = null, int $cost = 1): bool
    {
        $config = $this->platformLimits[$platform] ?? null;

        if (!$config) {
            // Unknown platform, allow by default
            Log::warning('Rate limit check for unknown platform', ['platform' => $platform]);

            return true;
        }

        $cacheKey = $this->getCacheKey($platform, $accountId);
        $currentCount = Cache::get($cacheKey, 0);
        $requestCost = $cost * $config['cost_per_request'];

        // Check if adding this request would exceed the limit
        $wouldExceed = ($currentCount + $requestCost) > ($config['max_requests'] * $config['cost_per_request']);

        if ($wouldExceed) {
            Log::warning('Rate limit would be exceeded', [
                'platform' => $platform,
                'account_id' => $accountId,
                'current_count' => $currentCount,
                'request_cost' => $requestCost,
                'max_allowed' => $config['max_requests'] * $config['cost_per_request'],
            ]);
        }

        return !$wouldExceed;
    }

    /**
     * Record that an API request was made.
     *
     * Increments the request counter for the platform/account combination.
     * The counter automatically expires after the configured time window.
     *
     * @param string $platform Platform name
     * @param int|null $accountId Optional account ID
     * @param int $cost Cost of this request (default 1)
     */
    public function recordRequest(string $platform, ?int $accountId = null, int $cost = 1): void
    {
        $config = $this->platformLimits[$platform] ?? null;

        if (!$config) {
            return;
        }

        $cacheKey = $this->getCacheKey($platform, $accountId);
        $requestCost = $cost * $config['cost_per_request'];
        $ttl = now()->addMinutes($config['window_minutes']);

        // Increment the counter with automatic expiry
        $currentCount = Cache::get($cacheKey, 0);
        $newCount = $currentCount + $requestCost;

        Cache::put($cacheKey, $newCount, $ttl);

        Log::debug('API request recorded', [
            'platform' => $platform,
            'account_id' => $accountId,
            'cost' => $requestCost,
            'new_count' => $newCount,
            'expires_at' => $ttl->toDateTimeString(),
        ]);
    }
}
