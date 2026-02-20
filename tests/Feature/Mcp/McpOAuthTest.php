<?php

use App\Models\McpOAuthClient;
use App\Models\McpOAuthToken;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

// ─── Discovery Endpoints ──────────────────────────────────────────

it('returns OAuth protected resource metadata', function () {
    $this->getJson('/.well-known/oauth-protected-resource')
        ->assertStatus(200)
        ->assertJsonStructure(['resource', 'authorization_server']);
});

it('returns OAuth authorization server metadata', function () {
    $this->getJson('/.well-known/oauth-authorization-server')
        ->assertStatus(200)
        ->assertJsonStructure([
            'issuer',
            'authorization_endpoint',
            'token_endpoint',
            'registration_endpoint',
            'response_types_supported',
            'code_challenge_methods_supported',
            'grant_types_supported',
        ])
        ->assertJsonFragment(['code_challenge_methods_supported' => ['S256']]);
});

// ─── Client Registration ──────────────────────────────────────────

it('registers a new OAuth client with secret', function () {
    $response = $this->postJson('/oauth/register', [
        'client_name' => 'Claude AI',
        'redirect_uris' => ['https://claude.ai/callback'],
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['client_id', 'client_secret', 'client_name', 'redirect_uris'])
        ->assertJsonFragment(['client_name' => 'Claude AI']);

    $client = McpOAuthClient::where('name', 'Claude AI')->first();
    expect($client)->not->toBeNull();
    expect($client->secret_hash)->not->toBeNull();

    // Verify the returned secret hashes to the stored hash
    $returnedSecret = $response->json('client_secret');
    expect(hash_equals($client->secret_hash, hash('sha256', $returnedSecret)))->toBeTrue();
});

it('rejects client registration with missing fields', function () {
    $this->postJson('/oauth/register', [])
        ->assertStatus(422);
});

// ─── Authorization Endpoint ───────────────────────────────────────

it('shows the authorization consent page to authenticated users', function () {
    $user = User::factory()->create();
    $client = McpOAuthClient::create([
        'name' => 'Test Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $this->actingAs($user)
        ->get('/oauth/authorize?'.http_build_query([
            'client_id' => $client->id,
            'redirect_uri' => 'http://localhost/callback',
            'response_type' => 'code',
            'code_challenge' => 'test-challenge',
            'code_challenge_method' => 'S256',
            'state' => 'test-state',
        ]))
        ->assertStatus(200)
        ->assertSee('Test Client')
        ->assertSee('Authorize');
});

it('redirects unauthenticated users to login on authorize', function () {
    $client = McpOAuthClient::create([
        'name' => 'Test Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $this->get('/oauth/authorize?'.http_build_query([
        'client_id' => $client->id,
        'redirect_uri' => 'http://localhost/callback',
        'response_type' => 'code',
        'code_challenge' => 'test-challenge',
        'code_challenge_method' => 'S256',
    ]))->assertRedirect();
});

it('rejects authorization with invalid redirect_uri', function () {
    $user = User::factory()->create();
    $client = McpOAuthClient::create([
        'name' => 'Test Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $this->actingAs($user)
        ->get('/oauth/authorize?'.http_build_query([
            'client_id' => $client->id,
            'redirect_uri' => 'http://evil.com/steal',
            'response_type' => 'code',
            'code_challenge' => 'test-challenge',
            'code_challenge_method' => 'S256',
        ]))
        ->assertStatus(400);
});

// ─── Authorization Approval ───────────────────────────────────────

it('generates an auth code and redirects on approval', function () {
    $user = User::factory()->create();
    $client = McpOAuthClient::create([
        'name' => 'Test Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $response = $this->actingAs($user)
        ->post('/oauth/authorize', [
            'client_id' => $client->id,
            'redirect_uri' => 'http://localhost/callback',
            'code_challenge' => 'test-challenge',
            'code_challenge_method' => 'S256',
            'state' => 'test-state',
        ]);

    $response->assertRedirectContains('http://localhost/callback');
    $response->assertRedirectContains('code=');
    $response->assertRedirectContains('state=test-state');
});

// ─── Token Exchange (Full PKCE Flow) ──────────────────────────────

it('exchanges authorization code for access token via PKCE', function () {
    $user = User::factory()->create();
    $client = McpOAuthClient::create([
        'name' => 'Test Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    // Generate PKCE pair
    $codeVerifier = bin2hex(random_bytes(32));
    $codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');

    // Simulate stored auth code in cache
    $authCode = bin2hex(random_bytes(32));
    Cache::put("mcp-oauth-code:{$authCode}", [
        'client_id' => $client->id,
        'user_id' => $user->id,
        'redirect_uri' => 'http://localhost/callback',
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
    ], now()->addMinutes(5));

    $response = $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'code' => $authCode,
        'client_id' => $client->id,
        'code_verifier' => $codeVerifier,
        'redirect_uri' => 'http://localhost/callback',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['access_token', 'token_type', 'expires_in'])
        ->assertJsonFragment(['token_type' => 'bearer']);

    // Verify token was stored in DB
    expect(McpOAuthToken::where('user_id', $user->id)->exists())->toBeTrue();

    // Verify auth code was consumed (single-use)
    expect(Cache::has("mcp-oauth-code:{$authCode}"))->toBeFalse();
});

it('rejects token exchange with wrong code_verifier', function () {
    $user = User::factory()->create();
    $client = McpOAuthClient::create([
        'name' => 'Test Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $codeVerifier = bin2hex(random_bytes(32));
    $codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');

    $authCode = bin2hex(random_bytes(32));
    Cache::put("mcp-oauth-code:{$authCode}", [
        'client_id' => $client->id,
        'user_id' => $user->id,
        'redirect_uri' => 'http://localhost/callback',
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
    ], now()->addMinutes(5));

    $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'code' => $authCode,
        'client_id' => $client->id,
        'code_verifier' => 'wrong-verifier',
        'redirect_uri' => 'http://localhost/callback',
    ])->assertStatus(400)
        ->assertJsonFragment(['error' => 'invalid_grant']);
});

it('rejects token exchange with expired or invalid code', function () {
    $client = McpOAuthClient::create([
        'name' => 'Test Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'code' => 'nonexistent-code',
        'client_id' => $client->id,
        'code_verifier' => 'anything',
        'redirect_uri' => 'http://localhost/callback',
    ])->assertStatus(400)
        ->assertJsonFragment(['error' => 'invalid_grant']);
});

// ─── Client Secret Validation ────────────────────────────────────

it('exchanges token with valid client_secret for confidential client', function () {
    $user = User::factory()->create();
    $plainSecret = 'test-client-secret-value';
    $client = McpOAuthClient::create([
        'name' => 'Confidential Client',
        'secret_hash' => hash('sha256', $plainSecret),
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $codeVerifier = bin2hex(random_bytes(32));
    $codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');

    $authCode = bin2hex(random_bytes(32));
    Cache::put("mcp-oauth-code:{$authCode}", [
        'client_id' => $client->id,
        'user_id' => $user->id,
        'redirect_uri' => 'http://localhost/callback',
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
    ], now()->addMinutes(5));

    $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'code' => $authCode,
        'client_id' => $client->id,
        'client_secret' => $plainSecret,
        'code_verifier' => $codeVerifier,
        'redirect_uri' => 'http://localhost/callback',
    ])->assertStatus(200)
        ->assertJsonStructure(['access_token', 'token_type', 'expires_in']);
});

it('rejects token exchange with wrong client_secret', function () {
    $client = McpOAuthClient::create([
        'name' => 'Confidential Client',
        'secret_hash' => hash('sha256', 'real-secret'),
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'code' => 'any-code',
        'client_id' => $client->id,
        'client_secret' => 'wrong-secret',
        'code_verifier' => 'anything',
        'redirect_uri' => 'http://localhost/callback',
    ])->assertStatus(401)
        ->assertJsonFragment(['error' => 'invalid_client']);
});

it('rejects token exchange with missing client_secret for confidential client', function () {
    $client = McpOAuthClient::create([
        'name' => 'Confidential Client',
        'secret_hash' => hash('sha256', 'real-secret'),
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'code' => 'any-code',
        'client_id' => $client->id,
        'code_verifier' => 'anything',
        'redirect_uri' => 'http://localhost/callback',
    ])->assertStatus(401)
        ->assertJsonFragment(['error' => 'invalid_client']);
});

it('rejects token exchange with nonexistent client_id', function () {
    $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'code' => 'any-code',
        'client_id' => '00000000-0000-0000-0000-000000000000',
        'code_verifier' => 'anything',
        'redirect_uri' => 'http://localhost/callback',
    ])->assertStatus(401)
        ->assertJsonFragment(['error' => 'invalid_client']);
});

it('rejects token exchange with mismatched client_id', function () {
    $user = User::factory()->create();
    $client = McpOAuthClient::create([
        'name' => 'Real Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);
    $otherClient = McpOAuthClient::create([
        'name' => 'Other Client',
        'redirect_uris' => ['http://other.com/callback'],
    ]);

    $codeVerifier = bin2hex(random_bytes(32));
    $codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');

    $authCode = bin2hex(random_bytes(32));
    Cache::put("mcp-oauth-code:{$authCode}", [
        'client_id' => $client->id,
        'user_id' => $user->id,
        'redirect_uri' => 'http://localhost/callback',
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
    ], now()->addMinutes(5));

    $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'code' => $authCode,
        'client_id' => $otherClient->id,
        'code_verifier' => $codeVerifier,
        'redirect_uri' => 'http://localhost/callback',
    ])->assertStatus(400);
});
