<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete('/settings/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    expect($user->fresh()->deleted_at)->not->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->delete('/settings/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/settings/profile');

    expect($user->fresh())->not->toBeNull();
});

test('github_username is extracted from valid github profile URL', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'social_links' => [
                'github' => 'https://github.com/octocat',
            ],
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->github_username)->toBe('octocat');
});

test('github_username is extracted from github URL with trailing slash', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'social_links' => [
                'github' => 'https://github.com/octocat/',
            ],
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->github_username)->toBe('octocat');
});

test('github_username is cleared when github URL is removed', function () {
    $user = User::factory()->create(['github_username' => 'octocat']);

    $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'social_links' => [
                'github' => null,
            ],
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->github_username)->toBeNull();
});

test('github URL validation rejects non-github domains', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'social_links' => [
                'github' => 'https://evil.com/octocat',
            ],
        ]);

    $response->assertSessionHasErrors('social_links.github');
});

test('github URL validation rejects URLs with extra path segments', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'social_links' => [
                'github' => 'https://github.com/octocat/repo',
            ],
        ]);

    $response->assertSessionHasErrors('social_links.github');
});

test('github URL validation rejects URLs with query parameters', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'social_links' => [
                'github' => 'https://github.com/octocat?tab=repos',
            ],
        ]);

    $response->assertSessionHasErrors('social_links.github');
});
