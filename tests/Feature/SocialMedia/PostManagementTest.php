<?php

use App\Jobs\PublishSocialPost;
use App\Models\SocialAccount;
use App\Models\SocialPost;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

/**
 * Post Management Tests
 *
 * Tests social media post creation, validation, publishing, and scheduling.
 * Covers video uploads, form validation, job dispatching, and authorization.
 */
beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);

    Storage::fake('minio');
    Queue::fake();
});

/**
 * Test: User can create a post draft
 */
it('creates a post draft successfully', function () {
    $account = SocialAccount::factory()->create([
        'user_id' => $this->user->id,
        'platform' => 'youtube',
    ]);

    $video = UploadedFile::fake()->create('test-video.mp4', 10240); // 10MB

    $response = $this->post(route('admin.social-media.posts.store'), [
        'title' => 'Test Video Post',
        'description' => 'This is a test video post description',
        'hashtags' => ['test', 'laravel', 'social'],
        'video' => $video,
        'social_account_ids' => [$account->id],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Verify post was created
    $this->assertDatabaseHas('social_posts', [
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'title' => 'Test Video Post',
        'status' => 'draft',
    ]);

    // Verify video was uploaded
    $post = SocialPost::where('user_id', $this->user->id)->first();
    expect($post->video_path)->not->toBeNull();
    Storage::disk('minio')->assertExists($post->video_path);
});

/**
 * Test: Post creation validates required fields
 */
it('validates required fields when creating post', function () {
    $response = $this->post(route('admin.social-media.posts.store'), []);

    $response->assertSessionHasErrors(['title', 'description', 'video', 'social_account_ids']);
});

/**
 * Test: Post creation validates video file type
 */
it('validates video file type', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);
    $invalidFile = UploadedFile::fake()->create('document.pdf', 1024);

    $response = $this->post(route('admin.social-media.posts.store'), [
        'title' => 'Test',
        'description' => 'Test',
        'video' => $invalidFile,
        'social_account_ids' => [$account->id],
    ]);

    $response->assertSessionHasErrors(['video']);
});

/**
 * Test: Post creation validates video file size
 */
it('validates video file size does not exceed 2GB', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);
    $largeVideo = UploadedFile::fake()->create('large-video.mp4', 2097153); // Just over 2GB in KB

    $response = $this->post(route('admin.social-media.posts.store'), [
        'title' => 'Test',
        'description' => 'Test',
        'video' => $largeVideo,
        'social_account_ids' => [$account->id],
    ]);

    $response->assertSessionHasErrors(['video']);
});

/**
 * Test: User can publish post immediately
 */
it('publishes post immediately when requested', function () {
    $account = SocialAccount::factory()->create([
        'user_id' => $this->user->id,
        'platform' => 'youtube',
    ]);

    $post = SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'status' => 'draft',
    ]);

    $response = $this->post(route('admin.social-media.posts.publish', $post));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Verify job was dispatched
    Queue::assertPushed(PublishSocialPost::class, function ($job) use ($post) {
        return $job->post->id === $post->id;
    });

    // Verify post status updated
    expect($post->fresh()->status)->toBe('processing');
});

/**
 * Test: User can schedule post for future
 */
it('schedules post for future publishing', function () {
    $account = SocialAccount::factory()->create([
        'user_id' => $this->user->id,
        'platform' => 'youtube',
    ]);

    $post = SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'status' => 'draft',
    ]);

    $scheduledTime = now()->addHours(2);

    $response = $this->post(route('admin.social-media.posts.schedule', $post), [
        'scheduled_at' => $scheduledTime->toIso8601String(),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Verify scheduled_at was set
    $post->refresh();
    expect($post->scheduled_at)->not->toBeNull();
    expect($post->status)->toBe('scheduled');

    // Verify job was dispatched with delay
    Queue::assertPushed(PublishSocialPost::class);
});

/**
 * Test: Scheduling validates future date
 */
