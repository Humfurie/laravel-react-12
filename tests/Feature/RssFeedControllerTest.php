<?php

use App\Models\Blog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();
});

test('rss feed returns xml response', function () {
    Blog::factory()->published()->create();

    $response = $this->get(route('feed.rss'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8')
        ->assertHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
});

test('rss feed contains published blogs', function () {
    $blog = Blog::factory()->published()->create([
        'title' => 'Test RSS Blog',
        'slug' => 'test-rss-blog',
        'excerpt' => 'This is the excerpt',
    ]);

    $response = $this->get(route('feed.rss'));

    $response->assertOk()
        ->assertSee('Test RSS Blog')
        ->assertSee('test-rss-blog');
});

test('rss feed excludes draft blogs', function () {
    Blog::factory()->draft()->create(['title' => 'Draft Blog']);
    Blog::factory()->published()->create(['title' => 'Published Blog']);

    $response = $this->get(route('feed.rss'));

    $response->assertOk()
        ->assertDontSee('Draft Blog')
        ->assertSee('Published Blog');
});

test('rss feed is cached', function () {
    Blog::factory()->published()->create();

    // First request
    $this->get(route('feed.rss'))->assertOk();

    expect(Cache::has('rss:feed'))->toBeTrue();
});

test('rss feed limits to 20 posts', function () {
    Blog::factory()->published()->count(25)->create();

    $response = $this->get(route('feed.rss'));

    $response->assertOk();

    // Check cached data has 20 items
    $cachedBlogs = Cache::get('rss:feed');
    expect($cachedBlogs)->toHaveCount(20);
});

test('rss feed orders by published date descending', function () {
    $olderBlog = Blog::factory()->published()->create([
        'title' => 'Older Blog',
        'published_at' => now()->subDays(5),
    ]);
    $newerBlog = Blog::factory()->published()->create([
        'title' => 'Newer Blog',
        'published_at' => now()->subDay(),
    ]);

    $response = $this->get(route('feed.rss'));

    $content = $response->getContent();
    $newerPosition = strpos($content, 'Newer Blog');
    $olderPosition = strpos($content, 'Older Blog');

    expect($newerPosition)->toBeLessThan($olderPosition);
});
