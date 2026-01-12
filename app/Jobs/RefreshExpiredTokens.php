<?php

namespace App\Jobs;

use App\Models\SocialAccount;
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
 * RefreshExpiredTokens Job
 *
 * Automatically refreshes access tokens for social media accounts that are expiring soon.
 * This job runs on a schedule to prevent token expiration and maintain continuous
 * access to platform APIs.
 *
 * Features:
 * - Finds accounts with tokens expiring within 24 hours
 * - Refreshes tokens using platform-specific services
 * - Updates account records with new tokens and expiration dates
 * - Handles errors gracefully with logging
 * - Skips platforms that don't support token refresh (Facebook/Instagram Page tokens)
 *
 * Usage:
 * ```php
 * // Dispatch manually
 * RefreshExpiredTokens::dispatch();
 *
 * // Scheduled in bootstrap/app.php
 * $schedule->job(new RefreshExpiredTokens)->hourly();
 * ```
 *
 * Scheduling:
 * - Runs hourly to catch tokens expiring soon
 * - Refreshes tokens that expire within 24 hours
 * - Prevents service interruptions
 */
class RefreshExpiredTokens implements ShouldQueue
{
    use Queueable;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * Number of seconds to wait before retrying the job.
     */
    public int $backoff = 300;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     *
     * Finds all social accounts with tokens expiring within 24 hours
     * and refreshes them using the appropriate platform service.
     */
    public function handle(): void
    {
        // Find accounts with tokens expiring within 24 hours
        $expiringAccounts = SocialAccount::query()
            ->whereNotNull('token_expires_at')
            ->where('token_expires_at', '<=', now()->addDay())
            ->where('token_expires_at', '>', now())
            ->where('status', 'active')
            ->get();

        Log::info('Refreshing expired tokens', [
            'count' => $expiringAccounts->count(),
        ]);

        foreach ($expiringAccounts as $account) {
            try {
                // Skip platforms that don't need token refresh
                if (in_array($account->platform, ['facebook', 'instagram'])) {
                    Log::info('Skipping token refresh for platform that uses long-lived tokens', [
                        'platform' => $account->platform,
                        'account_id' => $account->id,
                    ]);

                    continue;
                }

                // Get the service for this platform
                $service = $this->getServiceForPlatform($account->platform);

                // Refresh the token
                $tokenData = $service->refreshAccessToken($account);

                // Update the account with new token data
                $account->update([
                    'access_token' => $tokenData['access_token'],
                    'refresh_token' => $tokenData['refresh_token'] ?? $account->refresh_token,
                    'token_expires_at' => $tokenData['expires_at'],
                ]);

                Log::info('Token refreshed successfully', [
                    'platform' => $account->platform,
                    'account_id' => $account->id,
                    'new_expiry' => $tokenData['expires_at']?->toDateTimeString(),
                ]);
            } catch (Exception $e) {
                Log::error('Failed to refresh token', [
                    'platform' => $account->platform,
                    'account_id' => $account->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                // Mark account as needing reconnection if refresh fails
                if ($account->token_expires_at && $account->token_expires_at->isPast()) {
                    $account->update(['status' => 'reconnect_required']);

                    Log::warning('Account marked for reconnection', [
                        'platform' => $account->platform,
                        'account_id' => $account->id,
                    ]);
                }
            }
        }
    }

    /**
     * Get the appropriate service instance for a platform.
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
}
