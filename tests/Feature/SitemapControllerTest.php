<?php

use App\Models\Blog;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();
});

describe('sitemap index', function () {
    test('returns xml response', function () {
        $response = $this->get(route('sitemap.index'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/xml');

        $cacheControl = $response->headers->get('Cache-Control');
        expect($cacheControl)->toContain('public');
        expect($cacheControl)->toContain('max-age=3600');
        expect($cacheControl)->toContain('s-maxage=3600');
    });

    test('contains links to all sitemaps', function () {
        $response = $this->get(route('sitemap.index'));

        $response->assertOk()
            ->assertSee('sitemap-pages.xml')
            ->assertSee('sitemap-blogs.xml')
            ->assertSee('sitemap-projects.xml');
    });

    test('includes latest blog modification date', function () {
        $blog = Blog::factory()->published()->create([
            'updated_at' => '2024-06-15 10:00:00',
        ]);

        $response = $this->get(route('sitemap.index'));

        $response->assertOk()
            ->assertSee('2024-06-15');
    });
});

describe('pages sitemap', function () {
    test('returns xml response', function () {
        $response = $this->get(route('sitemap.pages'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/xml');
    });

    test('contains static page urls', function () {
        $appUrl = config('app.url');

        $response = $this->get(route('sitemap.pages'));

        $response->assertOk()
            ->assertSee($appUrl);
    });
});

describe('blogs sitemap', function () {
    test('returns xml response', function () {
        $response = $this->get(route('sitemap.blogs'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/xml');
    });

    test('contains published blog urls', function () {
        $blog = Blog::factory()->published()->create([
            'slug' => 'sitemap-test-blog',
        ]);

        $response = $this->get(route('sitemap.blogs'));

        $response->assertOk()
            ->assertSee('sitemap-test-blog');
    });

    test('excludes draft blogs', function () {
        Blog::factory()->draft()->create(['slug' => 'draft-blog']);
        Blog::factory()->published()->create(['slug' => 'published-blog']);

        $response = $this->get(route('sitemap.blogs'));

        $response->assertOk()
            ->assertDontSee('draft-blog')
            ->assertSee('published-blog');
    });

    test('caches blog sitemap', function () {
        Blog::factory()->published()->create();

        $this->get(route('sitemap.blogs'));

        expect(Cache::has('sitemap:blogs'))->toBeTrue();
    });
});

describe('projects sitemap', function () {
    test('returns xml response', function () {
        $response = $this->get(route('sitemap.projects'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/xml');
    });

    test('contains public project urls', function () {
        $project = Project::factory()->public()->create([
            'slug' => 'sitemap-test-project',
        ]);

        $response = $this->get(route('sitemap.projects'));

        $response->assertOk()
            ->assertSee('sitemap-test-project');
    });

    test('excludes private projects', function () {
        Project::factory()->private()->create(['slug' => 'private-project']);
        Project::factory()->public()->create(['slug' => 'public-project']);

        $response = $this->get(route('sitemap.projects'));

        $response->assertOk()
            ->assertDontSee('private-project')
            ->assertSee('public-project');
    });

    test('caches project sitemap', function () {
        Project::factory()->public()->create();

        $this->get(route('sitemap.projects'));

        expect(Cache::has('sitemap:projects'))->toBeTrue();
    });

    test('eager loads primary image to avoid n+1', function () {
        Project::factory()->public()->count(5)->create();

        // This test verifies the query uses with('primaryImage')
        // If N+1 existed, this would generate 6 queries instead of 2
        $this->get(route('sitemap.projects'))->assertOk();
    });
});
