<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSocialPostRequest;
use App\Http\Requests\UploadVideoRequest;
use App\Jobs\PublishSocialPost;
use App\Models\SocialAccount;
use App\Models\SocialMetric;
use App\Models\SocialPost;
use App\Services\SocialMedia\BaseSocialMediaService;
use App\Services\SocialMedia\FacebookService;
use App\Services\SocialMedia\InstagramService;
use App\Services\SocialMedia\ThreadsService;
use App\Services\SocialMedia\TikTokService;
use App\Services\SocialMedia\YouTubeService;
use App\Services\VideoProcessingService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Social Media Controller
 *
 * Handles all social media management functionality including:
 * - OAuth authentication for connecting social accounts
 * - Post creation, editing, and publishing
 * - Video uploads and thumbnail generation
 * - Analytics and metrics
 * - Content calendar
 */
class SocialMediaController extends Controller
{
    /**
     * Display the social media dashboard.
     *
     * Shows:
     * - Connected accounts grouped by platform
     * - Recent posts with status
     * - Quick stats (total posts, scheduled posts, total views)
     * - Quick actions (Create Post, View Calendar, View Analytics)
     */
    public function index(): Response
    {
        // Get user's connected social accounts grouped by platform
        $accounts = auth()->user()
            ->socialAccounts()
            ->with('socialPosts')
            ->get()
            ->groupBy('platform');

        // Get recent posts
        $recentPosts = auth()->user()
            ->socialPosts()
            ->with(['socialAccount', 'socialMetrics'])
            ->latest()
            ->take(10)
            ->get();

        // Calculate stats
        $stats = [
            'total_posts' => auth()->user()->socialPosts()->count(),
            'scheduled_posts' => auth()->user()->socialPosts()->scheduled()->count(),
            'published_posts' => auth()->user()->socialPosts()->published()->count(),
            'failed_posts' => auth()->user()->socialPosts()->failed()->count(),
            'total_accounts' => auth()->user()->socialAccounts()->active()->count(),
        ];

        return Inertia::render('admin/social-media/index', [
            'accounts' => $accounts,
            'recent_posts' => $recentPosts,
            'stats' => $stats,
        ]);
    }

    /**
     * Initiate OAuth flow to connect a social media account.
     *
     * Generates a state token for CSRF protection and redirects the user
     * to the platform's OAuth consent screen.
     *
     * @param string $platform Platform to connect (youtube, facebook, instagram, tiktok, threads)
     */
    public function connectRedirect(string $platform): RedirectResponse
    {
        // Validate platform
        $allowedPlatforms = ['youtube', 'facebook', 'instagram', 'tiktok', 'threads'];

        if (!in_array($platform, $allowedPlatforms)) {
            return redirect()
                ->route('admin.social-media.index')
                ->with('error', 'Invalid platform selected');
        }

        // Check if platform is enabled
        if (!config("social-media.platforms.{$platform}.enabled", false)) {
            return redirect()
                ->route('admin.social-media.index')
                ->with('error', ucfirst($platform) . ' integration is currently disabled');
        }

        // Generate state token for CSRF protection
        $state = Str::random(40);
        session(["oauth_state_{$platform}" => $state]);

        // Get the appropriate service for the platform
        $service = $this->getServiceForPlatform($platform);

        // Get authorization URL
        $authUrl = $service->getAuthorizationUrl($state);

        Log::info("Redirecting user to {$platform} OAuth", [
            'user_id' => auth()->id(),
            'platform' => $platform,
        ]);

        return redirect($authUrl);
    }

