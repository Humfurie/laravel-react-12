<?php

namespace App\Services\SocialMedia;

use App\Models\SocialAccount;
use App\Models\SocialPost;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Http;

/**
 * Threads Service
 *
 * Handles Meta Threads integration for posting and analytics.
 *
 * Features:
 * - OAuth 2.0 authentication via Threads API
 * - Text and video posting
 * - Metrics and insights
 * - Token refresh with long-lived tokens
 * - Two-step publish process
 *
 * Requirements:
 * - Threads account
 * - Meta Developer app
 *
 * API Documentation: https://developers.facebook.com/docs/threads
 */
class ThreadsService extends BaseSocialMediaService
{
    /**
     * Threads API base URL
     */
    protected string $apiUrl = 'https://graph.threads.net';

    /**
     * OAuth base URL
     */
    protected string $oauthUrl = 'https://threads.net';

    /**
     * API version
     */
    protected string $apiVersion = 'v1.0';

    /**
     * Get OAuth authorization URL for Threads.
     *
     * Requests scopes for:
     * - threads_basic: Basic profile information
     * - threads_content_publish: Create and publish posts
     * - threads_manage_insights: Read insights
     * - threads_manage_replies: Manage replies
     * - threads_read_replies: Read replies
     *
     * @param string $state CSRF protection token
     * @return string Authorization URL
     */
    public function getAuthorizationUrl(string $state): string
    {
        $clientId = config('services.threads.client_id');
        $redirectUri = config('services.threads.redirect');

        $scopes = [
            'threads_basic',
            'threads_content_publish',
            'threads_manage_insights',
            'threads_manage_replies',
            'threads_read_replies',
        ];

        $params = [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'scope' => implode(',', $scopes),
            'response_type' => 'code',
            'state' => $state,
        ];

        return $this->oauthUrl . '/oauth/authorize?' . http_build_query($params);
    }

    /**
     * Handle OAuth callback and exchange code for access tokens.
     *
     * API: POST /oauth/access_token
     * Docs: https://developers.facebook.com/docs/threads/get-started
     *
     * @param string $code Authorization code from Threads
     * @return array User info and access tokens
     *
     * @throws Exception If token exchange fails
     */
    public function handleCallback(string $code): array
    {
        try {
            // Exchange code for short-lived access token
            $response = Http::asForm()->post($this->apiUrl . '/oauth/access_token', [
                'client_id' => config('services.threads.client_id'),
                'client_secret' => config('services.threads.client_secret'),
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.threads.redirect'),
                'code' => $code,
            ]);

            if (!$response->successful()) {
                throw new Exception('Token exchange failed: ' . $response->body());
            }

            $tokenData = $response->json();
            $accessToken = $tokenData['access_token'] ?? null;

            if (!$accessToken) {
                throw new Exception('No access token received');
            }

            // Exchange for long-lived token (60 days)
            $longLivedResponse = Http::get($this->apiUrl . '/access_token', [
                'grant_type' => 'th_exchange_token',
                'client_secret' => config('services.threads.client_secret'),
                'access_token' => $accessToken,
            ]);

            if ($longLivedResponse->successful()) {
                $longLivedData = $longLivedResponse->json();
                $accessToken = $longLivedData['access_token'] ?? $accessToken;
                $expiresIn = $longLivedData['expires_in'] ?? 5184000; // 60 days
            } else {
                $expiresIn = 3600; // 1 hour for short-lived
            }

            // Get user info
            $userResponse = Http::get($this->apiUrl . '/' . $this->apiVersion . '/me', [
                'fields' => 'id,username,name,threads_profile_picture_url',
                'access_token' => $accessToken,
            ]);

            if (!$userResponse->successful()) {
                throw new Exception('Failed to fetch user info: ' . $userResponse->body());
            }

            $userInfo = $userResponse->json();

            return [
                'access_token' => $accessToken,
                'refresh_token' => null, // Threads doesn't use refresh tokens
                'expires_at' => now()->addSeconds($expiresIn),
                'scopes' => explode(',', $tokenData['scope'] ?? ''),
                'user_info' => [
                    'platform_user_id' => $userInfo['id'],
                    'username' => $userInfo['username'],
                    'name' => $userInfo['name'] ?? $userInfo['username'],
                    'avatar_url' => $userInfo['threads_profile_picture_url'] ?? null,
                    'metadata' => [],
                ],
            ];
        } catch (Exception $e) {
            throw new Exception('Threads OAuth error: ' . $e->getMessage());
        }
    }

