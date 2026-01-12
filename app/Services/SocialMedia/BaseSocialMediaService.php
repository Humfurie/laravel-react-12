<?php

namespace App\Services\SocialMedia;

use App\Models\SocialAccount;
use App\Models\SocialPost;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Base Social Media Service
 *
 * Abstract base class that defines the contract for all social media platform services.
 * Each platform (YouTube, Facebook, Instagram, TikTok, Threads) must extend this class
 * and implement all abstract methods.
 *
 * This class provides common functionality like HTTP requests, token management,
 * rate limiting, and error handling that all platforms can use.
 */
abstract class BaseSocialMediaService
{
    /**
     * The platform identifier (youtube, facebook, instagram, tiktok, threads).
     */
    protected string $platform;

    /**
     * Get the OAuth authorization URL for this platform.
     *
     * @param string $state Unique state token to prevent CSRF attacks
     * @return string The authorization URL to redirect the user to
     */
    abstract public function getAuthorizationUrl(string $state): string;

    /**
     * Handle the OAuth callback and exchange the authorization code for tokens.
     *
     * @param string $code The authorization code received from the platform
     * @return array Token data including access_token, refresh_token, expires_at, user_info
     *
     * @throws Exception If the token exchange fails
     */
    abstract public function handleCallback(string $code): array;

    /**
     * Publish a video to the platform.
     *
     * @param SocialAccount $account The account to publish from
     * @param SocialPost $post The post containing video and metadata
     * @return array Response data including platform_post_id and video_url
     *
     * @throws Exception If publishing fails
     */
    abstract public function publishVideo(SocialAccount $account, SocialPost $post): array;

    /**
     * Get metrics for a specific post.
     *
     * @param SocialAccount $account The account that owns the post
     * @param string $platformPostId The platform's post/video ID
     * @return array Metrics data (views, likes, comments, etc.)
     *
     * @throws Exception If metrics fetching fails
     */
    abstract public function getPostMetrics(SocialAccount $account, string $platformPostId): array;

    /**
     * Get analytics for a social account over a date range.
     *
     * @param SocialAccount $account The account to get analytics for
     * @param Carbon $startDate Start of date range
     * @param Carbon $endDate End of date range
     * @return array Analytics data (follower growth, engagement, etc.)
     *
     * @throws Exception If analytics fetching fails
     */
    abstract public function getAccountAnalytics(SocialAccount $account, Carbon $startDate, Carbon $endDate): array;

    /**
     * Get audience insights/demographics for an account.
     *
     * @param SocialAccount $account The account to get insights for
     * @return array Demographics data (age, gender, location, etc.)
     *
     * @throws Exception If insights fetching fails
     */
    abstract public function getAudienceInsights(SocialAccount $account): array;

    /**
     * Get the platform identifier.
     */
    public function getPlatform(): string
    {
        return $this->platform;
    }

