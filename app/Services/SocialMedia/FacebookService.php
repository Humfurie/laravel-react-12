<?php

namespace App\Services\SocialMedia;

use App\Models\SocialAccount;
use App\Models\SocialPost;
use Carbon\Carbon;
use Exception;
use Facebook\Exceptions\FacebookSDKException;
use Facebook\Facebook;

/**
 * Facebook Service
 *
 * Handles Facebook Page integration for video posting and analytics.
 *
 * Features:
 * - OAuth 2.0 authentication with Facebook Graph API
 * - Video publishing to Facebook Pages
 * - Page insights and video metrics
 * - Token refresh with long-lived tokens
 * - Rate limiting and error handling
 *
 * API Documentation: https://developers.facebook.com/docs/graph-api
 * Video Upload: https://developers.facebook.com/docs/graph-api/guides/upload/
 */
class FacebookService extends BaseSocialMediaService
{
    /**
     * Facebook SDK instance
     */
    protected Facebook $facebook;

    /**
     * API version
     */
    protected string $apiVersion = 'v19.0';

    /**
     * Create a new Facebook service instance.
     */
    public function __construct()
    {
        $this->facebook = new Facebook([
            'app_id' => config('services.facebook_page.client_id'),
            'app_secret' => config('services.facebook_page.client_secret'),
            'default_graph_version' => $this->apiVersion,
        ]);
    }

    /**
     * Get OAuth authorization URL for Facebook.
     *
     * Requests permissions for:
     * - pages_show_list: List user's Pages
     * - pages_read_engagement: Read Page insights
     * - pages_manage_posts: Create and manage posts
     * - pages_manage_metadata: Manage Page settings
     * - pages_read_user_content: Read Page content
     *
     * @param string $state CSRF protection token
     * @return string Authorization URL
     */
    public function getAuthorizationUrl(string $state): string
    {
        $helper = $this->facebook->getRedirectLoginHelper();

        $permissions = [
            'pages_show_list',
            'pages_read_engagement',
            'pages_manage_posts',
            'pages_manage_metadata',
            'pages_read_user_content',
        ];

        $redirectUrl = config('services.facebook_page.redirect');

        return $helper->getLoginUrl($redirectUrl, $permissions, $state);
    }