    /**
     * Refresh access token.
     *
     * API: GET /access_token
     * Docs: https://developers.facebook.com/docs/threads/get-started#long-lived-token
     *
     * @param SocialAccount $account Account to refresh
     * @return array New token data
     *
     * @throws Exception If refresh fails
     */
    public function refreshAccessToken(SocialAccount $account): array
    {
        try {
            // Refresh long-lived token
            $response = Http::get($this->apiUrl . '/access_token', [
                'grant_type' => 'th_refresh_token',
                'access_token' => $account->access_token,
            ]);

            if (!$response->successful()) {
                throw new Exception('Token refresh failed: ' . $response->body());
            }

            $data = $response->json();

            return [
                'access_token' => $data['access_token'],
                'refresh_token' => null,
                'expires_at' => now()->addSeconds($data['expires_in'] ?? 5184000),
            ];
        } catch (Exception $e) {
            throw new Exception('Failed to refresh Threads token: ' . $e->getMessage());
        }
    }

    /**
     * Publish a video to Threads.
     *
     * Threads uses a two-step process:
     * 1. Create a media container
     * 2. Publish the container
     *
     * API: POST /{user-id}/threads
     * Docs: https://developers.facebook.com/docs/threads/posts
     *
     * @param SocialAccount $account Account to post to
     * @param SocialPost $post Post data
     * @return array Platform post ID and post URL
     *
     * @throws Exception If publishing fails
     */
    public function publishVideo(SocialAccount $account, SocialPost $post): array
    {
        try {
            // Get public video URL (required by Threads API)
            $videoUrl = config('app.url') . '/storage/' . ltrim($post->video_path, '/');

            // Build text with hashtags
            $text = $post->description;
            if (!empty($post->hashtags)) {
                $hashtags = array_map(fn($tag) => "#{$tag}", $post->hashtags);
                $text .= "\n\n" . implode(' ', $hashtags);
            }

            // Step 1: Create media container
            $containerData = [
                'media_type' => 'VIDEO',
                'video_url' => $videoUrl,
                'text' => mb_substr($text, 0, 500), // Threads text limit
                'access_token' => $account->access_token,
            ];

            // Add thumbnail if provided
            if ($post->thumbnail_path) {
                $thumbnailUrl = config('app.url') . '/storage/' . ltrim($post->thumbnail_path, '/');
                $containerData['image_url'] = $thumbnailUrl;
            }

            $containerResponse = Http::asForm()->post(
                $this->apiUrl . '/' . $this->apiVersion . '/' . $account->platform_user_id . '/threads',
                $containerData
            );

            if (!$containerResponse->successful()) {
                throw new Exception('Failed to create media container: ' . $containerResponse->body());
            }

            $containerResult = $containerResponse->json();
            $containerId = $containerResult['id'] ?? null;

            if (!$containerId) {
                throw new Exception('No container ID received');
            }

            // Step 2: Poll for container status (video processing)
            $maxAttempts = 30;
            $attempt = 0;
            $containerReady = false;

            while ($attempt < $maxAttempts) {
                sleep(2); // Wait 2 seconds between checks

                $statusResponse = Http::get(
                    $this->apiUrl . '/' . $this->apiVersion . '/' . $containerId,
                    [
                        'fields' => 'status,error_message',
                        'access_token' => $account->access_token,
                    ]
                );

                if ($statusResponse->successful()) {
                    $statusData = $statusResponse->json();
                    $status = $statusData['status'] ?? '';

                    if ($status === 'FINISHED') {
                        $containerReady = true;
                        break;
                    } elseif ($status === 'ERROR') {
                        throw new Exception('Video processing failed: ' . ($statusData['error_message'] ?? 'Unknown error'));
                    }
                }

                $attempt++;
            }

            if (!$containerReady) {
                throw new Exception('Video processing timeout');
            }

            // Step 3: Publish the container
            $publishResponse = Http::asForm()->post(
                $this->apiUrl . '/' . $this->apiVersion . '/' . $account->platform_user_id . '/threads_publish',
                [
                    'creation_id' => $containerId,
                    'access_token' => $account->access_token,
                ]
            );

            if (!$publishResponse->successful()) {
                throw new Exception('Failed to publish: ' . $publishResponse->body());
            }

            $publishResult = $publishResponse->json();
            $postId = $publishResult['id'] ?? null;

            if (!$postId) {
                throw new Exception('No post ID received');
            }

            // Get post permalink
            $postResponse = Http::get(
                $this->apiUrl . '/' . $this->apiVersion . '/' . $postId,
                [
                    'fields' => 'permalink',
                    'access_token' => $account->access_token,
                ]
            );

            $postData = $postResponse->json();
            $permalink = $postData['permalink'] ?? "https://www.threads.net/@{$account->username}/post/{$postId}";

            return [
                'platform_post_id' => $postId,
                'video_url' => $permalink,
            ];
        } catch (Exception $e) {
            throw new Exception('Failed to publish Threads post: ' . $e->getMessage());
        }
    }

