<?php

use App\Http\Middleware\CacheHeaders;
use App\Models\Blog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

uses(RefreshDatabase::class);

test('homepage gets cache headers', function () {
    $response = $this->get('/');

    $response->assertHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
});

test('blog listing gets cache headers', function () {
    $response = $this->get('/blog');

    $response->assertHeader('Cache-Control', 'public, max-age=300, s-maxage=1800');
});

test('blog post gets cache headers', function () {
    $blog = Blog::factory()->published()->create();

    $response = $this->get("/blog/{$blog->slug}");

    $response->assertHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
});

test('projects page gets cache headers', function () {
    $response = $this->get('/projects');

    $response->assertHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
});

test('authenticated users do not get cache headers', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/');

    // Authenticated users should not have public cache headers
    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->not->toContain('public, max-age=300');
});

test('post requests do not get cache headers', function () {
    $middleware = new CacheHeaders;
    $request = Request::create('/blog', 'POST');

    $response = $middleware->handle($request, function () {
        return new Response('test');
    });

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->not->toContain('s-maxage');
});

test('unconfigured routes do not get cache headers', function () {
    $middleware = new CacheHeaders;
    $request = Request::create('/some-random-route', 'GET');

    $response = $middleware->handle($request, function () {
        return new Response('test');
    });

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->not->toContain('s-maxage=3600');
});

test('wildcard pattern matches nested blog routes', function () {
    $blog = Blog::factory()->published()->create(['slug' => 'nested-blog-post']);

    $response = $this->get('/blog/nested-blog-post');

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('s-maxage=3600');
});
