<?php

namespace App\Http\Controllers;

use App\Models\McpOAuthClient;
use App\Models\McpOAuthToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class McpOAuthController extends Controller
{
    /**
     * OAuth2 Protected Resource discovery.
     * GET /.well-known/oauth-protected-resource
     */
    public function discovery(): JsonResponse
    {
        return response()->json([
            'resource' => config('app.url'),
            'authorization_server' => url('/.well-known/oauth-authorization-server'),
        ]);
    }

    /**
     * OAuth2 Authorization Server metadata.
     * GET /.well-known/oauth-authorization-server
     */
    public function metadata(): JsonResponse
    {
        return response()->json([
            'issuer' => config('app.url'),
            'authorization_endpoint' => url('/oauth/authorize'),
            'token_endpoint' => url('/oauth/token'),
            'registration_endpoint' => url('/oauth/register'),
            'response_types_supported' => ['code'],
            'code_challenge_methods_supported' => ['S256'],
            'grant_types_supported' => ['authorization_code'],
            'token_endpoint_auth_methods_supported' => ['client_secret_post'],
        ]);
    }

    /**
     * Dynamic client registration (MCP spec requirement).
     * POST /oauth/register
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'redirect_uris' => 'required|array|min:1',
            'redirect_uris.*' => 'required|url',
        ]);

        $plainSecret = Str::random(64);

        $client = McpOAuthClient::create([
            'name' => $validated['client_name'],
            'secret_hash' => hash('sha256', $plainSecret),
            'redirect_uris' => $validated['redirect_uris'],
        ]);

        return response()->json([
            'client_id' => $client->id,
            'client_secret' => $plainSecret,
            'client_name' => $client->name,
            'redirect_uris' => $client->redirect_uris,
        ], 201);
    }

    /**
     * Show the authorization consent page.
     * GET /oauth/authorize
     */
    public function showAuthorization(Request $request)
    {
        $request->validate([
            'client_id' => 'required|uuid',
            'redirect_uri' => 'required|url',
            'response_type' => 'required|in:code',
            'code_challenge' => 'required|string',
            'code_challenge_method' => 'required|in:S256',
            'state' => 'nullable|string',
        ]);

        $client = McpOAuthClient::find($request->client_id);

        if (! $client) {
            abort(400, 'Unknown client.');
        }

        if (! in_array($request->redirect_uri, $client->redirect_uris, true)) {
            abort(400, 'Invalid redirect URI.');
        }

        return view('oauth.authorize', [
            'client' => $client,
            'redirect_uri' => $request->redirect_uri,
            'code_challenge' => $request->code_challenge,
            'code_challenge_method' => $request->code_challenge_method,
            'state' => $request->state,
        ]);
    }

    /**
     * Handle the user's authorization decision.
     * POST /oauth/authorize
     */
    public function approveAuthorization(Request $request): RedirectResponse
    {
        $request->validate([
            'client_id' => 'required|uuid',
            'redirect_uri' => 'required|url',
            'code_challenge' => 'required|string',
            'code_challenge_method' => 'required|in:S256',
            'state' => 'nullable|string',
        ]);

        $client = McpOAuthClient::find($request->client_id);

        if (! $client || ! in_array($request->redirect_uri, $client->redirect_uris, true)) {
            abort(400, 'Invalid request.');
        }

        // Generate a one-time authorization code
        $code = Str::random(64);

        // Store in cache with 5-minute TTL (codes are exchanged immediately)
        Cache::put("mcp-oauth-code:{$code}", [
            'client_id' => $client->id,
            'user_id' => $request->user()->id,
            'redirect_uri' => $request->redirect_uri,
            'code_challenge' => $request->code_challenge,
            'code_challenge_method' => $request->code_challenge_method,
        ], now()->addMinutes(5));

        $query = http_build_query(array_filter([
            'code' => $code,
            'state' => $request->state,
        ]));

        return redirect("{$request->redirect_uri}?{$query}");
    }

    /**
     * Exchange authorization code for access token.
     * POST /oauth/token
     */
    public function token(Request $request): JsonResponse
    {
        $request->validate([
            'grant_type' => 'required|in:authorization_code',
            'code' => 'required|string',
            'client_id' => 'required|uuid',
            'client_secret' => 'nullable|string',
            'code_verifier' => 'required|string',
            'redirect_uri' => 'required|url',
        ]);

        // Validate client exists and authenticate if it has a secret
        $client = McpOAuthClient::find($request->client_id);

        if (! $client) {
            return response()->json(['error' => 'invalid_client', 'error_description' => 'Unknown client.'], 401);
        }

        if ($client->secret_hash) {
            if (! $request->client_secret || ! hash_equals($client->secret_hash, hash('sha256', $request->client_secret))) {
                return response()->json(['error' => 'invalid_client', 'error_description' => 'Client authentication failed.'], 401);
            }
        }

        // Retrieve and consume the authorization code (single-use)
        $codeData = Cache::pull("mcp-oauth-code:{$request->code}");

        if (! $codeData) {
            return response()->json(['error' => 'invalid_grant', 'error_description' => 'Authorization code is invalid or expired.'], 400);
        }

        // Validate client_id and redirect_uri match
        if ($codeData['client_id'] !== $request->client_id || $codeData['redirect_uri'] !== $request->redirect_uri) {
            return response()->json(['error' => 'invalid_grant', 'error_description' => 'Client or redirect URI mismatch.'], 400);
        }

        // Validate PKCE: base64url(sha256(code_verifier)) must equal code_challenge
        $computedChallenge = rtrim(strtr(base64_encode(hash('sha256', $request->code_verifier, true)), '+/', '-_'), '=');

        if (! hash_equals($codeData['code_challenge'], $computedChallenge)) {
            return response()->json(['error' => 'invalid_grant', 'error_description' => 'PKCE verification failed.'], 400);
        }

        // Generate access token
        $plainToken = Str::random(80);
        $expiresAt = now()->addDays(30);

        McpOAuthToken::create([
            'client_id' => $codeData['client_id'],
            'user_id' => $codeData['user_id'],
            'token_hash' => hash('sha256', $plainToken),
            'expires_at' => $expiresAt,
        ]);

        return response()->json([
            'access_token' => $plainToken,
            'token_type' => 'bearer',
            'expires_in' => 30 * 24 * 60 * 60, // 30 days in seconds
        ]);
    }
}
