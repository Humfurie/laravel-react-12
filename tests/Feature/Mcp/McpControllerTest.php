<?php

// ─── MCP Controller: Authentication ──────────────────────────────

it('rejects unauthenticated requests', function () {
    $response = $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'initialize',
        'id' => 1,
    ]);

    $response->assertStatus(401);
    $response->assertJson(['error' => 'Unauthorized']);
});

it('authenticates with a valid API key', function () {
    config(['services.mcp.api_key' => 'test-mcp-key']);

    $response = $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'initialize',
        'id' => 1,
    ], ['Authorization' => 'Bearer test-mcp-key']);

    // A successful auth should return a JSON-RPC response (not 401/403)
    $response->assertStatus(200);
    $response->assertJsonStructure(['jsonrpc', 'id']);
});

// ─── MCP Controller: HTTP Method ─────────────────────────────────

it('returns 405 with Allow header for GET requests', function () {
    $response = $this->get('/mcp/portfolio');

    $response->assertStatus(405);
    $response->assertHeader('Allow', 'POST');
});

// ─── MCP Controller: Response Integrity ──────────────────────────

it('returns valid JSON-RPC response for initialize', function () {
    config(['services.mcp.api_key' => 'test-mcp-key']);

    $response = $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'initialize',
        'id' => 1,
    ], ['Authorization' => 'Bearer test-mcp-key']);

    $response->assertStatus(200);
    $response->assertJson([
        'jsonrpc' => '2.0',
        'id' => 1,
    ]);
    $response->assertJsonStructure([
        'result' => ['serverInfo', 'capabilities'],
    ]);
});

it('returns valid response body without offset corruption', function () {
    config(['services.mcp.api_key' => 'test-mcp-key']);

    $response = $this->postJson('/mcp/portfolio', [
        'jsonrpc' => '2.0',
        'method' => 'initialize',
        'id' => 1,
    ], ['Authorization' => 'Bearer test-mcp-key']);

    $body = $response->getContent();

    // Response should start with '{' — if offset is wrong, it would be truncated
    expect($body)->toStartWith('{');
    expect(json_decode($body, true))->not->toBeNull();
});
