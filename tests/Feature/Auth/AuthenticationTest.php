<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    // Non-Inertia requests get a standard 302 redirect
    $response->assertRedirect(route('dashboard'));
});

test('login returns Inertia location response for XHR requests', function () {
    $user = User::factory()->create();

    // Simulate Inertia XHR request
    $response = $this
        ->withHeader('X-Inertia', 'true')
        ->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

    $this->assertAuthenticated();
    // Inertia::location() returns 409 with X-Inertia-Location header for full page reload
    $response->assertStatus(409);
    $response->assertHeader('X-Inertia-Location', route('dashboard'));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('session persists after login', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    // Make a subsequent request to dashboard
    $response = $this->get(route('dashboard'));

    $response->assertSuccessful();
    $this->assertAuthenticated();
});

test('login redirects to intended URL via Inertia location', function () {
    $user = User::factory()->create();

    // Set intended URL in session (accessing protected route redirects to login and stores intended)
    $this->get('/settings/profile');

    // Simulate Inertia XHR request
    $response = $this
        ->withHeader('X-Inertia', 'true')
        ->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

    $this->assertAuthenticated();
    $response->assertStatus(409);
    $response->assertHeader('X-Inertia-Location', route('profile.edit'));
});
