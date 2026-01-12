<?php

namespace App\Services\SocialMedia;

use App\Models\SocialAccount;
use App\Models\SocialPost;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Http;

/**
 * TikTok Service
 *
 * Handles TikTok integration for video posting and analytics.
 *
 * Features:
 * - OAuth 2.0 authentication with TikTok Login Kit
 * - Video publishing via Content Posting API
 * - Analytics and metrics via Research API
 * - Token refresh
 * - Rate limiting
 *
 * Requirements:
 * - TikTok Developer account
 * - Approved app with Content Posting API access
 *
 * API Documentation: https://developers.tiktok.com/doc/content-posting-api-get-started
 */
class TikTokService extends BaseSocialMediaService
{
    /**
     * TikTok API base URL
     */
    protected string $apiUrl = 'https://open.tiktokapis.com';

    /**
     * OAuth base URL
     */
    protected string $oauthUrl = 'https://www.tiktok.com';

    /**
     * Get OAuth authorization URL for TikTok.
     *
     * Requests scopes for:
     * - user.info.basic: Basic profile information
     * - video.upload: Upload videos
     * - video.publish: Publish videos
     * - video.list: List user's videos
     *
     * @param string $state CSRF protection token
     * @return string Authorization URL
     */
    public function getAuthorizationUrl(string $state): string
    {
        $clientKey = config('services.tiktok.client_key');
        $redirectUri = config('services.tiktok.redirect');

        $scopes = [
            'user.info.basic',
            'video.upload',
            'video.publish',
            'video.list',
        ];

        $params = [
            'client_key' => $clientKey,
            'scope' => implode(',', $scopes),
            'response_type' => 'code',
            'redirect_uri' => $redirectUri,
            'state' => $state,
        ];

        return $this->oauthUrl . '/v2/auth/authorize?' . http_build_query($params);
    }

    /**
     * Handle OAuth callback and exchange code for access tokens.
     *
     * API: POST /v2/oauth/token/
     * Docs: https://developers.tiktok.com/doc/oauth-get-access-token
     *
     * @param string $code Authorization code from TikTok
     * @return array User info and access tokens
     *
     * @throws Exception If token exchange fails
     */
    public function handleCallback(string $code): array
    {
        try {
            // Exchange code for access token
            $response = Http::asForm()->post($this->oauthUrl . '/v2/oauth/token/', [
                'client_key' => config('services.tiktok.client_key'),
                'client_secret' => config('services.tiktok.client_secret'),
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.tiktok.redirect'),
            ]);

            if (!$response->successful()) {
                throw new Exception('Token exchange failed: ' . $response->body());
            }

            $data = $response->json()['data'] ?? [];

            if (empty($data['access_token'])) {
                throw new Exception('No access token received');
            }

            $accessToken = $data['access_token'];
            $refreshToken = $data['refresh_token'];
            $expiresIn = $data['expires_in'] ?? 86400; // Default 24 hours

            // Get user info
            $userResponse = Http::withToken($accessToken)
                ->get($this->apiUrl . '/v2/user/info/', [
                    'fields' => 'open_id,union_id,avatar_url,display_name',
                ]);

            if (!$userResponse->successful()) {
                throw new Exception('Failed to fetch user info: ' . $userResponse->body());
            }

            $userInfo = $userResponse->json()['data']['user'] ?? [];

            return [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_at' => now()->addSeconds($expiresIn),
                'scopes' => explode(',', $data['scope'] ?? ''),
                'user_info' => [
                    'platform_user_id' => $userInfo['open_id'],
                    'username' => $userInfo['display_name'] ?? $userInfo['open_id'],
                    'name' => $userInfo['display_name'],
                    'avatar_url' => $userInfo['avatar_url'] ?? null,
                    'metadata' => [
                        'union_id' => $userInfo['union_id'] ?? null,
                    ],
                ],
            ];
        } catch (Exception $e) {
            throw new Exception('TikTok OAuth error: ' . $e->getMessage());
        }
    }

