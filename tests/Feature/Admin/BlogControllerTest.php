<?php

use App\Http\Controllers\BlogController;
use App\Models\Blog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create admin user with blog permissions
    $this->user = createAdminUser('blog');
    // Set admin user ID in config for homepage tests
    config(['app.admin_user_id' => $this->user->id]);

    Storage::fake('minio');
});

test('get primary and latest returns correct structure', function () {
    // Create test data
    $primaryBlogs = Blog::factory()->published()->primary()->count(2)->create();
    $regularBlogs = Blog::factory()->published()->count(4)->create(['isPrimary' => false]);

    $controller = new BlogController;
    $result = $controller->getPrimaryAndLatest();

    expect($result)->toHaveKeys(['primary', 'latest', 'stats'])
        ->and($result['primary'])->toHaveCount(3) // getFeaturedBlogs(3) returns 2 manual + 1 auto-featured
        ->and($result['latest'])->toHaveCount(6)
        ->and($result['stats']['total_posts'])->toBe(6)
        ->and($result['stats']['featured_count'])->toBe(2) // Only 2 manually featured
        ->and($result['stats']['total_views'])->toBeGreaterThan(0);
});

test('blog creation sets published at when status is published', function () {
    $blogData = [
        'title' => 'Test Blog',
        'content' => '<p>Content</p>',
        'status' => 'published',
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData)
        ->assertRedirect();

    $blog = Blog::first();
    expect($blog->status)->toBe('published')
        ->and($blog->published_at)->not->toBeNull();
});

test('blog creation does not set published at for drafts', function () {
    $blogData = [
        'title' => 'Draft Blog',
        'content' => '<p>Content</p>',
        'status' => 'draft',
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData)
        ->assertRedirect();

    $blog = Blog::first();
    expect($blog->status)->toBe('draft')
        ->and($blog->published_at)->toBeNull();
});

test('blog update changes published at when status changes', function () {
    $blog = Blog::factory()->draft()->create(['isPrimary' => false]);

    $updateData = [
        'title' => $blog->title,
        'content' => $blog->content,
        'status' => 'published',
    ];

    $this->actingAs($this->user)
        ->put(route('blogs.update', $blog->slug), $updateData)
        ->assertRedirect();

    $blog->refresh();
    expect($blog->status)->toBe('published')
        ->and($blog->published_at)->not->toBeNull();
});

test('blog force destroy permanently deletes', function () {
    $blog = Blog::factory()->create(['isPrimary' => false]);
    $blog->delete(); // Soft delete first

    $this->actingAs($this->user)
        ->delete(route('blogs.force-destroy', $blog->slug))
        ->assertRedirect();

    $this->assertDatabaseMissing('blogs', ['id' => $blog->id]);
});

test('public blog routes work correctly', function () {
    $publishedBlog = Blog::factory()->published()->create(['isPrimary' => false]);

    // Test blog listing
    $this->get(route('blog.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('user/blog'));

    // Test individual blog post
    $this->get(route('blog.show', $publishedBlog->slug))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('user/blog-post'));
});

test('home page displays blog statistics', function () {
    $primaryBlogs = Blog::factory()->published()->primary()->count(2)->create(['view_count' => 100]);
    $regularBlogs = Blog::factory()->published()->count(3)->create(['view_count' => 50, 'isPrimary' => false]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('user/home')
            ->has('stats')
            ->where('stats.total_posts', 5)
            ->where('stats.total_views', 350)
            ->where('stats.featured_count', 2)
        );
});

test('slug generation handles special characters', function () {
    $blogData = [
        'title' => 'How to Use PHP & JavaScript: A Complete Guide!',
        'content' => '<p>Content</p>',
        'status' => 'draft',
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData);

    $blog = Blog::first();
    expect($blog->slug)->toBe('how-to-use-php-javascript-a-complete-guide');
});

test('meta data is properly stored and retrieved', function () {
    $metaData = [
        'meta_title' => 'Custom SEO Title',
        'meta_description' => 'Custom SEO description for better ranking',
        'meta_keywords' => 'php, laravel, seo, optimization',
    ];

    $blogData = [
        'title' => 'Test Blog',
        'content' => '<p>Content</p>',
        'status' => 'draft',
        'meta_data' => $metaData,
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData);

    $blog = Blog::first();
    expect($blog->meta_data['meta_title'])->toBe($metaData['meta_title'])
        ->and($blog->meta_data['meta_description'])->toBe($metaData['meta_description'])
        ->and($blog->meta_data['meta_keywords'])->toBe($metaData['meta_keywords']);
});

test('blog creation fails when meta_title exceeds 60 characters', function () {
    $blogData = [
        'title' => 'Test Blog',
        'content' => '<p>Content</p>',
        'status' => 'draft',
        'meta_data' => [
            'meta_title' => str_repeat('a', 61),
        ],
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData)
        ->assertSessionHasErrors('meta_data.meta_title');
});

test('blog creation fails when meta_description exceeds 160 characters', function () {
    $blogData = [
        'title' => 'Test Blog',
        'content' => '<p>Content</p>',
        'status' => 'draft',
        'meta_data' => [
            'meta_description' => str_repeat('a', 161),
        ],
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData)
        ->assertSessionHasErrors('meta_data.meta_description');
});

test('blog creation fails when meta_keywords exceeds 255 characters', function () {
    $blogData = [
        'title' => 'Test Blog',
        'content' => '<p>Content</p>',
        'status' => 'draft',
        'meta_data' => [
            'meta_keywords' => str_repeat('a', 256),
        ],
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData)
        ->assertSessionHasErrors('meta_data.meta_keywords');
});

test('blog update fails when meta_title exceeds 60 characters', function () {
    $blog = Blog::factory()->draft()->create(['isPrimary' => false]);

    $this->actingAs($this->user)
        ->put(route('blogs.update', $blog->slug), [
            'title' => $blog->title,
            'content' => $blog->content,
            'status' => 'draft',
            'meta_data' => [
                'meta_title' => str_repeat('a', 61),
            ],
        ])
        ->assertSessionHasErrors('meta_data.meta_title');
});