it('validates scheduled_at must be in future', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);
    $post = SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
    ]);

    $pastTime = now()->subHour();

    $response = $this->post(route('admin.social-media.posts.schedule', $post), [
        'scheduled_at' => $pastTime->toIso8601String(),
    ]);

    $response->assertSessionHasErrors(['scheduled_at']);
});

/**
 * Test: User cannot publish another user's post
 */
it('prevents publishing another users post', function () {
    $otherUser = User::factory()->create();
    $account = SocialAccount::factory()->create(['user_id' => $otherUser->id]);
    $post = SocialPost::factory()->create([
        'user_id' => $otherUser->id,
        'social_account_id' => $account->id,
    ]);

    $response = $this->post(route('admin.social-media.posts.publish', $post));

    $response->assertForbidden();
    Queue::assertNothingPushed();
});

/**
 * Test: User can update post details
 */
it('allows updating post details', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);
    $post = SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'title' => 'Original Title',
        'status' => 'draft',
    ]);

    $response = $this->put(route('admin.social-media.posts.update', $post), [
        'title' => 'Updated Title',
        'description' => $post->description,
        'hashtags' => ['updated', 'tags'],
        'social_account_ids' => [$account->id],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $post->refresh();
    expect($post->title)->toBe('Updated Title');
    expect($post->hashtags)->toBe(['updated', 'tags']);
});

/**
 * Test: Cannot update published post
 */
it('prevents updating published posts', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);
    $post = SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'status' => 'published',
    ]);

    $response = $this->put(route('admin.social-media.posts.update', $post), [
        'title' => 'Trying to Update',
        'description' => 'New description',
        'social_account_ids' => [$account->id],
    ]);

    $response->assertForbidden();
});

/**
 * Test: User can delete draft post
 */
it('allows deleting draft posts', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);
    $post = SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'status' => 'draft',
    ]);

    $response = $this->delete(route('admin.social-media.posts.destroy', $post));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertSoftDeleted('social_posts', ['id' => $post->id]);
});

/**
 * Test: Cannot delete published post
 */
it('prevents deleting published posts', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);
    $post = SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'status' => 'published',
    ]);

    $response = $this->delete(route('admin.social-media.posts.destroy', $post));

    $response->assertForbidden();
    $this->assertDatabaseHas('social_posts', ['id' => $post->id]);
});

/**
 * Test: User can view their posts list
 */
it('displays user posts list', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);

    SocialPost::factory()->count(5)->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
    ]);

    $response = $this->get(route('admin.social-media.posts.index'));

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page
        ->component('admin/social-media/posts')
        ->has('posts.data', 5)
    );
});

/**
 * Test: User can search posts
 */
it('filters posts by search query', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);

    SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'title' => 'Laravel Tutorial',
    ]);

    SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'title' => 'React Guide',
    ]);

    $response = $this->get(route('admin.social-media.posts.index', ['search' => 'Laravel']));

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page
        ->has('posts.data', 1)
        ->where('posts.data.0.title', 'Laravel Tutorial')
    );
});

/**
 * Test: User can filter posts by status
 */
it('filters posts by status', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);

    SocialPost::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'status' => 'published',
    ]);

    SocialPost::factory()->count(2)->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'status' => 'draft',
    ]);

    $response = $this->get(route('admin.social-media.posts.index', ['status' => 'published']));

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page->has('posts.data', 3));
});

/**
 * Test: Hashtags are stored and retrieved correctly
 */
it('stores and retrieves hashtags as array', function () {
    $account = SocialAccount::factory()->create(['user_id' => $this->user->id]);

    $post = SocialPost::factory()->create([
        'user_id' => $this->user->id,
        'social_account_id' => $account->id,
        'hashtags' => ['laravel', 'php', 'webdev'],
    ]);

    $post->refresh();
    expect($post->hashtags)->toBeArray();
    expect($post->hashtags)->toContain('laravel');
    expect($post->hashtags)->toHaveCount(3);
});
