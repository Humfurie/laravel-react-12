<?php

use App\Models\McpOAuthClient;
use App\Models\McpOAuthToken;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(function () {
    RateLimiter::clear('mcp-auth:127.0.0.1');
});

it('rejects requests without a bearer token', function () {
    config(['services.mcp.api_key' => 'test-secret-key']);

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ])->assertStatus(401);
});

it('rejects requests with an invalid bearer token', function () {
    config(['services.mcp.api_key' => 'test-secret-key']);

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => 'Bearer wrong-key'])->assertStatus(401);
});

it('allows requests with a valid bearer token', function () {
    config(['services.mcp.api_key' => 'test-secret-key']);

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => 'Bearer test-secret-key'])->assertStatus(200);
});

it('rejects invalid token when no API key is configured', function () {
    config(['services.mcp.api_key' => null]);

    // With no API key, the middleware falls through to OAuth token check
    // which also fails — resulting in 401 (not 503, since OAuth is still available)
    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => 'Bearer some-key'])->assertStatus(401);
});

it('blocks IPs not in the allowlist', function () {
    config([
        'services.mcp.api_key' => 'test-secret-key',
        'services.mcp.allowed_ips' => ['192.168.1.1'],
    ]);

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => 'Bearer test-secret-key'])->assertStatus(403);
});

it('allows IPs in the allowlist', function () {
    config([
        'services.mcp.api_key' => 'test-secret-key',
        'services.mcp.allowed_ips' => ['127.0.0.1'],
    ]);

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => 'Bearer test-secret-key'])->assertStatus(200);
});

it('bypasses IP allowlist when no IPs are configured', function () {
    config([
        'services.mcp.api_key' => 'test-secret-key',
        'services.mcp.allowed_ips' => [],
    ]);

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => 'Bearer test-secret-key'])->assertStatus(200);
});

it('rate limits failed auth attempts', function () {
    config(['services.mcp.api_key' => 'test-secret-key']);

    for ($i = 0; $i < 10; $i++) {
        $this->postJson('/mcp/portfolio', [
            'jsonrpc' => '2.0',
            'method' => 'tools/list',
            'id' => 1,
        ], ['Authorization' => 'Bearer wrong-key']);
    }

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => 'Bearer wrong-key'])->assertStatus(429);
});

it('clears rate limit on successful auth', function () {
    config(['services.mcp.api_key' => 'test-secret-key']);

    // Fail 5 times
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/mcp/portfolio', [
            'jsonrpc' => '2.0',
            'method' => 'tools/list',
            'id' => 1,
        ], ['Authorization' => 'Bearer wrong-key']);
    }

    // Succeed — should clear the limiter
    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => 'Bearer test-secret-key'])->assertStatus(200);

    // Fail 5 more times — should still be under limit since it was cleared
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/mcp/portfolio', [
            'jsonrpc' => '2.0',
            'method' => 'tools/list',
            'id' => 1,
        ], ['Authorization' => 'Bearer wrong-key'])->assertStatus(401);
    }
});

// ─── OAuth Token Auth ─────────────────────────────────────────────

it('authenticates with a valid OAuth token', function () {
    config(['services.mcp.api_key' => null]);

    $user = User::factory()->create();
    $client = McpOAuthClient::create([
        'name' => 'Test Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $plainToken = 'test-oauth-token-string';
    McpOAuthToken::create([
        'client_id' => $client->id,
        'user_id' => $user->id,
        'token_hash' => hash('sha256', $plainToken),
        'expires_at' => now()->addDay(),
    ]);

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => "Bearer {$plainToken}"])->assertStatus(200);
});

it('rejects an expired OAuth token', function () {
    config(['services.mcp.api_key' => null]);

    $user = User::factory()->create();
    $client = McpOAuthClient::create([
        'name' => 'Test Client',
        'redirect_uris' => ['http://localhost/callback'],
    ]);

    $plainToken = 'expired-oauth-token';
    McpOAuthToken::create([
        'client_id' => $client->id,
        'user_id' => $user->id,
        'token_hash' => hash('sha256', $plainToken),
        'expires_at' => now()->subHour(),
    ]);

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => "Bearer {$plainToken}"])->assertStatus(401);
});