    /**
     * Get the appropriate service instance for a platform.
     *
     * @return BaseSocialMediaService
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
     * Handle OAuth callback from the platform.
     *
     * Exchanges the authorization code for access tokens,
     * fetches user's platform account info, and creates/updates SocialAccount.
     */
    public function connectCallback(Request $request, string $platform): RedirectResponse
    {
        try {
            // Validate state token (CSRF protection)
            $sessionState = session("oauth_state_{$platform}");
            $requestState = $request->query('state');

            if (!$sessionState || $sessionState !== $requestState) {
                throw new Exception('Invalid state token. Possible CSRF attack.');
            }

            // Clear the state from session
            session()->forget("oauth_state_{$platform}");

            // Check for error from OAuth provider
            if ($request->has('error')) {
                throw new Exception($request->input('error_description', 'OAuth authorization denied'));
            }

            // Get authorization code
            $code = $request->query('code');

            if (!$code) {
                throw new Exception('No authorization code received');
            }

            // Get the appropriate service
            $service = $this->getServiceForPlatform($platform);

            // Exchange code for tokens and get user info
            $data = $service->handleCallback($code);

            // Check if this account is already connected to another user
            $existingAccount = SocialAccount::where('platform', $platform)
                ->where('platform_user_id', $data['user_info']['platform_user_id'])
                ->where('user_id', '!=', auth()->id())
                ->first();

            if ($existingAccount) {
                return redirect()
                    ->route('admin.social-media.index')
                    ->with('error', 'This ' . ucfirst($platform) . ' account is already connected to another user');
            }

            // Check if user already has this account connected
            $account = SocialAccount::where('user_id', auth()->id())
                ->where('platform', $platform)
                ->where('platform_user_id', $data['user_info']['platform_user_id'])
                ->first();

            // Determine if this should be the default account for this platform
            $isFirstAccount = !auth()->user()
                ->socialAccounts()
                ->where('platform', $platform)
                ->exists();

            if ($account) {
                // Update existing account
                $account->update([
                    'username' => $data['user_info']['username'],
                    'name' => $data['user_info']['name'],
                    'avatar_url' => $data['user_info']['avatar_url'],
                    'access_token' => $data['access_token'],
                    'refresh_token' => $data['refresh_token'],
                    'token_expires_at' => $data['expires_at'],
                    'scopes' => is_string($data['scopes']) ? explode(' ', $data['scopes']) : $data['scopes'],
                    'status' => 'active',
                    'metadata' => $data['user_info']['metadata'] ?? null,
                    'last_synced_at' => now(),
                ]);

                $message = ucfirst($platform) . ' account reconnected successfully';
            } else {
                // Create new account
                $account = SocialAccount::create([
                    'user_id' => auth()->id(),
                    'platform' => $platform,
                    'platform_user_id' => $data['user_info']['platform_user_id'],
                    'username' => $data['user_info']['username'],
                    'name' => $data['user_info']['name'],
                    'avatar_url' => $data['user_info']['avatar_url'],
                    'access_token' => $data['access_token'],
                    'refresh_token' => $data['refresh_token'],
                    'token_expires_at' => $data['expires_at'],
                    'scopes' => is_string($data['scopes']) ? explode(' ', $data['scopes']) : $data['scopes'],
                    'status' => 'active',
                    'is_default' => $isFirstAccount, // First account for platform becomes default
                    'metadata' => $data['user_info']['metadata'] ?? null,
                    'last_synced_at' => now(),
                ]);

                $message = ucfirst($platform) . ' account connected successfully';
            }

            Log::info('Social account connected', [
                'user_id' => auth()->id(),
                'platform' => $platform,
                'account_id' => $account->id,
            ]);

            return redirect()
                ->route('admin.social-media.index')
                ->with('success', $message);
        } catch (Exception $e) {
            Log::error("OAuth callback failed for {$platform}", [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->route('admin.social-media.index')
                ->with('error', 'Failed to connect ' . ucfirst($platform) . ' account: ' . $e->getMessage());
        }
    }

    /**
     * Disconnect a social media account.
     *
     * Soft deletes the account and all associated posts.
     */
    public function disconnect(SocialAccount $account): RedirectResponse
    {
        // Ensure the account belongs to the authenticated user
        if ($account->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $platform = $account->platform;

        // Soft delete the account
        $account->delete();

        Log::info('Social account disconnected', [
            'user_id' => auth()->id(),
            'platform' => $platform,
            'account_id' => $account->id,
        ]);

        return redirect()
            ->route('admin.social-media.index')
            ->with('success', ucfirst($platform) . ' account disconnected');
    }

    /**
     * Set an account as the default for its platform.
     *
     * When creating posts, the default account is auto-selected for each platform.
     */
    public function setDefaultAccount(SocialAccount $account): RedirectResponse
    {
        // Ensure the account belongs to the authenticated user
        if ($account->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Unset default for all accounts of this platform
        auth()->user()
            ->socialAccounts()
            ->where('platform', $account->platform)
            ->update(['is_default' => false]);

        // Set this account as default
        $account->update(['is_default' => true]);

        Log::info('Set default social account', [
            'user_id' => auth()->id(),
            'platform' => $account->platform,
            'account_id' => $account->id,
        ]);

        return redirect()
            ->route('admin.social-media.index')
            ->with('success', 'Default account updated');
    }

    /**
     * Update a social account's nickname.
     *
     * Users can set custom nicknames like "Personal", "Business", etc.
     * to easily identify accounts when they have multiple for the same platform.
     */
    public function updateAccountNickname(SocialAccount $account, Request $request): RedirectResponse
    {
        // Ensure the account belongs to the authenticated user
        if ($account->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'nickname' => ['nullable', 'string', 'max:50'],
        ]);

        $account->update([
            'nickname' => $request->input('nickname'),
        ]);

        return redirect()
            ->route('admin.social-media.index')
            ->with('success', 'Account nickname updated');
    }

    /**
     * Refresh a social account's access token.
     *
     * Attempts to refresh an expired or expiring access token using the refresh token.
     * This is useful when a token has expired and the user needs to manually refresh it.
     */
    public function refreshToken(SocialAccount $account): RedirectResponse
    {
        // Ensure the account belongs to the authenticated user
        if ($account->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        try {
            $service = $this->getServiceForPlatform($account->platform);

            // Attempt to refresh the token
            $tokenData = $service->refreshAccessToken($account);

            // Update account with new tokens
            $account->update([
                'access_token' => $tokenData['access_token'],
                'refresh_token' => $tokenData['refresh_token'] ?? $account->refresh_token,
                'token_expires_at' => $tokenData['expires_at'],
                'status' => 'active',
            ]);

            Log::info('Social account token refreshed', [
                'user_id' => auth()->id(),
                'platform' => $account->platform,
                'account_id' => $account->id,
            ]);

            return redirect()
                ->route('admin.social-media.index')
                ->with('success', 'Account token refreshed successfully');
        } catch (Exception $e) {
            Log::error('Failed to refresh token', [
                'user_id' => auth()->id(),
                'platform' => $account->platform,
                'account_id' => $account->id,
                'error' => $e->getMessage(),
            ]);

            // Mark account as having an error
            $account->update(['status' => 'error']);

            return redirect()
                ->route('admin.social-media.index')
                ->with('error', 'Failed to refresh token: ' . $e->getMessage() . '. Please reconnect the account.');
        }
    }

    /**
     * Display all posts with filtering.
     */
    public function posts(Request $request): Response
    {
        $query = auth()->user()
            ->socialPosts()
            ->with(['socialAccount', 'socialMetrics']);

        // Apply search filter
        if ($request->has('search') && $request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply platform filter
        if ($request->has('platform') && $request->filled('platform')) {
            $query->whereHas('socialAccount', function ($q) use ($request) {
                $q->where('platform', $request->input('platform'));
            });
        }

        // Apply status filter
        if ($request->has('status') && $request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Apply date filters
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $posts = $query->latest()->paginate(20);

        return Inertia::render('admin/social-media/posts', [
            'posts' => $posts,
            'filters' => $request->only(['search', 'platform', 'status', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the post creation form.
     */
    public function createPost(): Response
    {
        // Get all connected accounts grouped by platform
        $accounts = auth()->user()
            ->socialAccounts()
            ->active()
            ->get()
            ->groupBy('platform');

        // Get platform configurations
        $platformConfigs = config('social-media.platforms');

        return Inertia::render('admin/social-media/create', [
            'accounts' => $accounts,
            'platformConfigs' => $platformConfigs,
        ]);
    }

    /**
     * Upload video with confirmation.
     *
     * Handles video file upload, extracts metadata using FFmpeg, generates thumbnail,
     * and returns confirmation data with comprehensive video details including:
     * - File path and URL
     * - Duration, resolution, codec information
     * - Automatically generated thumbnail
     * - File size and MIME type
     */
    public function uploadVideo(UploadVideoRequest $request): JsonResponse
    {
        try {
            $video = $request->file('video');
            $disk = config('social-media.video.storage_disk', 'public');
            $path = config('social-media.video.storage_path', 'social-media/videos');

            // Generate unique filename
            $filename = Str::uuid() . '.' . $video->getClientOriginalExtension();

            // Store video file
            $storedPath = $video->storeAs($path, $filename, $disk);

            // Get basic file information
            $fileSize = $video->getSize();
            $mimeType = $video->getMimeType();

            $responseData = [
                'path' => $storedPath,
                'filename' => $filename,
                'size' => $fileSize,
                'mime_type' => $mimeType,
                'url' => Storage::disk($disk)->url($storedPath),
            ];

            // Extract video metadata using FFmpeg (if available)
            $videoProcessor = app(VideoProcessingService::class);

            if ($videoProcessor->isAvailable()) {
                try {
                    // Extract comprehensive video metadata
                    $metadata = $videoProcessor->extractMetadata($storedPath, $disk);

                    $responseData['duration'] = $metadata['duration'];
                    $responseData['width'] = $metadata['width'] ?? null;
                    $responseData['height'] = $metadata['height'] ?? null;
                    $responseData['codec'] = $metadata['codec'] ?? null;
                    $responseData['frame_rate'] = $metadata['frame_rate'] ?? null;
                    $responseData['bitrate'] = $metadata['bitrate'] ?? null;

                    // Generate thumbnail at 2 seconds (or 10% of duration, whichever is less)
                    $thumbnailTimestamp = min(2, (int)($metadata['duration'] * 0.1));
                    $thumbnailPath = $videoProcessor->generateThumbnail($storedPath, $thumbnailTimestamp, $disk);

                    $responseData['thumbnail_path'] = $thumbnailPath;
                    $responseData['thumbnail_url'] = Storage::disk($disk)->url($thumbnailPath);

                    Log::info('Video uploaded and processed successfully', [
                        'user_id' => auth()->id(),
                        'filename' => $filename,
                        'size' => $fileSize,
                        'duration' => $metadata['duration'],
                        'resolution' => ($metadata['width'] ?? 0) . 'x' . ($metadata['height'] ?? 0),
                    ]);
                } catch (Exception $e) {
                    // Log FFmpeg error but don't fail the upload
                    Log::warning('FFmpeg processing failed, continuing without metadata', [
                        'user_id' => auth()->id(),
                        'filename' => $filename,
                        'error' => $e->getMessage(),
                    ]);

                    $responseData['ffmpeg_warning'] = 'Video uploaded successfully, but metadata extraction failed';
                }
            } else {
                Log::warning('FFmpeg not available, video uploaded without processing', [
                    'user_id' => auth()->id(),
                    'filename' => $filename,
                ]);

                $responseData['ffmpeg_warning'] = 'FFmpeg not available - thumbnail and metadata will not be generated';
            }

            return response()->json([
                'success' => true,
                'message' => 'Video uploaded successfully',
                'data' => $responseData,
            ]);
        } catch (Exception $e) {
            Log::error('Video upload failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Video upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new social media post.
     *
     * Creates a draft post with video and metadata. Can be published immediately
     * or scheduled for later by dispatching a queue job.
     *
     * Workflow:
     * 1. Validate request data
     * 2. Create post record
     * 3. Upload custom thumbnail if provided
     * 4. Dispatch publish job immediately or schedule for later
     */
    public function storePost(StoreSocialPostRequest $request): RedirectResponse
    {
        try {
            // Ensure the social account belongs to the authenticated user
            $socialAccount = SocialAccount::where('id', $request->input('social_account_id'))
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $data = [
                'user_id' => auth()->id(),
                'social_account_id' => $socialAccount->id,
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'hashtags' => $request->input('hashtags', []),
                'video_path' => $request->input('video_path'),
                'status' => 'draft',
            ];

            // Handle custom thumbnail upload if provided
            if ($request->hasFile('thumbnail')) {
                $thumbnail = $request->file('thumbnail');
                $disk = config('social-media.video.storage_disk', 'public');
                $path = config('social-media.video.storage_path', 'social-media/videos');

                $thumbnailFilename = Str::uuid() . '.' . $thumbnail->getClientOriginalExtension();
                $thumbnailPath = $thumbnail->storeAs($path . '/thumbnails', $thumbnailFilename, $disk);

                $data['thumbnail_path'] = $thumbnailPath;
            }

            // Determine post status and scheduling
            $publishNow = $request->boolean('publish_now');
            $scheduledAt = $request->input('scheduled_at');

            if ($scheduledAt) {
                // Scheduled for future publication
                $data['scheduled_at'] = $scheduledAt;
                $data['status'] = 'scheduled';
            } elseif ($publishNow) {
                // Queue for immediate publication
                $data['status'] = 'processing';
            }

            // Create the post
            $post = SocialPost::create($data);

            // Dispatch publish job if needed
            if ($publishNow) {
                // Publish immediately (queue job)
                dispatch(new PublishSocialPost($post));

                $message = 'Post created and queued for publishing';
            } elseif ($scheduledAt) {
                // Schedule for future publication
                dispatch(new PublishSocialPost($post))
                    ->delay($scheduledAt);

                $message = 'Post created and scheduled for ' . now()->parse($scheduledAt)->format('M d, Y g:i A');
            } else {
                // Save as draft
                $message = 'Post saved as draft';
            }

            Log::info('Social media post created', [
                'user_id' => auth()->id(),
                'post_id' => $post->id,
                'status' => $post->status,
                'publish_now' => $publishNow,
                'scheduled_at' => $scheduledAt,
            ]);

            return redirect()
                ->route('admin.social-media.posts.index')
                ->with('success', $message);
        } catch (Exception $e) {
            Log::error('Failed to create social media post', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create post: ' . $e->getMessage());
        }
    }

    /**
     * Show a single post's details.
     */
    public function showPost(SocialPost $post): Response
    {
        // Ensure the post belongs to the authenticated user
        if ($post->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('admin/social-media/show', [
            'post' => $post->load(['socialAccount', 'socialMetrics']),
        ]);
    }

    /**
     * Show the post edit form.
     */
    public function editPost(SocialPost $post): Response
    {
        // Ensure the post belongs to the authenticated user
        if ($post->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Get all connected accounts for the platform
        $accounts = auth()->user()
            ->socialAccounts()
            ->active()
            ->where('platform', $post->socialAccount->platform)
            ->get();

        return Inertia::render('Admin/SocialMedia/Edit', [
            'post' => $post->load('socialAccount'),
            'accounts' => $accounts,
            'platformConfigs' => config('social-media.platforms'),
        ]);
    }

    /**
     * Update an existing post.
     */
    public function updatePost(Request $request, SocialPost $post): RedirectResponse
    {
        // Ensure the post belongs to the authenticated user
        if ($post->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Don't allow editing published posts
        if ($post->status === 'published') {
            return redirect()
                ->back()
                ->with('error', 'Cannot edit published posts');
        }

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'hashtags' => ['nullable', 'array', 'max:30'],
            'hashtags.*' => ['string', 'max:50'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
        ]);

        try {
            $data = [
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'hashtags' => $request->input('hashtags', []),
            ];

            // Handle thumbnail upload if provided
            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail if exists
                if ($post->thumbnail_path) {
                    Storage::disk(config('social-media.video.storage_disk', 'public'))
                        ->delete($post->thumbnail_path);
                }

                $thumbnail = $request->file('thumbnail');
                $disk = config('social-media.video.storage_disk', 'public');
                $path = config('social-media.video.storage_path', 'social-media/videos');

                $thumbnailFilename = Str::uuid() . '.' . $thumbnail->getClientOriginalExtension();
                $thumbnailPath = $thumbnail->storeAs($path . '/thumbnails', $thumbnailFilename, $disk);

                $data['thumbnail_path'] = $thumbnailPath;
            }

            // Update scheduled time if provided
            if ($request->filled('scheduled_at')) {
                $data['scheduled_at'] = $request->input('scheduled_at');
                if ($post->status === 'draft') {
                    $data['status'] = 'scheduled';
                }
            }

            $post->update($data);

            Log::info('Social media post updated', [
                'user_id' => auth()->id(),
                'post_id' => $post->id,
            ]);

            return redirect()
                ->route('admin.social-media.posts.index')
                ->with('success', 'Post updated successfully');
        } catch (Exception $e) {
            Log::error('Failed to update social media post', [
                'user_id' => auth()->id(),
                'post_id' => $post->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update post: ' . $e->getMessage());
        }
    }

    /**
     * Delete a post.
     */
    public function destroyPost(SocialPost $post): RedirectResponse
    {
        // Ensure the post belongs to the authenticated user
        if ($post->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        try {
            // Delete video and thumbnail files from storage
            $disk = config('social-media.video.storage_disk', 'public');

            if ($post->video_path && Storage::disk($disk)->exists($post->video_path)) {
                Storage::disk($disk)->delete($post->video_path);
            }

            if ($post->thumbnail_path && Storage::disk($disk)->exists($post->thumbnail_path)) {
                Storage::disk($disk)->delete($post->thumbnail_path);
            }

            $post->delete();

            Log::info('Social media post deleted', [
                'user_id' => auth()->id(),
                'post_id' => $post->id,
            ]);

            return redirect()
                ->route('admin.social-media.posts.index')
                ->with('success', 'Post deleted successfully');
        } catch (Exception $e) {
            Log::error('Failed to delete social media post', [
                'user_id' => auth()->id(),
                'post_id' => $post->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to delete post: ' . $e->getMessage());
        }
    }

    /**
     * Publish a post immediately.
     *
     * Dispatches the PublishSocialPost job to queue for immediate processing.
     * The job will upload the video to the platform and update the post status.
     */
    public function publishPost(SocialPost $post): RedirectResponse
    {
        // Ensure the post belongs to the authenticated user
        if ($post->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Check if post can be published
        if (!in_array($post->status, ['draft', 'scheduled', 'failed'])) {
            return redirect()
                ->back()
                ->with('error', 'Post cannot be published in its current state');
        }

        try {
            // Update post status to processing
            $post->update(['status' => 'processing']);

            // Dispatch job to publish the post
            dispatch(new PublishSocialPost($post));

            Log::info('Social media post queued for publishing', [
                'user_id' => auth()->id(),
                'post_id' => $post->id,
            ]);

            return redirect()
                ->route('admin.social-media.posts.index')
                ->with('success', 'Post queued for publishing');
        } catch (Exception $e) {
            Log::error('Failed to publish social media post', [
                'user_id' => auth()->id(),
                'post_id' => $post->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to publish post: ' . $e->getMessage());
        }
    }

    /**
     * Schedule a post for future publication.
     *
     * Updates the post with the scheduled time and dispatches a delayed job
     * that will publish the post at the specified time.
     */
    public function schedulePost(Request $request, SocialPost $post): RedirectResponse
    {
        // Ensure the post belongs to the authenticated user
        if ($post->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'scheduled_at' => ['required', 'date', 'after:now'],
        ]);

        try {
            $scheduledAt = $request->input('scheduled_at');

            $post->update([
                'scheduled_at' => $scheduledAt,
                'status' => 'scheduled',
            ]);

            // Dispatch delayed job to publish at scheduled time
            dispatch(new PublishSocialPost($post))
                ->delay($scheduledAt);

            Log::info('Social media post scheduled', [
                'user_id' => auth()->id(),
                'post_id' => $post->id,
                'scheduled_at' => $scheduledAt,
            ]);

            return redirect()
                ->route('admin.social-media.posts.index')
                ->with('success', 'Post scheduled for ' . now()->parse($scheduledAt)->format('M d, Y g:i A'));
        } catch (Exception $e) {
            Log::error('Failed to schedule social media post', [
                'user_id' => auth()->id(),
                'post_id' => $post->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to schedule post: ' . $e->getMessage());
        }
    }

    /**
     * Display the content calendar.
     */
    public function calendar(): Response
    {
        return Inertia::render('Admin/SocialMedia/Calendar');
    }

    /**
     * Get calendar events (scheduled posts).
     */
    public function calendarEvents(Request $request): JsonResponse
    {
        $query = auth()->user()
            ->socialPosts()
            ->with('socialAccount')
            ->whereNotNull('scheduled_at');

        // Filter by date range if provided
        if ($request->has('start')) {
            $query->where('scheduled_at', '>=', $request->input('start'));
        }

        if ($request->has('end')) {
            $query->where('scheduled_at', '<=', $request->input('end'));
        }

        $posts = $query->get();

        // Format posts for FullCalendar
        $events = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'start' => $post->scheduled_at->toIso8601String(),
                'backgroundColor' => $this->getColorForPlatform($post->socialAccount->platform),
                'borderColor' => $this->getColorForPlatform($post->socialAccount->platform),
                'extendedProps' => [
                    'platform' => $post->socialAccount->platform,
                    'account_name' => $post->socialAccount->display_name,
                    'status' => $post->status,
                ],
            ];
        });

        return response()->json($events);
    }

    /**
     * Get color for platform (for calendar display).
     */
    protected function getColorForPlatform(string $platform): string
    {
        return match ($platform) {
            'youtube' => '#FF0000',
            'facebook' => '#1877F2',
            'instagram' => '#E4405F',
            'tiktok' => '#000000',
            'threads' => '#000000',
            default => '#6B7280',
        };
    }

    /**
     * Display the main analytics dashboard.
     *
     * Shows aggregated analytics across all connected accounts with:
     * - Total views, likes, comments, shares, engagement rate
     * - Performance by platform
     * - Top performing posts
     * - Date range selector (last 7, 30, 90 days, custom)
     *
     * @param Request $request HTTP request with optional date range parameters
     */
    public function analytics(Request $request): Response
    {
        // Default to last 30 days if no date range specified
        $startDate = $request->input('start_date')
            ? carbon($request->input('start_date'))
            : now()->subDays(30);

        $endDate = $request->input('end_date')
            ? carbon($request->input('end_date'))
            : now();

        // Get user's accounts
        $accounts = auth()->user()
            ->socialAccounts()
            ->active()
            ->get();

        // Get aggregated metrics for the date range
        $metrics = SocialMetric::query()
            ->whereIn('social_account_id', $accounts->pluck('id'))
            ->whereBetween('date', [$startDate, $endDate])
            ->selectRaw('
                SUM(views) as total_views,
                SUM(likes) as total_likes,
                SUM(comments) as total_comments,
                SUM(shares) as total_shares,
                SUM(impressions) as total_impressions,
                SUM(reach) as total_reach,
                AVG(engagement_rate) as avg_engagement_rate
            ')
            ->first();

        // Get metrics grouped by platform
        $platformMetrics = SocialMetric::query()
            ->join('social_accounts', 'social_metrics.social_account_id', '=', 'social_accounts.id')
            ->whereIn('social_account_id', $accounts->pluck('id'))
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('social_accounts.platform')
            ->selectRaw('
                social_accounts.platform,
                SUM(social_metrics.views) as views,
                SUM(social_metrics.likes) as likes,
                SUM(social_metrics.comments) as comments,
                SUM(social_metrics.shares) as shares,
                AVG(social_metrics.engagement_rate) as engagement_rate
            ')
            ->get();

        // Get metrics over time for charts (grouped by day)
        $metricsOverTime = SocialMetric::query()
            ->whereIn('social_account_id', $accounts->pluck('id'))
            ->whereBetween('date', [$startDate, $endDate])
            ->groupByRaw('DATE(date)')
            ->orderBy('date')
            ->selectRaw('
                DATE(date) as date,
                SUM(views) as views,
                SUM(likes) as likes,
                SUM(comments) as comments,
                SUM(shares) as shares,
                AVG(engagement_rate) as engagement_rate
            ')
            ->get();

        // Get top performing posts
        $topPosts = auth()->user()
            ->socialPosts()
            ->with(['socialAccount', 'socialMetrics' => fn($q) => $q->latest()->first()])
            ->published()
            ->get()
            ->sortByDesc(function ($post) {
                return $post->socialMetrics->first()?->views ?? 0;
            })
            ->take(10)
            ->values();

        return Inertia::render('admin/social-media/analytics', [
            'metrics' => $metrics,
            'platform_metrics' => $platformMetrics,
            'metrics_over_time' => $metricsOverTime,
            'top_posts' => $topPosts,
            'accounts' => $accounts,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
        ]);
    }

    /**
     * Display analytics for a specific social account.
     *
     * Shows detailed analytics for a single account including:
     * - Account-level metrics (followers, reach, impressions)
     * - Demographic insights (gender, age, location)
     * - Post performance for this account
     * - Engagement trends over time
     *
     * @param Request $request HTTP request with optional date range parameters
     * @param SocialAccount $account The social account to show analytics for
     */
    public function accountAnalytics(Request $request, SocialAccount $account): Response
    {
        // Ensure user owns this account
        if ($account->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Default to last 30 days
        $startDate = $request->input('start_date')
            ? carbon($request->input('start_date'))
            : now()->subDays(30);

        $endDate = $request->input('end_date')
            ? carbon($request->input('end_date'))
            : now();

        // Get aggregated metrics for this account
        $metrics = SocialMetric::query()
            ->where('social_account_id', $account->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->selectRaw('
                SUM(views) as total_views,
                SUM(likes) as total_likes,
                SUM(comments) as total_comments,
                SUM(shares) as total_shares,
                SUM(impressions) as total_impressions,
                SUM(reach) as total_reach,
                AVG(engagement_rate) as avg_engagement_rate
            ')
            ->first();

        // Get metrics over time for charts
        $metricsOverTime = SocialMetric::query()
            ->where('social_account_id', $account->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupByRaw('DATE(date)')
            ->orderBy('date')
            ->selectRaw('
                DATE(date) as date,
                SUM(views) as views,
                SUM(likes) as likes,
                SUM(comments) as comments,
                SUM(shares) as shares,
                AVG(engagement_rate) as engagement_rate
            ')
            ->get();

        // Get latest account-level metrics (followers, demographics)
        $accountMetrics = SocialMetric::query()
            ->where('social_account_id', $account->id)
            ->where('metric_type', 'account')
            ->latest('date')
            ->first();

        // Get posts for this account
        $posts = SocialPost::query()
            ->where('social_account_id', $account->id)
            ->with(['socialMetrics' => fn($q) => $q->latest()->first()])
            ->published()
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('admin/social-media/account-analytics', [
            'account' => $account,
            'metrics' => $metrics,
            'metrics_over_time' => $metricsOverTime,
            'account_metrics' => $accountMetrics,
            'posts' => $posts,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
        ]);
    }

    /**
     * Display analytics for a specific post.
     *
     * Shows detailed metrics for a single post including:
     * - Views, likes, comments, shares over time
     * - Engagement rate
     * - Audience demographics (if available)
     * - Performance comparison to account average
     *
     * @param SocialPost $post The post to show analytics for
     */
    public function postAnalytics(SocialPost $post): Response
    {
        // Ensure user owns this post
        if ($post->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Load account relationship
        $post->load('socialAccount');

        // Get all metrics for this post (historical data)
        $metrics = SocialMetric::query()
            ->where('social_post_id', $post->id)
            ->orderBy('date')
            ->get();

        // Get latest metrics
        $latestMetrics = $metrics->last();

        // Calculate average metrics for this account
        $accountAverage = SocialMetric::query()
            ->where('social_account_id', $post->social_account_id)
            ->where('metric_type', 'post')
            ->selectRaw('
                AVG(views) as avg_views,
                AVG(likes) as avg_likes,
                AVG(comments) as avg_comments,
                AVG(shares) as avg_shares,
                AVG(engagement_rate) as avg_engagement_rate
            ')
            ->first();

        return Inertia::render('admin/social-media/post-analytics', [
            'post' => $post,
            'metrics' => $metrics,
            'latest_metrics' => $latestMetrics,
            'account_average' => $accountAverage,
        ]);
    }
}