    /**
     * Refresh access token.
     *
     * API: POST /v2/oauth/token/
     * Docs: https://developers.tiktok.com/doc/oauth-refresh-access-token
     *
     * @param SocialAccount $account Account to refresh
     * @return array New token data
     *
     * @throws Exception If refresh fails
     */
    public function refreshAccessToken(SocialAccount $account): array
    {
        try {
            $response = Http::asForm()->post($this->oauthUrl . '/v2/oauth/token/', [
                'client_key' => config('services.tiktok.client_key'),
                'client_secret' => config('services.tiktok.client_secret'),
                'grant_type' => 'refresh_token',
                'refresh_token' => $account->refresh_token,
            ]);

            if (!$response->successful()) {
                throw new Exception('Token refresh failed: ' . $response->body());
            }

            $data = $response->json()['data'] ?? [];

            return [
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'],
                'expires_at' => now()->addSeconds($data['expires_in'] ?? 86400),
            ];
        } catch (Exception $e) {
            throw new Exception('Failed to refresh TikTok token: ' . $e->getMessage());
        }
    }

    /**
     * Publish a video to TikTok.
     *
     * TikTok uses a multi-step process:
     * 1. Initialize upload and get upload URL
     * 2. Upload video chunks
     * 3. Create post with metadata
     *
     * API: POST /v2/post/publish/video/init/
     * Docs: https://developers.tiktok.com/doc/content-posting-api-reference-post-video
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
            // Get video file
            $videoPath = storage_path('app/' . ltrim($post->video_path, '/'));

            if (!file_exists($videoPath)) {
                throw new Exception("Video file not found: {$videoPath}");
            }

            $fileSize = filesize($videoPath);

            // Build caption with hashtags
            $caption = $post->description;
            if (!empty($post->hashtags)) {
                $hashtags = array_map(fn($tag) => "#{$tag}", $post->hashtags);
                $caption .= ' ' . implode(' ', $hashtags);
            }

            // Step 1: Initialize upload
            $initResponse = Http::withToken($account->access_token)
                ->post($this->apiUrl . '/v2/post/publish/video/init/', [
                    'post_info' => [
                        'title' => mb_substr($post->title, 0, 150), // TikTok title limit
                        'description' => mb_substr($caption, 0, 2200),
                        'privacy_level' => 'PUBLIC_TO_EVERYONE',
                        'disable_duet' => false,
                        'disable_comment' => false,
                        'disable_stitch' => false,
                    ],
                    'source_info' => [
                        'source' => 'FILE_UPLOAD',
                        'video_size' => $fileSize,
                        'chunk_size' => 5242880, // 5MB chunks
                        'total_chunk_count' => ceil($fileSize / 5242880),
                    ],
                ]);

            if (!$initResponse->successful()) {
                throw new Exception('Upload initialization failed: ' . $initResponse->body());
            }

            $initData = $initResponse->json()['data'] ?? [];
            $publishId = $initData['publish_id'];
            $uploadUrl = $initData['upload_url'];

            // Step 2: Upload video file
            $fileHandle = fopen($videoPath, 'rb');
            $chunkSize = 5242880; // 5MB
            $chunkNumber = 0;

            while (!feof($fileHandle)) {
                $chunk = fread($fileHandle, $chunkSize);

                $uploadResponse = Http::withHeaders([
                    'Content-Type' => 'video/mp4',
                    'Content-Range' => 'bytes ' . ($chunkNumber * $chunkSize) . '-' . (($chunkNumber + 1) * $chunkSize - 1) . "/{$fileSize}",
                ])->send('PUT', $uploadUrl, [
                    'body' => $chunk,
                ]);

                if (!$uploadResponse->successful()) {
                    fclose($fileHandle);
                    throw new Exception('Video upload failed at chunk ' . $chunkNumber);
                }

                $chunkNumber++;
            }

            fclose($fileHandle);

            // Step 3: Check upload status
            $maxAttempts = 30;
            $attempt = 0;
            $videoId = null;

            while ($attempt < $maxAttempts) {
                sleep(3); // Wait 3 seconds between checks

                $statusResponse = Http::withToken($account->access_token)
                    ->post($this->apiUrl . '/v2/post/publish/status/fetch/', [
                        'publish_id' => $publishId,
                    ]);

                if ($statusResponse->successful()) {
                    $statusData = $statusResponse->json()['data'] ?? [];
                    $status = $statusData['status'] ?? '';

                    if ($status === 'PUBLISH_COMPLETE') {
                        $videoId = $statusData['publicId'] ?? null;
                        break;
                    } elseif ($status === 'FAILED') {
                        throw new Exception('Video processing failed: ' . ($statusData['fail_reason'] ?? 'Unknown error'));
                    }
                }

                $attempt++;
            }

            if (!$videoId) {
                throw new Exception('Video processing timeout');
            }

            // TikTok doesn't provide direct video URL in response
            // Users can find their video in their profile
            $videoUrl = "https://www.tiktok.com/@{$account->username}/video/{$videoId}";

            return [
                'platform_post_id' => $videoId,
                'video_url' => $videoUrl,
            ];
        } catch (Exception $e) {
            throw new Exception('Failed to publish TikTok video: ' . $e->getMessage());
        }
    }

    /**
     * Get metrics for a specific TikTok video.
     *
     * API: POST /v2/research/video/query/
     * Note: Research API requires additional approval
     *
     * @param SocialAccount $account Account that owns the post
     * @param string $platformPostId TikTok video ID
     * @return array Metrics data
     */
    public function getPostMetrics(SocialAccount $account, string $platformPostId): array
    {
        try {
            // TikTok Research API (requires additional approval)
            $response = Http::withToken($account->access_token)
                ->post($this->apiUrl . '/v2/research/video/query/', [
                    'query' => [
                        'and' => [
                            [
                                'field_name' => 'video_id',
                                'operation' => 'EQ',
                                'field_values' => [$platformPostId],
                            ],
                        ],
                    ],
                    'fields' => [
                        'id',
                        'view_count',
                        'like_count',
                        'comment_count',
                        'share_count',
                    ],
                ]);

            if (!$response->successful()) {
                // If Research API not available, return placeholder
                return [
                    'views' => 0,
                    'likes' => 0,
                    'comments' => 0,
                    'shares' => 0,
                ];
            }

            $video = $response->json()['data']['videos'][0] ?? [];

            return [
                'views' => $video['view_count'] ?? 0,
                'likes' => $video['like_count'] ?? 0,
                'comments' => $video['comment_count'] ?? 0,
                'shares' => $video['share_count'] ?? 0,
            ];
        } catch (Exception $e) {
            // Return default metrics if API call fails
            return [
                'views' => 0,
                'likes' => 0,
                'comments' => 0,
                'shares' => 0,
            ];
        }
    }

    /**
     * Get account-level analytics.
     *
     * Note: TikTok's analytics API is limited. Most metrics require Business Account.
     *
     * @param SocialAccount $account Account to fetch analytics for
     * @param Carbon $startDate Start date
     * @param Carbon $endDate End date
     * @return array Analytics data
     */
    public function getAccountAnalytics(SocialAccount $account, Carbon $startDate, Carbon $endDate): array
    {
        // TikTok doesn't provide comprehensive analytics API for regular accounts
        // Would require TikTok Business Account and separate Business API
        return [
            'followers' => 0,
            'views' => 0,
            'likes' => 0,
            'comments' => 0,
            'shares' => 0,
        ];
    }

    /**
     * Get audience insights (demographics).
     *
     * Note: Not available via public API
     *
     * @param SocialAccount $account Account to fetch insights for
     * @return array Audience demographic data
     */
    public function getAudienceInsights(SocialAccount $account): array
    {
        // Not available via public API
        return [
            'gender_age' => [],
            'countries' => [],
            'cities' => [],
        ];
    }
}
