<?php

namespace App\Jobs;

use App\Models\SocialPost;
use App\Services\SocialMedia\BaseSocialMediaService;
use App\Services\SocialMedia\FacebookService;
use App\Services\SocialMedia\InstagramService;
use App\Services\SocialMedia\ThreadsService;
use App\Services\SocialMedia\TikTokService;
use App\Services\SocialMedia\YouTubeService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Publish Social Post Job
 *
 * Asynchronously publishes a social media post to the specified platform.
 * This job:
 * - Uploads video to the platform
 * - Updates post metadata with platform response
 * - Handles errors and retries
 * - Supports delayed execution for scheduled posts
 *
 * Features:
 * - 3 retry attempts with exponential backoff (120 seconds between retries)
 * - Timeout of 600 seconds (10 minutes) for large video uploads
 * - Automatic token refresh if expired
 * - Comprehensive error logging
 */
class PublishSocialPost implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The social media post to publish.
     */
    public SocialPost $post;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 120;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 600;

    /**
     * Create a new job instance.
     *
     * @param SocialPost $post The post to publish
     */
    public function __construct(SocialPost $post)
    {
        $this->post = $post;
    }

    /**
     * Execute the job.
     *
     * Publishes the video to the social media platform and updates the post record
     * with the response data (platform_post_id, video_url, published_at).
     */
    public function handle(): void
    {
        try {
            Log::info('Starting to publish social media post', [
                'post_id' => $this->post->id,
                'platform' => $this->post->socialAccount->platform,
                'user_id' => $this->post->user_id,
            ]);

            // Update post status to processing
            $this->post->update(['status' => 'processing']);

            // Get the appropriate service for the platform
            $service = $this->getServiceForPlatform($this->post->socialAccount->platform);

            // Publish the video to the platform
            $response = $service->publishVideo($this->post->socialAccount, $this->post);

            // Mark post as successfully published
            $this->post->markAsPublished($response['platform_post_id'], $response['video_url'] ?? null);

            Log::info('Social media post published successfully', [
                'post_id' => $this->post->id,
                'platform' => $this->post->socialAccount->platform,
                'platform_post_id' => $response['platform_post_id'],
            ]);
        } catch (Exception $e) {
            Log::error('Failed to publish social media post', [
                'post_id' => $this->post->id,
                'platform' => $this->post->socialAccount->platform ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Mark post as failed with error message
            $this->post->markAsFailed($e->getMessage());

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Get the appropriate service instance for a platform.
     *
     * @param string $platform Platform identifier (youtube, facebook, instagram, tiktok, threads)
     *
     * @throws Exception If platform is not supported
     */
    protected function getServiceForPlatform(string $platform): BaseSocialMediaService
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
     * Handle a job failure.
     *
     * Called when the job has failed after all retry attempts.
     * Ensures the post is marked as failed in the database.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('Social media post publishing job failed permanently', [
            'post_id' => $this->post->id,
            'platform' => $this->post->socialAccount->platform ?? 'unknown',
            'error' => $exception->getMessage(),
        ]);

        // Mark post as failed if not already marked
        if ($this->post->status !== 'failed') {
            $this->post->markAsFailed($exception->getMessage());
        }
    }
}