    /**
     * Handle OAuth callback and exchange code for access tokens.
     *
     * Workflow:
     * 1. Exchange authorization code for user access token
     * 2. Get user's Facebook Pages
     * 3. Get Page access token (long-lived)
     * 4. Return first Page's information and tokens
     *
     * Note: Users must select which Page to connect. For simplicity, we connect
     * the first Page. In production, you might want to let users choose.
     *
     * @param string $code Authorization code from Facebook
     * @return array User info and access tokens
     *
     * @throws Exception If no Pages found or token exchange fails
     */
    public function handleCallback(string $code): array
    {
        $helper = $this->facebook->getRedirectLoginHelper();

        try {
            // Exchange code for user access token
            $accessToken = $helper->getAccessToken(config('services.facebook_page.redirect'));

            if (!$accessToken) {
                throw new Exception('Failed to obtain access token');
            }

            // Set default access token for requests
            $this->facebook->setDefaultAccessToken($accessToken);

            // Get user's Facebook Pages
            $response = $this->facebook->get('/me/accounts');
            $pages = $response->getDecodedBody()['data'] ?? [];

            if (empty($pages)) {
                throw new Exception('No Facebook Pages found. Please create a Page first.');
            }

            // Connect the first Page (in production, let user choose)
            $page = $pages[0];

            // Get Page details
            $pageResponse = $this->facebook->get("/{$page['id']}?fields=id,name,username,picture");
            $pageData = $pageResponse->getDecodedBody();

            // Page access token is long-lived (doesn't expire)
            $pageAccessToken = $page['access_token'];

            return [
                'access_token' => $pageAccessToken,
                'refresh_token' => null, // Facebook doesn't use refresh tokens for Pages
                'expires_at' => null, // Page tokens don't expire
                'scopes' => $page['tasks'] ?? [],
                'user_info' => [
                    'platform_user_id' => $page['id'],
                    'username' => $pageData['username'] ?? $page['id'],
                    'name' => $page['name'],
                    'avatar_url' => $pageData['picture']['data']['url'] ?? null,
                    'metadata' => [
                        'category' => $page['category'] ?? null,
                        'tasks' => $page['tasks'] ?? [],
                    ],
                ],
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Facebook API error: ' . $e->getMessage());
        }
    }

    /**
     * Refresh access token.
     *
     * Note: Facebook Page access tokens don't expire, so we don't need to refresh them.
     * However, if the user token expires, we need to reconnect.
     *
     * @param SocialAccount $account Account to refresh
     * @return array New token data
     *
     * @throws Exception Page tokens don't need refreshing
     */
    public function refreshAccessToken(SocialAccount $account): array
    {
        // Page access tokens are long-lived and don't expire
        // If we reach here, the account likely needs to be reconnected
        throw new Exception('Facebook Page tokens do not expire. If you are seeing this error, please reconnect your account.');
    }

    /**
     * Publish a video to Facebook Page.
     *
     * Workflow:
     * 1. Upload video file to Facebook (resumable upload for large files)
     * 2. Create post with video, title, description, and hashtags
     * 3. Return post ID and video URL
     *
     * API: POST /{page-id}/videos
     * Docs: https://developers.facebook.com/docs/graph-api/reference/page/videos
     *
     * @param SocialAccount $account Account to post to
     * @param SocialPost $post Post data
     * @return array Platform post ID and video URL
     *
     * @throws Exception If upload fails
     */
    public function publishVideo(SocialAccount $account, SocialPost $post): array
    {
        try {
            $this->facebook->setDefaultAccessToken($account->access_token);

            // Get full video file path
            $videoPath = storage_path('app/' . ltrim($post->video_path, '/'));

            if (!file_exists($videoPath)) {
                throw new Exception("Video file not found: {$videoPath}");
            }

            // Build description with hashtags
            $description = $post->description;
            if (!empty($post->hashtags)) {
                $hashtags = array_map(fn($tag) => "#{$tag}", $post->hashtags);
                $description .= "\n\n" . implode(' ', $hashtags);
            }

            // Upload video with metadata
            $data = [
                'title' => $post->title,
                'description' => $description,
                'source' => $this->facebook->videoToUpload($videoPath),
            ];

            // Upload custom thumbnail if provided
            if ($post->thumbnail_path) {
                $thumbnailPath = storage_path('app/' . ltrim($post->thumbnail_path, '/'));
                if (file_exists($thumbnailPath)) {
                    $data['thumb'] = $this->facebook->fileToUpload($thumbnailPath);
                }
            }

            // Post video to Page
            $response = $this->facebook->post(
                "/{$account->platform_user_id}/videos",
                $data
            );

            $result = $response->getDecodedBody();

            // Get video ID
            $videoId = $result['id'];

            // Construct video URL
            $videoUrl = "https://www.facebook.com/{$account->platform_user_id}/videos/{$videoId}";

            return [
                'platform_post_id' => $videoId,
                'video_url' => $videoUrl,
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Failed to upload video to Facebook: ' . $e->getMessage());
        }
    }

    /**
     * Get metrics for a specific video post.
     *
     * Fetches video insights including views, likes, comments, shares, and reactions.
     *
     * API: GET /{video-id}/insights
     * Docs: https://developers.facebook.com/docs/graph-api/reference/video/insights
     *
     * @param SocialAccount $account Account that owns the post
     * @param string $platformPostId Facebook video ID
     * @return array Metrics data
     */
    public function getPostMetrics(SocialAccount $account, string $platformPostId): array
    {
        try {
            $this->facebook->setDefaultAccessToken($account->access_token);

            // Get video insights
            $metrics = [
                'total_video_views',
                'total_video_views_unique',
                'total_video_impressions',
                'total_video_impressions_unique',
                'total_video_reactions_by_type_total',
                'total_video_avg_time_watched',
                'total_video_complete_views',
            ];

            $response = $this->facebook->get(
                "/{$platformPostId}/insights?metric=" . implode(',', $metrics)
            );

            $insights = $response->getDecodedBody()['data'] ?? [];

            // Get post engagement (likes, comments, shares)
            $postResponse = $this->facebook->get(
                "/{$platformPostId}?fields=likes.summary(true),comments.summary(true),shares"
            );

            $postData = $postResponse->getDecodedBody();

            // Parse insights into simple key-value array
            $parsedInsights = [];
            foreach ($insights as $insight) {
                $parsedInsights[$insight['name']] = $insight['values'][0]['value'] ?? 0;
            }

            return [
                'views' => $parsedInsights['total_video_views'] ?? 0,
                'unique_views' => $parsedInsights['total_video_views_unique'] ?? 0,
                'impressions' => $parsedInsights['total_video_impressions'] ?? 0,
                'likes' => $postData['likes']['summary']['total_count'] ?? 0,
                'comments' => $postData['comments']['summary']['total_count'] ?? 0,
                'shares' => $postData['shares']['count'] ?? 0,
                'reactions' => $parsedInsights['total_video_reactions_by_type_total'] ?? [],
                'avg_watch_time' => $parsedInsights['total_video_avg_time_watched'] ?? 0,
                'completion_rate' => $parsedInsights['total_video_complete_views'] ?? 0,
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Failed to fetch video metrics: ' . $e->getMessage());
        }
    }

    /**
     * Get account-level analytics for a date range.
     *
     * Fetches Page insights including impressions, reach, engagement, and follower growth.
     *
     * API: GET /{page-id}/insights
     * Docs: https://developers.facebook.com/docs/graph-api/reference/insights
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

            // Page-level metrics
            $metrics = [
                'page_impressions',
                'page_impressions_unique',
                'page_engaged_users',
                'page_post_engagements',
                'page_fans',
                'page_video_views',
            ];

            $response = $this->facebook->get(
                "/{$account->platform_user_id}/insights?metric=" . implode(',', $metrics) .
                "&since={$startDate->timestamp}&until={$endDate->timestamp}"
            );

            $insights = $response->getDecodedBody()['data'] ?? [];

            // Parse insights
            $analytics = [];
            foreach ($insights as $insight) {
                $analytics[$insight['name']] = $insight['values'] ?? [];
            }

            return [
                'impressions' => $this->sumInsightValues($analytics['page_impressions'] ?? []),
                'reach' => $this->sumInsightValues($analytics['page_impressions_unique'] ?? []),
                'engaged_users' => $this->sumInsightValues($analytics['page_engaged_users'] ?? []),
                'engagements' => $this->sumInsightValues($analytics['page_post_engagements'] ?? []),
                'followers' => $this->getLatestInsightValue($analytics['page_fans'] ?? []),
                'video_views' => $this->sumInsightValues($analytics['page_video_views'] ?? []),
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Failed to fetch Page analytics: ' . $e->getMessage());
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
     * Get audience insights (demographics, locations, etc.)
     *
     * API: GET /{page-id}/insights
     *
     * @param SocialAccount $account Account to fetch insights for
     * @return array Audience demographic data
     */
    public function getAudienceInsights(SocialAccount $account): array
    {
        try {
            $this->facebook->setDefaultAccessToken($account->access_token);

            // Demographic metrics
            $metrics = [
                'page_fans_gender_age',
                'page_fans_country',
                'page_fans_city',
            ];

            $response = $this->facebook->get(
                "/{$account->platform_user_id}/insights?metric=" . implode(',', $metrics)
            );

            $insights = $response->getDecodedBody()['data'] ?? [];

            // Parse demographics
            $demographics = [];
            foreach ($insights as $insight) {
                $demographics[$insight['name']] = $insight['values'][0]['value'] ?? [];
            }

            return [
                'gender_age' => $demographics['page_fans_gender_age'] ?? [],
                'countries' => $demographics['page_fans_country'] ?? [],
                'cities' => $demographics['page_fans_city'] ?? [],
            ];
        } catch (FacebookSDKException $e) {
            throw new Exception('Failed to fetch audience insights: ' . $e->getMessage());
        }
    }
}
