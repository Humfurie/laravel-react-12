<?php

namespace App\Services\SocialMedia;

use App\Models\SocialAccount;
use App\Models\SocialPost;
use Carbon\Carbon;
use Exception;
use Facebook\Exceptions\FacebookSDKException;
use Facebook\Facebook;

/**
 * Instagram Service
 *
 * Handles Instagram Business Account integration for video posting (Reels) and analytics.
 *
 * Features:
 * - OAuth 2.0 authentication via Facebook Graph API
 * - Reels publishing (Instagram video format)
 * - Instagram Insights and metrics
 * - Token refresh with long-lived tokens
 * - Two-step publish process (create container → publish)
 *
 * Requirements:
 * - Instagram Business or Creator Account
 * - Connected to a Facebook Page
 *
 * API Documentation: https://developers.facebook.com/docs/instagram-api
 * Reels API: https://developers.facebook.com/docs/instagram-api/guides/content-publishing#reels
 */
class InstagramService extends BaseSocialMediaService
{
    /**
     * Facebook SDK instance (Instagram API is part of Facebook Graph API)
     */
    protected Facebook $facebook;

    /**
     * API version
     */
    protected string $apiVersion = 'v19.0';

    /**
     * Create a new Instagram service instance.
     */
    public function __construct()
    {
        $this->facebook = new Facebook([
            'app_id' => config('services.instagram.client_id'),
            'app_secret' => config('services.instagram.client_secret'),
            'default_graph_version' => $this->apiVersion,
        ]);
    }

    /**
     * Get OAuth authorization URL for Instagram.
     *
     * Requests permissions for:
     * - instagram_basic: Basic profile information
     * - instagram_content_publish: Create and publish posts
     * - instagram_manage_insights: Read insights
     * - pages_show_list: List connected Pages
     * - pages_read_engagement: Read Page engagement
     *
     * @param string $state CSRF protection token
     * @return string Authorization URL
     */
    public function getAuthorizationUrl(string $state): string
    {
        $helper = $this->facebook->getRedirectLoginHelper();

        $permissions = [
            'instagram_basic',
            'instagram_content_publish',
            'instagram_manage_insights',
            'pages_show_list',
            'pages_read_engagement',
        ];

        $redirectUrl = config('services.instagram.redirect');

        return $helper->getLoginUrl($redirectUrl, $permissions, $state);
    }

