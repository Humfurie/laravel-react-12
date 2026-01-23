<?php

use App\Models\Blog;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();
});

describe('blog og image', function () {
    test('returns png image for published blog', function () {
        $blog = Blog::factory()->published()->create(['slug' => 'test-blog']);

        Http::fake([
            '*/generate*' => Http::response('fake-image-data', 200),
        ]);

        $response = $this->get(route('og-image.blog', 'test-blog'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'image/png');

        // Verify cache headers are set (may include additional directives)
        expect($response->headers->get('Cache-Control'))->toContain('max-age=86400');
    });

    test('returns 404 for non-existent blog', function () {
        $this->get(route('og-image.blog', 'non-existent'))
            ->assertNotFound();
    });

    test('caches generated image', function () {
        $blog = Blog::factory()->published()->create(['slug' => 'cached-blog']);

        Http::fake([
            '*/generate*' => Http::response('fake-image-data', 200),
        ]);

        // First request
        $this->get(route('og-image.blog', 'cached-blog'))->assertOk();

        // Verify cached
        expect(Cache::has('og:blog:cached-blog'))->toBeTrue();

        // Second request should use cache (Http should only be called once)
        $this->get(route('og-image.blog', 'cached-blog'))->assertOk();

        Http::assertSentCount(1);
    });

    test('returns fallback image when og image service is unavailable', function () {
        $blog = Blog::factory()->published()->create(['slug' => 'unavailable-test']);

        Http::fake([
            '*/generate*' => Http::response('', 500),
        ]);

        $response = $this->get(route('og-image.blog', 'unavailable-test'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'image/png');
    });
});

describe('project og image', function () {
    test('returns png image for public project', function () {
        $project = Project::factory()->public()->create(['slug' => 'test-project']);

        Http::fake([
            '*/generate*' => Http::response('fake-image-data', 200),
        ]);

        $response = $this->get(route('og-image.project', 'test-project'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'image/png');
    });

    test('returns 404 for non-existent project', function () {
        $this->get(route('og-image.project', 'non-existent'))
            ->assertNotFound();
    });

    test('sends correct params to og image service', function () {
        $project = Project::factory()->public()->create([
            'slug' => 'my-project',
            'title' => 'My Project',
            'short_description' => 'A great project',
        ]);

        Http::fake([
            '*/generate*' => Http::response('fake-image-data', 200),
        ]);

        $this->get(route('og-image.project', 'my-project'));

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'title=My')
                && str_contains($request->url(), 'type=Project');
        });
    });
});

describe('page og image', function () {
    test('returns png image for home page', function () {
        Http::fake([
            '*/generate*' => Http::response('fake-image-data', 200),
        ]);

        $response = $this->get(route('og-image.page', 'home'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'image/png');
    });

    test('returns png image for blog page', function () {
        Http::fake([
            '*/generate*' => Http::response('fake-image-data', 200),
        ]);

        $this->get(route('og-image.page', 'blog'))->assertOk();
    });

    test('returns png image for projects page', function () {
        Http::fake([
            '*/generate*' => Http::response('fake-image-data', 200),
        ]);

        $this->get(route('og-image.page', 'projects'))->assertOk();
    });

    test('returns 404 for invalid page name', function () {
        $this->get(route('og-image.page', 'invalid-page'))
            ->assertNotFound();
    });
});
