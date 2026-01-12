<?php

namespace App\Services\SocialMedia;

use App\Models\SocialAccount;
use App\Models\SocialPost;
use Carbon\Carbon;
use Exception;
use Google\Client as GoogleClient;
use Google\Http\MediaFileUpload;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * YouTube Service
 *
 * Handles OAuth authentication, video publishing, and analytics fetching for YouTube.
 * Uses the Google API Client Library to interact with YouTube Data API v3 and YouTube Analytics API.
 */
class YouTubeService extends BaseSocialMediaService
{
    /**
     * Platform identifier.
     */
    protected string $platform = 'youtube';

    /**
     * Google API Client instance.
     */
    protected GoogleClient $client;

    /**
     * YouTube Data API service instance.
     */
    protected YouTube $youtube;

    /**
     * YouTube Analytics API service instance.
     */
    protected YouTubeAnalytics $analytics;

    /**
     * Initialize the YouTube service with Google API Client.
     */
    public function __construct()
    {
        $this->client = new GoogleClient;
        $this->client->setClientId(config('services.youtube.client_id'));
        $this->client->setClientSecret(config('services.youtube.client_secret'));
        $this->client->setRedirectUri(config('services.youtube.redirect'));
        $this->client->setScopes(config('social-media.platforms.youtube.oauth_scopes'));
        $this->client->setAccessType('offline'); // Request refresh token
        $this->client->setPrompt('consent'); // Force consent screen to get refresh token

        $this->youtube = new YouTube($this->client);
        $this->analytics = new YouTubeAnalytics($this->client);
    }

    /**
     * Get the OAuth authorization URL for YouTube.
     *
     * Generates a URL to redirect the user to Google's OAuth consent screen.
     *
     * @param string $state CSRF protection token
     * @return string Authorization URL
     */
    public function getAuthorizationUrl(string $state): string
    {
        $this->client->setState($state);

        return $this->client->createAuthUrl();
    }

    /**
     * Handle the OAuth callback from Google.
     *
     * Exchanges the authorization code for access and refresh tokens,
     * then fetches the user's YouTube channel information.
     *
     * @param string $code Authorization code from Google
     * @return array Token data and channel info
     *
     * @throws Exception If authentication fails
     */
    public function handleCallback(string $code): array
    {
        try {
            // Exchange authorization code for tokens
            $token = $this->client->fetchAccessTokenWithAuthCode($code);

            if (isset($token['error'])) {
                throw new Exception('Failed to exchange code for token: ' . $token['error_description']);
            }

            // Set the access token
            $this->client->setAccessToken($token);

            // Get channel information
            $channelsResponse = $this->youtube->channels->listChannels('snippet,contentDetails,statistics', [
                'mine' => true,
            ]);

            if (empty($channelsResponse->getItems())) {
                throw new Exception('No YouTube channel found for this account');
            }

            $channel = $channelsResponse->getItems()[0];
            $snippet = $channel->getSnippet();
            $statistics = $channel->getStatistics();

            // Prepare token data
            return [
                'access_token' => $token['access_token'],
                'refresh_token' => $token['refresh_token'] ?? null,
                'expires_at' => isset($token['expires_in'])
                    ? now()->addSeconds($token['expires_in'])
                    : null,
                'scopes' => $token['scope'] ?? null,
                'user_info' => [
                    'platform_user_id' => $channel->getId(),
                    'username' => $snippet->getCustomUrl() ?? $snippet->getTitle(),
                    'name' => $snippet->getTitle(),
                    'avatar_url' => $snippet->getThumbnails()->getDefault()->getUrl(),
                    'metadata' => [
                        'subscriber_count' => $statistics->getSubscriberCount(),
                        'video_count' => $statistics->getVideoCount(),
                        'view_count' => $statistics->getViewCount(),
                        'description' => $snippet->getDescription(),
                    ],
                ],
            ];
        } catch (Exception $e) {
            Log::error('YouTube OAuth callback failed: ' . $e->getMessage());

            throw $e;
        }
    }

    /**
     * Refresh an expired access token.
     *
     * Uses the refresh token to obtain a new access token from Google.
     *
     * @param SocialAccount $account The account whose token needs refreshing
     * @return array Updated token data
     *
     * @throws Exception If refresh fails
     */
    public function refreshAccessToken(SocialAccount $account): array
    {
        try {
            $this->client->setAccessToken([
                'access_token' => $account->access_token,
                'refresh_token' => $account->refresh_token,
            ]);

            // Refresh the token
            $newToken = $this->client->fetchAccessTokenWithRefreshToken($account->refresh_token);

            if (isset($newToken['error'])) {
                throw new Exception('Token refresh failed: ' . $newToken['error_description']);
            }

            return [
                'access_token' => $newToken['access_token'],
                'refresh_token' => $newToken['refresh_token'] ?? $account->refresh_token,
                'expires_at' => isset($newToken['expires_in'])
                    ? now()->addSeconds($newToken['expires_in'])
                    : null,
            ];
        } catch (Exception $e) {
            Log::error("YouTube token refresh failed for account {$account->id}: " . $e->getMessage());

            throw $e;
        }
    }

