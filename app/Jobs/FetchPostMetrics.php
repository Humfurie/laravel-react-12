<?php

namespace App\Jobs;

use App\Models\SocialMetric;
use App\Models\SocialPost;
use App\Services\SocialMedia\FacebookService;
use App\Services\SocialMedia\InstagramService;
use App\Services\SocialMedia\ThreadsService;
use App\Services\SocialMedia\TikTokService;
use App\Services\SocialMedia\YouTubeService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * FetchPostMetrics Job
 *
 * Fetches analytics metrics for a published social media post and stores them in the database.
 * This job runs asynchronously to avoid blocking the main application when fetching metrics
 * from platform APIs.
 *
 * Features:
 * - Fetches platform-specific metrics (views, likes, comments, shares, etc.)
 * - Stores metrics in SocialMetric model with timestamp
 * - Handles API errors gracefully with retry logic
 * - Supports all 5 platforms (YouTube, Facebook, Instagram, TikTok, Threads)
 *
 * Usage:
 * ```php
 * // Dispatch immediately
 * FetchPostMetrics::dispatch($post);
 *
 * // Dispatch with delay (1 hour after publishing)
 * FetchPostMetrics::dispatch($post)->delay(now()->addHour());
 * ```
 *
 * Retry Logic:
 * - 3 retry attempts with 120 second backoff between retries
 * - Retries on API failures, rate limits, and temporary errors
 */
class FetchPostMetrics implements ShouldQueue
{
    use Queueable;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Number of seconds to wait before retrying the job.
     */
    public int $backoff = 120;

    /**
     * Create a new job instance.
     *
     * @param SocialPost $post The post to fetch metrics for
     */
    public function __construct(
        public SocialPost $post
    )
    {
        //
    }

    /**
     * Execute the job.
     *
     * Fetches metrics from the platform API and stores them in the database.
     * If the post is not published or doesn't have a platform_post_id, the job is skipped.
     *
     *
     * @throws Exception If platform is not supported
     */
    public function handle(): void
    {
        // Only fetch metrics for published posts
        if ($this->post->status !== 'published' || !$this->post->platform_post_id) {
            Log::info('Skipping metrics fetch for post', [
                'post_id' => $this->post->id,
                'status' => $this->post->status,
                'platform_post_id' => $this->post->platform_post_id,
            ]);

            return;
        }

        try {
            // Load the social account relationship
            $this->post->load('socialAccount');

            // Get the appropriate service for the platform
            $service = $this->getServiceForPlatform($this->post->socialAccount->platform);

            // Fetch metrics from the platform API
            $metrics = $service->getPostMetrics($this->post->socialAccount, $this->post->platform_post_id);

            // Store metrics in the database
            SocialMetric::create([
                'social_post_id' => $this->post->id,
                'social_account_id' => $this->post->social_account_id,
                'metric_type' => 'post',
                'date' => now(),
                'views' => $metrics['views'] ?? 0,
                'likes' => $metrics['likes'] ?? 0,
                'comments' => $metrics['comments'] ?? 0,
                'shares' => $metrics['shares'] ?? 0,
                'impressions' => $metrics['impressions'] ?? 0,
                'reach' => $metrics['reach'] ?? 0,
                'engagement_rate' => $this->calculateEngagementRate($metrics),
                'demographics' => $metrics['demographics'] ?? [],
                'metadata' => array_diff_key($metrics, array_flip([
                    'views',
                    'likes',
                    'comments',
                    'shares',
                    'impressions',
                    'reach',
                    'demographics',
                ])),
            ]);

            Log::info('Metrics fetched successfully', [
                'post_id' => $this->post->id,
                'platform' => $this->post->socialAccount->platform,
                'views' => $metrics['views'] ?? 0,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to fetch post metrics', [
                'post_id' => $this->post->id,
                'platform' => $this->post->socialAccount->platform ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw to trigger retry logic
            throw $e;
        }
    }

    /**
     * Get the appropriate service instance for the platform.
     *
     * @param string $platform Platform name (youtube, facebook, instagram, tiktok, threads)
     * @return YouTubeService|FacebookService|InstagramService|TikTokService|ThreadsService
     *
     * @throws Exception If platform is not supported
     */
    protected function getServiceForPlatform(string $platform)
    {
        return match ($platform) {
            'youtube' => app(YouTubeService::class),
            'facebook' => app(FacebookService::class),
            'instagram' => app(InstagramService::class),
            'tiktok' => app(TikTokService::class),
            'threads' => app(ThreadsService::class),
            default => throw new Exception("Unsupported platform: {$platform}"),
        };
    }

    /**
     * Calculate engagement rate from metrics.
     *
     * Engagement rate = (likes + comments + shares) / views * 100
     * Returns 0 if views is 0 to avoid division by zero.
     *
     * @param array $metrics Metrics data
     * @return float Engagement rate as percentage
     */
    protected function calculateEngagementRate(array $metrics): float
    {
        $views = $metrics['views'] ?? 0;

        if ($views === 0) {
            return 0.0;
        }

        $engagements = ($metrics['likes'] ?? 0)
            + ($metrics['comments'] ?? 0)
            + ($metrics['shares'] ?? 0);

        return round(($engagements / $views) * 100, 2);
    }
}
