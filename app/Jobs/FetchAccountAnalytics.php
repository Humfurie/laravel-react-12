<?php

namespace App\Jobs;

use App\Models\SocialAccount;
use App\Models\SocialMetric;
use App\Services\SocialMedia\FacebookService;
use App\Services\SocialMedia\InstagramService;
use App\Services\SocialMedia\ThreadsService;
use App\Services\SocialMedia\TikTokService;
use App\Services\SocialMedia\YouTubeService;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * FetchAccountAnalytics Job
 *
 * Fetches account-level analytics for a social media account and stores them in the database.
 * This job runs asynchronously to collect comprehensive analytics data including follower growth,
 * engagement metrics, and demographic information.
 *
 * Features:
 * - Fetches account-level metrics (followers, impressions, reach, engagement)
 * - Fetches demographic data (age, gender, location)
 * - Supports custom date ranges
 * - Stores metrics in SocialMetric model with metric_type='account'
 * - Handles API errors gracefully with retry logic
 *
 * Usage:
 * ```php
 * // Fetch analytics for the last 30 days
 * FetchAccountAnalytics::dispatch($account, now()->subDays(30), now());
 *
 * // Fetch analytics for the last 7 days
 * FetchAccountAnalytics::dispatch($account, now()->subWeek(), now());
 * ```
 *
 * Retry Logic:
 * - 3 retry attempts with 180 second backoff between retries
 * - Retries on API failures, rate limits, and temporary errors
 */
class FetchAccountAnalytics implements ShouldQueue
{
    use Queueable;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Number of seconds to wait before retrying the job.
     */
    public int $backoff = 180;

    /**
     * Create a new job instance.
     *
     * @param SocialAccount $account The social account to fetch analytics for
     * @param Carbon $startDate Start date for analytics period
     * @param Carbon $endDate End date for analytics period
     */
    public function __construct(
        public SocialAccount $account,
        public Carbon        $startDate,
        public Carbon        $endDate
    )
    {
        //
    }

    /**
     * Execute the job.
     *
     * Fetches account-level analytics from the platform API and stores them in the database.
     * Also fetches audience demographic insights if available.
     *
     *
     * @throws Exception If platform is not supported
     */
    public function handle(): void
    {
        try {
            // Get the appropriate service for the platform
            $service = $this->getServiceForPlatform($this->account->platform);

            // Fetch account-level analytics
            $analytics = $service->getAccountAnalytics($this->account, $this->startDate, $this->endDate);

            // Fetch audience insights (demographics)
            $demographics = [];
            try {
                $demographics = $service->getAudienceInsights($this->account);
            } catch (Exception $e) {
                // Some platforms may not support demographics, log and continue
                Log::warning('Demographics not available for platform', [
                    'platform' => $this->account->platform,
                    'account_id' => $this->account->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // Store analytics in the database
            SocialMetric::create([
                'social_post_id' => null, // Account metrics are not tied to a specific post
                'social_account_id' => $this->account->id,
                'metric_type' => 'account',
                'date' => $this->endDate,
                'views' => $analytics['views'] ?? 0,
                'likes' => $analytics['likes'] ?? 0,
                'comments' => $analytics['comments'] ?? 0,
                'shares' => $analytics['shares'] ?? 0,
                'impressions' => $analytics['impressions'] ?? 0,
                'reach' => $analytics['reach'] ?? 0,
                'engagement_rate' => $this->calculateEngagementRate($analytics),
                'demographics' => $demographics,
                'metadata' => [
                    'followers' => $analytics['followers'] ?? 0,
                    'engaged_users' => $analytics['engaged_users'] ?? 0,
                    'engagements' => $analytics['engagements'] ?? 0,
                    'profile_views' => $analytics['profile_views'] ?? 0,
                    'website_clicks' => $analytics['website_clicks'] ?? 0,
                    'video_views' => $analytics['video_views'] ?? 0,
                    'period_start' => $this->startDate->toDateString(),
                    'period_end' => $this->endDate->toDateString(),
                    // Store any additional platform-specific metrics
                    ...array_diff_key($analytics, array_flip([
                        'views',
                        'likes',
                        'comments',
                        'shares',
                        'impressions',
                        'reach',
                        'followers',
                        'engaged_users',
                        'engagements',
                        'profile_views',
                        'website_clicks',
                        'video_views',
                    ])),
                ],
            ]);

            Log::info('Account analytics fetched successfully', [
                'account_id' => $this->account->id,
                'platform' => $this->account->platform,
                'period' => "{$this->startDate->toDateString()} to {$this->endDate->toDateString()}",
                'impressions' => $analytics['impressions'] ?? 0,
                'followers' => $analytics['followers'] ?? 0,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to fetch account analytics', [
                'account_id' => $this->account->id,
                'platform' => $this->account->platform,
                'period' => "{$this->startDate->toDateString()} to {$this->endDate->toDateString()}",
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
     * Calculate engagement rate from analytics data.
     *
     * Engagement rate = (likes + comments + shares) / impressions * 100
     * Returns 0 if impressions is 0 to avoid division by zero.
     *
     * @param array $analytics Analytics data
     * @return float Engagement rate as percentage
     */
    protected function calculateEngagementRate(array $analytics): float
    {
        $impressions = $analytics['impressions'] ?? 0;

        if ($impressions === 0) {
            return 0.0;
        }

        $engagements = ($analytics['likes'] ?? 0)
            + ($analytics['comments'] ?? 0)
            + ($analytics['shares'] ?? 0);

        return round(($engagements / $impressions) * 100, 2);
    }
}