    /**
     * Publish a video to YouTube.
     *
     * Uploads a video file with metadata (title, description, tags) to YouTube.
     * Supports resumable uploads for large files.
     *
     * @param SocialAccount $account The YouTube channel to upload to
     * @param SocialPost $post The post containing video and metadata
     * @return array Response data with video ID and URL
     *
     * @throws Exception If upload fails
     */
    public function publishVideo(SocialAccount $account, SocialPost $post): array
    {
        try {
            // Set the access token
            $this->client->setAccessToken([
                'access_token' => $account->access_token,
                'refresh_token' => $account->refresh_token,
            ]);

            // Prepare video metadata
            $videoSnippet = new YouTube\VideoSnippet;
            $videoSnippet->setTitle($post->title);
            $videoSnippet->setDescription($post->description);

            // Add hashtags as tags
            if ($post->hashtags) {
                $videoSnippet->setTags($post->hashtags);
            }

            // Set video status (public, private, unlisted)
            $videoStatus = new YouTube\VideoStatus;
            $videoStatus->setPrivacyStatus($post->metadata['privacy_status'] ?? 'public');

            // Create the video resource
            $video = new YouTube\Video;
            $video->setSnippet($videoSnippet);
            $video->setStatus($videoStatus);

            // Get the video file path
            $videoPath = Storage::disk(config('social-media.video.storage_disk'))->path($post->video_path);

            // Enable resumable upload for large files
            $this->client->setDefer(true);

            // Create the media upload request
            $insertRequest = $this->youtube->videos->insert('snippet,status', $video);

            // Create a media file upload object
            $media = new MediaFileUpload(
                $this->client,
                $insertRequest,
                'video/*',
                null,
                true,
                config('social-media.video.max_size') * 1024 // Convert KB to bytes
            );

            $media->setFileSize(filesize($videoPath));

            // Upload the video in chunks
            $status = false;
            $handle = fopen($videoPath, 'rb');

            while (!$status && !feof($handle)) {
                $chunk = fread($handle, 1024 * 1024); // Read 1MB at a time
                $status = $media->nextChunk($chunk);
            }

            fclose($handle);

            // Disable deferred mode
            $this->client->setDefer(false);

            if (!$status) {
                throw new Exception('Video upload incomplete');
            }

            // Upload custom thumbnail if provided
            if ($post->thumbnail_path) {
                $this->uploadThumbnail($status->getId(), $post->thumbnail_path);
            }

            Log::info("Video uploaded successfully to YouTube: {$status->getId()}");

            return [
                'platform_post_id' => $status->getId(),
                'video_url' => "https://www.youtube.com/watch?v={$status->getId()}",
            ];
        } catch (Exception $e) {
            Log::error("YouTube video upload failed for post {$post->id}: " . $e->getMessage());

            throw $e;
        }
    }

    /**
     * Upload a custom thumbnail for a YouTube video.
     *
     * @param string $videoId The YouTube video ID
     * @param string $thumbnailPath Path to the thumbnail file
     *
     * @throws Exception If thumbnail upload fails
     */
    protected function uploadThumbnail(string $videoId, string $thumbnailPath): void
    {
        try {
            $thumbnailFullPath = Storage::disk(config('social-media.video.storage_disk'))->path($thumbnailPath);

            // Enable resumable upload
            $this->client->setDefer(true);

            // Create the thumbnail upload request
            $thumbnailRequest = $this->youtube->thumbnails->set($videoId);

            // Create media upload
            $chunkSizeBytes = 1 * 1024 * 1024; // 1MB chunks
            $media = new MediaFileUpload(
                $this->client,
                $thumbnailRequest,
                'image/*',
                null,
                true,
                $chunkSizeBytes
            );

            $media->setFileSize(filesize($thumbnailFullPath));

            // Upload the thumbnail
            $status = false;
            $handle = fopen($thumbnailFullPath, 'rb');

            while (!$status && !feof($handle)) {
                $chunk = fread($handle, $chunkSizeBytes);
                $status = $media->nextChunk($chunk);
            }

            fclose($handle);
            $this->client->setDefer(false);

            Log::info("Custom thumbnail uploaded for YouTube video: {$videoId}");
        } catch (Exception $e) {
            // Log but don't fail the whole upload if thumbnail fails
            Log::warning("Failed to upload thumbnail for YouTube video {$videoId}: " . $e->getMessage());
        }
    }