    /**
     * Make an authenticated HTTP request to the platform API.
     *
     * This method handles:
     * - Automatic token refresh if expired
     * - Rate limiting
     * - Error handling and logging
     * - Response caching (optional)
     *
     * @param SocialAccount $account The account to make the request for
     * @param string $method HTTP method (GET, POST, PUT, DELETE)
     * @param string $endpoint API endpoint URL
     * @param array $data Request payload (for POST/PUT)
     * @param array $headers Additional headers
     * @param bool $cache Whether to cache the response
     * @param int $cacheTtl Cache TTL in seconds
     * @return array Response data
     *
     * @throws Exception If request fails
     */
    protected function makeRequest(
        SocialAccount $account,
        string        $method,
        string        $endpoint,
        array         $data = [],
        array         $headers = [],
        bool          $cache = false,
        int           $cacheTtl = 3600
    ): array
    {
        // Check if token needs refreshing
        if ($this->isTokenExpired($account)) {
            Log::info("Token expired for {$this->platform} account {$account->id}, refreshing...");

            try {
                $tokenData = $this->refreshAccessToken($account);

                // Update the account with new tokens
                $account->update([
                    'access_token' => $tokenData['access_token'],
                    'refresh_token' => $tokenData['refresh_token'] ?? $account->refresh_token,
                    'token_expires_at' => $tokenData['expires_at'] ?? null,
                    'status' => 'active',
                ]);

                Log::info("Token refreshed successfully for {$this->platform} account {$account->id}");
            } catch (Exception $e) {
                // Mark account as expired if token refresh fails
                $account->update(['status' => 'expired']);
                Log::error("Failed to refresh token for {$this->platform} account {$account->id}: {$e->getMessage()}");

                throw $e;
            }
        }

        // Check rate limits
        if (!$this->canMakeRequest()) {
            throw new Exception("Rate limit exceeded for {$this->platform}");
        }

        // Check cache if enabled
        if ($cache) {
            $cacheKey = $this->getCacheKey($endpoint, $data);

            $cached = Cache::get($cacheKey);

            if ($cached !== null) {
                Log::debug("Cache hit for {$this->platform} endpoint: {$endpoint}");

                return $cached;
            }
        }

        // Prepare headers with authorization
        $headers = array_merge([
            'Authorization' => 'Bearer ' . $account->access_token,
            'Accept' => 'application/json',
        ], $headers);

        // Make the HTTP request
        try {
            $response = Http::withHeaders($headers)
                ->timeout(30)
                ->{strtolower($method)}($endpoint, $data);

            // Increment rate limit counter
            $this->incrementRequestCount();

            // Check for errors
            if (!$response->successful()) {
                Log::error("{$this->platform} API error: " . $response->body());

                throw new Exception('API request failed: ' . $response->body());
            }

            $responseData = $response->json();

            // Cache the response if enabled
            if ($cache) {
                Cache::put($cacheKey, $responseData, $cacheTtl);
                Log::debug("Cached response for {$this->platform} endpoint: {$endpoint}");
            }

            return $responseData;
        } catch (Exception $e) {
            Log::error("{$this->platform} API request failed: {$e->getMessage()}", [
                'endpoint' => $endpoint,
                'method' => $method,
            ]);

            throw $e;
        }
    }

    /**
     * Check if the account's access token is expired or about to expire.
     *
     * @param SocialAccount $account The account to check
     * @param int $bufferMinutes Minutes before expiry to consider token expired (default: 5)
     * @return bool True if token is expired or about to expire
     */
    protected function isTokenExpired(SocialAccount $account, int $bufferMinutes = 5): bool
    {
        if (!$account->token_expires_at) {
            return false;
        }

        return $account->token_expires_at->subMinutes($bufferMinutes)->isPast();
    }

    /**
     * Refresh an expired access token using the refresh token.
     *
     * @param SocialAccount $account The social account whose token needs refreshing
     * @return array Updated token data
     *
     * @throws Exception If token refresh fails
     */
    abstract public function refreshAccessToken(SocialAccount $account): array;

    /**
     * Check if we can make a request without hitting rate limits.
     *
     * @return bool True if within rate limits
     */
    protected function canMakeRequest(): bool
    {
        if (!config('social-media.rate_limiting.enabled', true)) {
            return true;
        }

        $key = $this->getRateLimitKey();
        $limit = config("social-media.rate_limiting.limits.{$this->platform}", 100);
        $window = config('social-media.rate_limiting.window', 60);

        $current = Cache::get($key, 0);

        return $current < $limit;
    }

    /**
     * Get the cache key for rate limiting.
     */
    protected function getRateLimitKey(): string
    {
        $prefix = config('social-media.rate_limiting.cache_prefix', 'social_media_rate_limit');

        return "{$prefix}:{$this->platform}";
    }

    /**
     * Get the cache key for an API response.
     *
     * @param string $endpoint The API endpoint
     * @param array $params Request parameters
     */
    protected function getCacheKey(string $endpoint, array $params = []): string
    {
        $prefix = config('social-media.cache.prefix', 'social_media');
        $hash = md5($endpoint . json_encode($params));

        return "{$prefix}:{$this->platform}:{$hash}";
    }

    /**
     * Increment the API request counter for rate limiting.
     */
    protected function incrementRequestCount(): void
    {
        if (!config('social-media.rate_limiting.enabled', true)) {
            return;
        }

        $key = $this->getRateLimitKey();
        $window = config('social-media.rate_limiting.window', 60);

        $current = Cache::get($key, 0);
        Cache::put($key, $current + 1, $window);
    }
}
