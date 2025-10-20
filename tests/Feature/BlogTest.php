<?php

use App\Models\Blog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createAdminUser('blog');
    Storage::fake('public');
});

test('authenticated user can view blog index', function () {
    $this->actingAs($this->user)
        ->get(route('blogs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/blog'));
});

test('authenticated user can create blog post', function () {
    $blogData = [
        'title' => 'Test Blog Post',
        'slug' => 'test-blog-post',
        'content' => '<p>This is test content</p>',
        'excerpt' => 'Test excerpt',
        'status' => 'published',
        'meta_data' => [
            'meta_title' => 'Test Meta Title',
            'meta_description' => 'Test meta description',
            'meta_keywords' => 'test, blog, post'
        ],
        'isPrimary' => false,
        'sort_order' => 0,
        'published_at' => now()->format('Y-m-d H:i:s')
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData)
        ->assertRedirect(route('blogs.index'));

    $this->assertDatabaseHas('blogs', [
        'title' => 'Test Blog Post',
        'slug' => 'test-blog-post',
        'status' => 'published'
    ]);
});

test('blog post auto generates slug from title', function () {
    $blogData = [
        'title' => 'My Amazing Blog Post Title',
        'content' => '<p>Content</p>',
        'status' => 'draft'
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData);

    $this->assertDatabaseHas('blogs', [
        'title' => 'My Amazing Blog Post Title',
        'slug' => 'my-amazing-blog-post-title'
    ]);
});

test('blog post auto generates meta data from title', function () {
    $blogData = [
        'title' => 'React Development Best Practices',
        'content' => '<p>Content</p>',
        'status' => 'draft',
        'meta_data' => [
            'meta_title' => '',
            'meta_description' => '',
            'meta_keywords' => ''
        ]
    ];

    $this->actingAs($this->user)
        ->post(route('blogs.store'), $blogData);

    $blog = Blog::first();
    expect($blog->meta_data['meta_title'])->toBe('React Development Best Practices')
        ->and(strtolower($blog->meta_data['meta_keywords']))->toContain('react')
        ->and(strtolower($blog->meta_data['meta_keywords']))->toContain('development');
});

test('authenticated user can update blog post', function () {
    $blog = Blog::factory()->create();

    $updateData = [
        'title' => 'Updated Blog Post',
        'content' => '<p>Updated content</p>',
        'status' => 'published'
    ];

    $this->actingAs($this->user)
        ->put(route('blogs.update', $blog->slug), $updateData)
        ->assertRedirect(route('blogs.index'));

    $this->assertDatabaseHas('blogs', [
        'id' => $blog->id,
        'title' => 'Updated Blog Post'
    ]);
});

test('authenticated user can delete blog post', function () {
    $blog = Blog::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('blogs.destroy', $blog->slug))
        ->assertRedirect(route('blogs.index'));

    $this->assertSoftDeleted('blogs', ['id' => $blog->id]);
});

test('authenticated user can restore deleted blog post', function () {
    $blog = Blog::factory()->create();
    $blog->delete();

    $this->actingAs($this->user)
        ->patch(route('blogs.restore', $blog->slug))
        ->assertRedirect(route('blogs.index'));

    $this->assertDatabaseHas('blogs', [
        'id' => $blog->id,
        'deleted_at' => null
    ]);
});

test('authenticated user can upload blog image', function () {
    $file = UploadedFile::fake()->image('test-image.jpg', 100, 100)->mimeType('image/jpeg');

    $response = $this->actingAs($this->user)
        ->post(route('blogs.upload-image'), [
            'image' => $file
        ]);

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'url',
            'path'
        ]);

    $responseData = $response->json();
    Storage::disk('public')->assertExists($responseData['path']);
});

test('blog post view count increments when viewed', function () {
    $blog = Blog::factory()->published()->create(['view_count' => 5]);

    $this->get(route('blog.show', $blog->slug))
        ->assertOk();

    $this->assertDatabaseHas('blogs', [
        'id' => $blog->id,
        'view_count' => 6
    ]);
});

test('unpublished blog post returns 404 for public access', function () {
    $blog = Blog::factory()->create(['status' => 'draft']);

    $this->get(route('blog.show', $blog->slug))
        ->assertNotFound();
});

test('published blog posts appear in public listing', function () {
    $publishedBlog = Blog::factory()->published()->create();
    $draftBlog = Blog::factory()->create(['status' => 'draft']);

    $response = $this->get(route('blog.index'))
        ->assertOk();

    $response->assertInertia(fn ($page) =>
    $page->component('user/blog')
        ->has('blogs.data', 1)
        ->where('blogs.data.0.id', $publishedBlog->id)
    );
});

test('home page shows primary and latest blogs with stats', function () {
    $primaryBlog = Blog::factory()->published()->create([
        'isPrimary' => true,
        'view_count' => 100
    ]);
    $regularBlog = Blog::factory()->published()->create([
        'isPrimary' => false,
        'view_count' => 50
    ]);

    $response = $this->get('/')
        ->assertOk();

    $response->assertInertia(fn ($page) =>
    $page->component('user/home')
        ->has('primary', 1)
        ->has('latest')
        ->has('stats')
        ->where('stats.total_posts', 2)
        ->where('stats.total_views', 150)
        ->where('stats.featured_count', 1)
    );
});

test('blog extracts display image from content', function () {
    $blog = Blog::factory()->create([
        'featured_image' => null,
        'content' => '<p>Some text</p><img src="/storage/test-image.jpg" alt="Test"><p>More text</p>'
    ]);

    expect($blog->display_image)->toBe('/storage/test-image.jpg');
});

test('blog prioritizes featured image over content image', function () {
    $blog = Blog::factory()->create([
        'featured_image' => '/storage/featured.jpg',
        'content' => '<p>Some text</p><img src="/storage/content-image.jpg" alt="Test"><p>More text</p>'
    ]);

    expect($blog->display_image)->toBe('/storage/featured.jpg');
});

test('blog returns null display image when no images available', function () {
    $blog = Blog::factory()->create([
        'featured_image' => null,
        'content' => '<p>Some text without images</p>'
    ]);

    expect($blog->display_image)->toBeNull();
});

test('unauthenticated user cannot access admin blog routes', function () {
    $this->get(route('blogs.index'))
        ->assertRedirect(route('login'));

    $this->post(route('blogs.store'), [])
        ->assertRedirect(route('login'));
});