    /**
     * Get metrics for a specific YouTube video.
     *
     * Fetches view count, likes, comments, and other engagement metrics.
     *
     * @param SocialAccount $account The YouTube channel account
     * @param string $platformPostId The YouTube video ID
     * @return array Metrics data
     *
     * @throws Exception If metrics fetching fails
     */
    public function getPostMetrics(SocialAccount $account, string $platformPostId): array
    {
        try {
            $this->client->setAccessToken([
                'access_token' => $account->access_token,
                'refresh_token' => $account->refresh_token,
            ]);

            // Get video statistics
            $videoResponse = $this->youtube->videos->listVideos('statistics,contentDetails', [
                'id' => $platformPostId,
            ]);

            if (empty($videoResponse->getItems())) {
                throw new Exception("Video not found: {$platformPostId}");
            }

            $video = $videoResponse->getItems()[0];
            $statistics = $video->getStatistics();
            $contentDetails = $video->getContentDetails();

            // Parse duration (ISO 8601 format to seconds)
            $duration = $this->parseDuration($contentDetails->getDuration());

            return [
                'views' => (int)$statistics->getViewCount(),
                'likes' => (int)$statistics->getLikeCount(),
                'comments' => (int)$statistics->getCommentCount(),
                'shares' => 0, // YouTube API doesn't provide share count
                'saves' => 0,
                'impressions' => 0,
                'reach' => 0,
                'watch_time' => 0, // Requires YouTube Analytics API
                'engagement_rate' => 0,
                'metadata' => [
                    'duration' => $duration,
                    'favorite_count' => $statistics->getFavoriteCount(),
                ],
            ];
        } catch (Exception $e) {
            Log::error("Failed to fetch YouTube metrics for video {$platformPostId}: " . $e->getMessage());

            throw $e;
        }
    }

    /**
     * Parse ISO 8601 duration format (PT1H2M3S) to seconds.
     *
     * @param string $duration ISO 8601 duration string
     * @return int Duration in seconds
     */
    protected function parseDuration(string $duration): int
    {
        preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/', $duration, $matches);

        $hours = isset($matches[1]) ? (int)$matches[1] : 0;
        $minutes = isset($matches[2]) ? (int)$matches[2] : 0;
        $seconds = isset($matches[3]) ? (int)$matches[3] : 0;

        return ($hours * 3600) + ($minutes * 60) + $seconds;
    }

    /**
     * Get analytics for a YouTube channel over a date range.
     *
     * Fetches views, subscribers, watch time, and other channel metrics.
     *
     * @param SocialAccount $account The YouTube channel account
     * @param Carbon $startDate Start date
     * @param Carbon $endDate End date
     * @return array Analytics data
     *
     * @throws Exception If analytics fetching fails
     */
    public function getAccountAnalytics(SocialAccount $account, Carbon $startDate, Carbon $endDate): array
    {
        try {
            $this->client->setAccessToken([
                'access_token' => $account->access_token,
                'refresh_token' => $account->refresh_token,
            ]);

            // Query YouTube Analytics API
            $response = $this->analytics->reports->query([
                'ids' => 'channel==MINE',
                'startDate' => $startDate->format('Y-m-d'),
                'endDate' => $endDate->format('Y-m-d'),
                'metrics' => 'views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,comments,shares',
                'dimensions' => 'day',
            ]);

            $rows = $response->getRows() ?? [];
            $totals = [
                'views' => 0,
                'watch_time' => 0,
                'subscribers_gained' => 0,
                'subscribers_lost' => 0,
                'likes' => 0,
                'comments' => 0,
                'shares' => 0,
            ];

            foreach ($rows as $row) {
                $totals['views'] += $row[1] ?? 0;
                $totals['watch_time'] += ($row[2] ?? 0) * 60; // Convert minutes to seconds
                $totals['subscribers_gained'] += $row[3] ?? 0;
                $totals['subscribers_lost'] += $row[4] ?? 0;
                $totals['likes'] += $row[5] ?? 0;
                $totals['comments'] += $row[6] ?? 0;
                $totals['shares'] += $row[7] ?? 0;
            }

            return $totals;
        } catch (Exception $e) {
            Log::error("Failed to fetch YouTube analytics for account {$account->id}: " . $e->getMessage());

            throw $e;
        }
    }

    /**
     * Get audience demographics for a YouTube channel.
     *
     * Fetches viewer age, gender, and geographic data.
     *
     * @param SocialAccount $account The YouTube channel account
     * @return array Demographics data
     *
     * @throws Exception If insights fetching fails
     */
    public function getAudienceInsights(SocialAccount $account): array
    {
        try {
            $this->client->setAccessToken([
                'access_token' => $account->access_token,
                'refresh_token' => $account->refresh_token,
            ]);

            // Get demographics (last 28 days)
            $endDate = now();
            $startDate = now()->subDays(28);

            // Age and gender demographics
            $demographicsResponse = $this->analytics->reports->query([
                'ids' => 'channel==MINE',
                'startDate' => $startDate->format('Y-m-d'),
                'endDate' => $endDate->format('Y-m-d'),
                'metrics' => 'viewerPercentage',
                'dimensions' => 'ageGroup,gender',
            ]);

            // Geographic demographics
            $geographicResponse = $this->analytics->reports->query([
                'ids' => 'channel==MINE',
                'startDate' => $startDate->format('Y-m-d'),
                'endDate' => $endDate->format('Y-m-d'),
                'metrics' => 'viewerPercentage',
                'dimensions' => 'country',
                'maxResults' => 10,
            ]);

            return [
                'age_gender' => $demographicsResponse->getRows() ?? [],
                'geography' => $geographicResponse->getRows() ?? [],
            ];
        } catch (Exception $e) {
            Log::error("Failed to fetch YouTube audience insights for account {$account->id}: " . $e->getMessage());

            throw $e;
        }
    }
}