    /**
     * Get metrics for a specific Threads post.
     *
     * API: GET /{media-id}/insights
     * Docs: https://developers.facebook.com/docs/threads/insights
     *
     * @param SocialAccount $account Account that owns the post
     * @param string $platformPostId Threads post ID
     * @return array Metrics data
     */
    public function getPostMetrics(SocialAccount $account, string $platformPostId): array
    {
        try {
            // Get post insights
            $metrics = [
                'views',
                'likes',
                'replies',
                'reposts',
                'quotes',
            ];

            $response = Http::get(
                $this->apiUrl . '/' . $this->apiVersion . '/' . $platformPostId . '/insights',
                [
                    'metric' => implode(',', $metrics),
                    'access_token' => $account->access_token,
                ]
            );

            if (!$response->successful()) {
                return [
                    'views' => 0,
                    'likes' => 0,
                    'replies' => 0,
                    'reposts' => 0,
                    'quotes' => 0,
                ];
            }

            $insights = $response->json()['data'] ?? [];

            // Parse insights
            $parsedInsights = [];
            foreach ($insights as $insight) {
                $parsedInsights[$insight['name']] = $insight['values'][0]['value'] ?? 0;
            }

            return [
                'views' => $parsedInsights['views'] ?? 0,
                'likes' => $parsedInsights['likes'] ?? 0,
                'replies' => $parsedInsights['replies'] ?? 0,
                'reposts' => $parsedInsights['reposts'] ?? 0,
                'quotes' => $parsedInsights['quotes'] ?? 0,
            ];
        } catch (Exception $e) {
            return [
                'views' => 0,
                'likes' => 0,
                'replies' => 0,
                'reposts' => 0,
                'quotes' => 0,
            ];
        }
    }

    /**
     * Get account-level analytics.
     *
     * API: GET /{user-id}/threads_insights
     *
     * @param SocialAccount $account Account to fetch analytics for
     * @param Carbon $startDate Start date
     * @param Carbon $endDate End date
     * @return array Analytics data
     */
    public function getAccountAnalytics(SocialAccount $account, Carbon $startDate, Carbon $endDate): array
    {
        try {
            // Account-level metrics
            $metrics = [
                'views',
                'likes',
                'replies',
                'reposts',
                'quotes',
                'followers_count',
            ];

            $response = Http::get(
                $this->apiUrl . '/' . $this->apiVersion . '/' . $account->platform_user_id . '/threads_insights',
                [
                    'metric' => implode(',', $metrics),
                    'since' => $startDate->timestamp,
                    'until' => $endDate->timestamp,
                    'access_token' => $account->access_token,
                ]
            );

            if (!$response->successful()) {
                return [
                    'views' => 0,
                    'likes' => 0,
                    'replies' => 0,
                    'reposts' => 0,
                    'quotes' => 0,
                    'followers' => 0,
                ];
            }

            $insights = $response->json()['data'] ?? [];

            // Parse insights
            $analytics = [];
            foreach ($insights as $insight) {
                $analytics[$insight['name']] = $insight['values'] ?? [];
            }

            return [
                'views' => $this->sumInsightValues($analytics['views'] ?? []),
                'likes' => $this->sumInsightValues($analytics['likes'] ?? []),
                'replies' => $this->sumInsightValues($analytics['replies'] ?? []),
                'reposts' => $this->sumInsightValues($analytics['reposts'] ?? []),
                'quotes' => $this->sumInsightValues($analytics['quotes'] ?? []),
                'followers' => $this->getLatestInsightValue($analytics['followers_count'] ?? []),
            ];
        } catch (Exception $e) {
            return [
                'views' => 0,
                'likes' => 0,
                'replies' => 0,
                'reposts' => 0,
                'quotes' => 0,
                'followers' => 0,
            ];
        }
    }

    /**
     * Sum all values in an insight array.
     *
     * @param array $values Insight values
     * @return int Total sum
     */
    protected function sumInsightValues(array $values): int
    {
        $sum = 0;
        foreach ($values as $item) {
            $sum += $item['value'] ?? 0;
        }

        return $sum;
    }

    /**
     * Get the latest value from an insight array.
     *
     * @param array $values Insight values
     * @return int Latest value
     */
    protected function getLatestInsightValue(array $values): int
    {
        if (empty($values)) {
            return 0;
        }

        return end($values)['value'] ?? 0;
    }

    /**
     * Get audience insights (demographics).
     *
     * Note: Demographics not available in Threads API currently
     *
     * @param SocialAccount $account Account to fetch insights for
     * @return array Audience demographic data
     */
    public function getAudienceInsights(SocialAccount $account): array
    {
        // Demographics not currently available in Threads API
        return [
            'gender_age' => [],
            'countries' => [],
            'cities' => [],
        ];
    }
}