    /**
     * Handle OAuth callback and exchange code for access tokens.
     *
     * Workflow:
     * 1. Exchange authorization code for user access token
     * 2. Get user's Facebook Pages
     * 3. Get Instagram Business Account connected to Page
     * 4. Return Instagram account information and tokens
     *
     * @param string $code Authorization code from Facebook
     * @return array User info and access tokens
     *
     * @throws Exception If no Instagram Business Account found
     */
    public function handleCallback(string $code): array
    {
        $helper = $this->facebook->getRedirectLoginHelper();

        try {
            // Exchange code for user access token
            $accessToken = $helper->getAccessToken(config('services.instagram.redirect'));

            if (!$accessToken) {
                throw new Exception('Failed to obtain access token');
            }

            // Set default access token
            $this->facebook->setDefaultAccessToken($accessToken);

            // Get user's Facebook Pages
            $response = $this->facebook->get('/me/accounts');
            $pages = $response->getDecodedBody()['data'] ?? [];

            if (empty($pages)) {
                throw new Exception('No Facebook Pages found. Instagram Business Account must be connected to a Page.');
            }

            // Find first Page with Instagram Business Account
            $instagramAccount = null;
            $pageAccessToken = null;

            foreach ($pages as $page) {
                try {
                    // Check if Page has Instagram Business Account
                    $this->facebook->setDefaultAccessToken($page['access_token']);
                    $igResponse = $this->facebook->get(
                        "/{$page['id']}?fields=instagram_business_account{id,username,name,profile_picture_url}"
                    );

                    $pageData = $igResponse->getDecodedBody();

                    if (isset($pageData['instagram_business_account'])) {
                        $instagramAccount = $pageData['instagram_business_account'];
                        $pageAccessToken = $page['access_token'];
                        break;
                    }
                } catch (Exception $e) {
                    // Page doesn't have Instagram account, try next one
                    continue;
                }
            }

            if (!$instagramAccount) {
                throw new Exception('No Instagram Business Account found. Please connect your Instagram account to a Facebook Page.');
            }

            return [
                'access_token' => $pageAccessToken,
                'refresh_token' => null, // Facebook doesn't use refresh tokens for Pages
                'expires_at' => null, // Page tokens don't expire
                'scopes' => [],
                'user_info' => [
                    'platform_user_id' => $instagramAccount['id'],
                    'username' => $instagramAccount['username'],
                    'name' => $instagramAccount['name'] ?? $instagramAccount['username'],
                    'avatar_url' => $instagramAccount['profile_picture_url'] ?? null,
                    'metadata' => [],
                ],
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Facebook API error: ' . $e->getMessage());
        }
    }

    /**
     * Refresh access token.
     *
     * Note: Instagram uses Facebook Page tokens which don't expire.
     *
     * @param SocialAccount $account Account to refresh
     * @return array New token data
     *
     * @throws Exception Page tokens don't need refreshing
     */
    public function refreshAccessToken(SocialAccount $account): array
    {
        // Page access tokens are long-lived and don't expire
        throw new Exception('Instagram Page tokens do not expire. If you are seeing this error, please reconnect your account.');
    }

    /**
     * Publish a video to Instagram as a Reel.
     *
     * Instagram uses a two-step publish process:
     * 1. Create a container with video URL and metadata
     * 2. Publish the container
     *
     * Requirements:
     * - Video must be accessible via public URL
     * - Duration: 3-90 seconds
     * - Format: MP4 or MOV
     * - Aspect ratio: 9:16 recommended
     *
     * API: POST /{ig-user-id}/media
     * Docs: https://developers.facebook.com/docs/instagram-api/guides/content-publishing#reels
     *
     * @param SocialAccount $account Account to post to
     * @param SocialPost $post Post data
     * @return array Platform post ID and media URL
     *
     * @throws Exception If upload fails
     */
    public function publishVideo(SocialAccount $account, SocialPost $post): array
    {
        try {
            $this->facebook->setDefaultAccessToken($account->access_token);

            // Get public video URL (required by Instagram API)
            // For production, use a CDN or temporary signed URL
            $videoUrl = config('app.url') . '/storage/' . ltrim($post->video_path, '/');

            // Build caption with hashtags
            $caption = $post->description;
            if (!empty($post->hashtags)) {
                $hashtags = array_map(fn($tag) => "#{$tag}", $post->hashtags);
                $caption .= "\n\n" . implode(' ', $hashtags);
            }

            // Step 1: Create media container for Reel
            $containerData = [
                'media_type' => 'REELS',
                'video_url' => $videoUrl,
                'caption' => mb_substr($caption, 0, 2200), // Instagram caption limit
            ];

            // Add thumbnail if provided
            if ($post->thumbnail_path) {
                $thumbnailUrl = config('app.url') . '/storage/' . ltrim($post->thumbnail_path, '/');
                $containerData['thumb_offset'] = 0; // Use first frame or specify offset
            }

            $response = $this->facebook->post(
                "/{$account->platform_user_id}/media",
                $containerData
            );

            $result = $response->getDecodedBody();
            $containerId = $result['id'];

            // Step 2: Poll for container status (video processing)
            $maxAttempts = 30;
            $attempt = 0;
            $containerReady = false;

            while ($attempt < $maxAttempts) {
                sleep(2); // Wait 2 seconds between checks

                $statusResponse = $this->facebook->get(
                    "/{$containerId}?fields=status_code"
                );

                $statusData = $statusResponse->getDecodedBody();
                $statusCode = $statusData['status_code'] ?? '';

                if ($statusCode === 'FINISHED') {
                    $containerReady = true;
                    break;
                } elseif ($statusCode === 'ERROR') {
                    throw new Exception('Video processing failed');
                }

                $attempt++;
            }

            if (!$containerReady) {
                throw new Exception('Video processing timeout');
            }

            // Step 3: Publish the container
            $publishResponse = $this->facebook->post(
                "/{$account->platform_user_id}/media_publish",
                ['creation_id' => $containerId]
            );

            $publishResult = $publishResponse->getDecodedBody();
            $mediaId = $publishResult['id'];

            // Get media permalink
            $mediaResponse = $this->facebook->get(
                "/{$mediaId}?fields=permalink"
            );

            $mediaData = $mediaResponse->getDecodedBody();
            $permalink = $mediaData['permalink'] ?? "https://www.instagram.com/p/{$mediaId}/";

            return [
                'platform_post_id' => $mediaId,
                'video_url' => $permalink,
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Failed to publish Instagram Reel: ' . $e->getMessage());
        }
    }

    /**
     * Get metrics for a specific Instagram media post.
     *
     * API: GET /{media-id}/insights
     * Docs: https://developers.facebook.com/docs/instagram-api/reference/ig-media/insights
     *
     * @param SocialAccount $account Account that owns the post
     * @param string $platformPostId Instagram media ID
     * @return array Metrics data
     */
    public function getPostMetrics(SocialAccount $account, string $platformPostId): array
    {
        try {
            $this->facebook->setDefaultAccessToken($account->access_token);

            // Get media insights
            $metrics = [
                'impressions',
                'reach',
                'likes',
                'comments',
                'shares',
                'saved',
                'plays', // For Reels
                'total_interactions',
            ];

            $response = $this->facebook->get(
                "/{$platformPostId}/insights?metric=" . implode(',', $metrics)
            );

            $insights = $response->getDecodedBody()['data'] ?? [];

            // Parse insights into simple key-value array
            $parsedInsights = [];
            foreach ($insights as $insight) {
                $parsedInsights[$insight['name']] = $insight['values'][0]['value'] ?? 0;
            }

            return [
                'views' => $parsedInsights['plays'] ?? $parsedInsights['impressions'] ?? 0,
                'impressions' => $parsedInsights['impressions'] ?? 0,
                'reach' => $parsedInsights['reach'] ?? 0,
                'likes' => $parsedInsights['likes'] ?? 0,
                'comments' => $parsedInsights['comments'] ?? 0,
                'shares' => $parsedInsights['shares'] ?? 0,
                'saves' => $parsedInsights['saved'] ?? 0,
                'interactions' => $parsedInsights['total_interactions'] ?? 0,
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Failed to fetch Instagram metrics: ' . $e->getMessage());
        }
    }

    /**
     * Get account-level analytics for a date range.
     *
     * API: GET /{ig-user-id}/insights
     * Docs: https://developers.facebook.com/docs/instagram-api/reference/ig-user/insights
     *
     * @param SocialAccount $account Account to fetch analytics for
     * @param Carbon $startDate Start date
     * @param Carbon $endDate End date
     * @return array Analytics data
     */
    public function getAccountAnalytics(SocialAccount $account, Carbon $startDate, Carbon $endDate): array
    {
        try {
            $this->facebook->setDefaultAccessToken($account->access_token);

            // Account-level metrics
            $metrics = [
                'impressions',
                'reach',
                'profile_views',
                'website_clicks',
                'follower_count',
            ];

            $response = $this->facebook->get(
                "/{$account->platform_user_id}/insights?metric=" . implode(',', $metrics) .
                "&period=day&since={$startDate->timestamp}&until={$endDate->timestamp}"
            );

            $insights = $response->getDecodedBody()['data'] ?? [];

            // Parse insights
            $analytics = [];
            foreach ($insights as $insight) {
                $analytics[$insight['name']] = $insight['values'] ?? [];
            }

            return [
                'impressions' => $this->sumInsightValues($analytics['impressions'] ?? []),
                'reach' => $this->sumInsightValues($analytics['reach'] ?? []),
                'profile_views' => $this->sumInsightValues($analytics['profile_views'] ?? []),
                'website_clicks' => $this->sumInsightValues($analytics['website_clicks'] ?? []),
                'followers' => $this->getLatestInsightValue($analytics['follower_count'] ?? []),
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Failed to fetch Instagram analytics: ' . $e->getMessage());
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
     * API: GET /{ig-user-id}/insights
     *
     * @param SocialAccount $account Account to fetch insights for
     * @return array Audience demographic data
     */
    public function getAudienceInsights(SocialAccount $account): array
    {
        try {
            $this->facebook->setDefaultAccessToken($account->access_token);

            // Demographic metrics (lifetime period)
            $metrics = [
                'audience_gender_age',
                'audience_country',
                'audience_city',
            ];

            $response = $this->facebook->get(
                "/{$account->platform_user_id}/insights?metric=" . implode(',', $metrics) . '&period=lifetime'
            );

            $insights = $response->getDecodedBody()['data'] ?? [];

            // Parse demographics
            $demographics = [];
            foreach ($insights as $insight) {
                $demographics[$insight['name']] = $insight['values'][0]['value'] ?? [];
            }

            return [
                'gender_age' => $demographics['audience_gender_age'] ?? [],
                'countries' => $demographics['audience_country'] ?? [],
                'cities' => $demographics['audience_city'] ?? [],
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Failed to fetch audience insights: ' . $e->getMessage());
        }
    }
}
