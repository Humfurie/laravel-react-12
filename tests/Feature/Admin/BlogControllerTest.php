<?php

use App\Models\Blog;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    Storage::fake('public');
});

test('get primary and latest returns correct structure', function () {
    // Create test data
    $primaryBlogs = Blog::factory()->published()->primary()->count(2)->create();
    $regularBlogs = Blog::factory()->published()->count(4)->create(['isPrimary' => false]);

    $controller = new \App\Http\Controllers\User\BlogController();
    $result = $controller->getPrimaryAndLatest();

    expect($result)->toHaveKeys(['primary', 'latest', 'stats'])
        ->and($result['primary'])->toHaveCount(2)
        ->and($result['latest'])->toHaveCount(6)
        ->and($result['stats']['total_posts'])->toBe(6)
        ->and($result['stats']['featured_count'])->toBe(2)
        ->and($result['stats']['total_views'])->toBeGreaterThan(0);
});

test('image upload validates file requirements', function () {
    // Test with invalid file type
    $invalidFile = UploadedFile::fake()->create('document.pdf', 1000);

    $this->actingAs($this->user)
        ->post(route('blogs.upload-image'), ['image' => $invalidFile])
        ->assertSessionHasErrors(['image']);

    // Test with oversized file
    $oversizedFile = UploadedFile::fake()->create('huge.png', 6000);

    $this->actingAs($this->user)
        ->post(route('blogs.upload-image'), ['image' => $oversizedFile])
        ->assertSessionHasErrors(['image']);
});

test('image upload returns correct response format', function () {
    $file = UploadedFile::fake()->image('test-image.jpg', 100, 100)->mimeType('image/jpeg');

    $response = $this->actingAs($this->user)
        ->post(route('blogs.upload-image'), ['image' => $file])
        ->assertOk()
        ->assertJsonStructure([
            'success',
            'url',
            'path'
        ]);

    $responseData = $response->json();
    expect($responseData['success'])->toBeTrue()
        ->and($responseData['url'])->toContain('/storage/blog-images/')
        ->and($responseData['path'])->toContain('blog-images/');
});

test('blog creation sets published at when status is published', function () {
    $blogData = [
        'title' => 'Test Blog',
        'content' => '<p>Content</p>',
        'status' => 'published'
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
        'status' => 'draft'
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
        'status' => 'published'
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
        ->assertInertia(fn ($page) =>
        $page->component('user/home')
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
        'status' => 'draft'
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
        'meta_keywords' => 'php, laravel, seo, optimization'
    ];

    $blogData = [
        'title' => 'Test Blog',
        'content' => '<p>Content</p>',
        'status' => 'draft',
        'meta_data' => $metaData
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData);

    $blog = Blog::first();
    expect($blog->meta_data['meta_title'])->toBe($metaData['meta_title'])
        ->and($blog->meta_data['meta_description'])->toBe($metaData['meta_description'])
        ->and($blog->meta_data['meta_keywords'])->toBe($metaData['meta_keywords']);
});
