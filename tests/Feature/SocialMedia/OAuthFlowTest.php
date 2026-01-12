<?php

use App\Models\SocialAccount;
use App\Models\User;
use App\Services\SocialMedia\YouTubeService;

/**
 * OAuth Flow Tests
 *
 * Tests the complete OAuth authentication flow for connecting social media accounts.
 * Covers redirect generation, callback handling, token storage, and error scenarios.
 */
beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

/**
 * Test: User can initiate OAuth flow for YouTube
 */
it('redirects to platform OAuth authorization URL', function () {
    config(['social-media.platforms.youtube.enabled' => true]);

    $response = $this->get(route('admin.social-media.connect', 'youtube'));

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('accounts.google.com/o/oauth2');
});

/**
 * Test: Invalid platform is rejected
 */
it('rejects invalid platform in OAuth redirect', function () {
    $response = $this->get(route('admin.social-media.connect', 'invalid-platform'));

    $response->assertRedirect(route('admin.social-media.index'));
    $response->assertSessionHas('error', 'Invalid platform selected');
});

/**
 * Test: Disabled platform is rejected
 */
it('rejects disabled platform in OAuth redirect', function () {
    config(['social-media.platforms.youtube.enabled' => false]);

    $response = $this->get(route('admin.social-media.connect', 'youtube'));

    $response->assertRedirect(route('admin.social-media.index'));
    $response->assertSessionHas('error');
});

/**
 * Test: OAuth callback creates new social account
 */
it('creates social account on successful OAuth callback', function () {
    // Mock the service response
    $this->mock(YouTubeService::class, function ($mock) {
        $mock->shouldReceive('handleCallback')
            ->once()
            ->with('test-auth-code')
            ->andReturn([
                'access_token' => 'test-access-token',
                'refresh_token' => 'test-refresh-token',
                'expires_at' => now()->addDay(),
                'scopes' => ['youtube', 'youtube.upload'],
                'user_info' => [
                    'platform_user_id' => 'UC123456',
                    'username' => 'testchannel',
                    'name' => 'Test Channel',
                    'avatar_url' => 'https://example.com/avatar.jpg',
                    'metadata' => [],
                ],
            ]);
    });

    $response = $this->get(route('admin.social-media.connect.callback', ['platform' => 'youtube', 'code' => 'test-auth-code']));

    $response->assertRedirect(route('admin.social-media.index'));
    $response->assertSessionHas('success');

    // Verify account was created
    $this->assertDatabaseHas('social_accounts', [
        'user_id' => $this->user->id,
        'platform' => 'youtube',
        'platform_user_id' => 'UC123456',
        'username' => 'testchannel',
        'status' => 'active',
    ]);

    $account = SocialAccount::where('user_id', $this->user->id)->first();
    expect($account->access_token)->not->toBeNull();
    expect($account->refresh_token)->not->toBeNull();
});

/**
 * Test: OAuth callback handles missing code parameter
 */
it('handles missing OAuth code in callback', function () {
    $response = $this->get(route('admin.social-media.connect.callback', ['platform' => 'youtube']));

    $response->assertRedirect(route('admin.social-media.index'));
    $response->assertSessionHas('error', 'Authorization failed. No code received.');
});

/**
 * Test: OAuth callback handles service exceptions
 */
it('handles OAuth service exceptions gracefully', function () {
    $this->mock(YouTubeService::class, function ($mock) {
        $mock->shouldReceive('handleCallback')
            ->once()
            ->andThrow(new Exception('API Error'));
    });

    $response = $this->get(route('admin.social-media.connect.callback', ['platform' => 'youtube', 'code' => 'test-code']));

    $response->assertRedirect(route('admin.social-media.index'));
    $response->assertSessionHas('error');
});

/**
 * Test: Multiple accounts per platform are supported
 */
it('allows connecting multiple accounts for the same platform', function () {
    // Create first account
    SocialAccount::factory()->create([
        'user_id' => $this->user->id,
        'platform' => 'youtube',
        'platform_user_id' => 'UC111111',
        'username' => 'channel1',
    ]);

    // Mock second account connection
    $this->mock(YouTubeService::class, function ($mock) {
        $mock->shouldReceive('handleCallback')
            ->once()
            ->andReturn([
                'access_token' => 'token2',
                'refresh_token' => 'refresh2',
                'expires_at' => now()->addDay(),
                'scopes' => [],
                'user_info' => [
                    'platform_user_id' => 'UC222222',
                    'username' => 'channel2',
                    'name' => 'Channel 2',
                    'avatar_url' => null,
                    'metadata' => [],
                ],
            ]);
    });

    $response = $this->get(route('admin.social-media.connect.callback', ['platform' => 'youtube', 'code' => 'code2']));

    $response->assertRedirect(route('admin.social-media.index'));

    // Verify both accounts exist
    expect($this->user->socialAccounts()->where('platform', 'youtube')->count())->toBe(2);
});

/**
 * Test: User can disconnect a social account
 */
it('allows user to disconnect social account', function () {
    $account = SocialAccount::factory()->create([
        'user_id' => $this->user->id,
        'platform' => 'youtube',
    ]);

    $response = $this->delete(route('admin.social-media.accounts.disconnect', $account));

    $response->assertRedirect(route('admin.social-media.index'));
    $response->assertSessionHas('success');

    // Account should be soft deleted
    $this->assertSoftDeleted('social_accounts', ['id' => $account->id]);
});

/**
 * Test: User cannot disconnect another user's account
 */
it('prevents disconnecting another users account', function () {
    $otherUser = User::factory()->create();
    $account = SocialAccount::factory()->create([
        'user_id' => $otherUser->id,
        'platform' => 'youtube',
    ]);

    $response = $this->delete(route('admin.social-media.accounts.disconnect', $account));

    $response->assertForbidden();

    // Account should still exist
    $this->assertDatabaseHas('social_accounts', ['id' => $account->id]);
});

/**
 * Test: User can set default account per platform
 */
it('allows setting default account for a platform', function () {
    $account1 = SocialAccount::factory()->create([
        'user_id' => $this->user->id,
        'platform' => 'youtube',
        'is_default' => true,
    ]);

    $account2 = SocialAccount::factory()->create([
        'user_id' => $this->user->id,
        'platform' => 'youtube',
        'is_default' => false,
    ]);

    $response = $this->post(route('admin.social-media.accounts.set-default', $account2));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Account 2 should now be default, account 1 should not
    expect($account2->fresh()->is_default)->toBeTrue();
    expect($account1->fresh()->is_default)->toBeFalse();
});

/**
 * Test: Token refresh updates account tokens
 */
it('refreshes expired access token', function () {
    $account = SocialAccount::factory()->create([
        'user_id' => $this->user->id,
        'platform' => 'youtube',
        'access_token' => encrypt('old-token'),
        'token_expires_at' => now()->addMinutes(10),
    ]);

    $this->mock(YouTubeService::class, function ($mock) {
        $mock->shouldReceive('refreshAccessToken')
            ->once()
            ->andReturn([
                'access_token' => 'new-token',
                'refresh_token' => 'new-refresh',
                'expires_at' => now()->addDay(),
            ]);
    });

    $response = $this->post(route('admin.social-media.accounts.refresh-token', $account));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $account->refresh();
    expect(decrypt($account->access_token))->toBe('new-token');
    expect($account->token_expires_at)->toBeGreaterThan(now()->addHours(23));
});
