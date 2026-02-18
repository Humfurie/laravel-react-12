<?php

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

it('returns 503 when no API key is configured', function () {
    config(['services.mcp.api_key' => null]);

    $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'tools/list',
        'id' => 1,
    ], ['Authorization' => 'Bearer some-key'])->assertStatus(503);
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
