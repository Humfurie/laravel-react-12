<?php

use App\Models\Blog;
use Carbon\Carbon;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('it has correct fillable attributes', function () {
    $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'status',
        'featured_image',
        'meta_data',
        'isPrimary',
        'sort_order',
        'view_count',
        'published_at',
    ];

    expect((new Blog())->getFillable())->toBe($fillable);
});

test('it casts attributes correctly', function () {
    $blog = Blog::factory()->create([
        'meta_data' => ['title' => 'Test'],
        'isPrimary' => true,
        'published_at' => '2023-01-01 12:00:00'
    ]);

    expect($blog->meta_data)->toBeArray()
        ->and($blog->isPrimary)->toBeBool()
        ->and($blog->published_at)->toBeInstanceOf(Carbon::class);
});

test('it uses slug as route key', function () {
    $blog = new Blog();
    expect($blog->getRouteKeyName())->toBe('slug');
});

test('published scope returns only published blogs', function () {
    // Create published blog
    $publishedBlog = Blog::factory()->create([
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subHour()
    ]);

    // Create draft blog
    $draftBlog = Blog::factory()->create([
        'status' => Blog::STATUS_DRAFT
    ]);

    // Create future published blog
    $futureBlog = Blog::factory()->create([
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->addHour()
    ]);

    $publishedBlogs = Blog::published()->get();

    expect($publishedBlogs)->toHaveCount(1)
        ->and($publishedBlogs->contains($publishedBlog))->toBeTrue()
        ->and($publishedBlogs->contains($draftBlog))->toBeFalse()
        ->and($publishedBlogs->contains($futureBlog))->toBeFalse();
});

test('draft scope returns only draft blogs', function () {
    $draftBlog = Blog::factory()->create(['status' => Blog::STATUS_DRAFT]);
    $publishedBlog = Blog::factory()->create(['status' => Blog::STATUS_PUBLISHED]);

    $draftBlogs = Blog::draft()->get();

    expect($draftBlogs)->toHaveCount(1)
        ->and($draftBlogs->contains($draftBlog))->toBeTrue()
        ->and($draftBlogs->contains($publishedBlog))->toBeFalse();
});

test('is published returns true for published past blogs', function () {
    $blog = Blog::factory()->create([
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subHour()
    ]);

    expect($blog->isPublished())->toBeTrue();
});

test('is published returns false for future published blogs', function () {
    $blog = Blog::factory()->create([
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->addHour()
    ]);

    expect($blog->isPublished())->toBeFalse();
});

test('is published returns false for draft blogs', function () {
    $blog = Blog::factory()->create(['status' => Blog::STATUS_DRAFT]);

    expect($blog->isPublished())->toBeFalse();
});

test('is draft returns true for draft blogs', function () {
    $blog = Blog::factory()->create(['status' => Blog::STATUS_DRAFT]);

    expect($blog->isDraft())->toBeTrue();
});

test('excerpt attribute returns provided excerpt', function () {
    $blog = Blog::factory()->create(['excerpt' => 'Custom excerpt']);

    expect($blog->excerpt)->toBe('Custom excerpt');
});

test('excerpt attribute generates from content when null', function () {
    $longContent = str_repeat('This is a long content. ', 20);
    $blog = Blog::factory()->create([
        'excerpt' => null,
        'content' => $longContent
    ]);

    expect($blog->excerpt)->not->toBeNull()
        ->and(strlen($blog->excerpt))->toBeLessThanOrEqual(163);
});

test('status label attribute returns correct labels', function () {
    $publishedBlog = Blog::factory()->create(['status' => Blog::STATUS_PUBLISHED]);
    $draftBlog = Blog::factory()->create(['status' => Blog::STATUS_DRAFT]);
    $privateBlog = Blog::factory()->create(['status' => Blog::STATUS_PRIVATE]);

    expect($publishedBlog->status_label)->toBe('Published')
        ->and($draftBlog->status_label)->toBe('Draft')
        ->and($privateBlog->status_label)->toBe('Private');
});

test('display image returns featured image when available', function () {
    $blog = Blog::factory()->create([
        'featured_image' => '/storage/featured.jpg',
        'content' => '<p>Some content with <img src="/storage/content.jpg"></p>'
    ]);

    expect($blog->display_image)->toBe('/storage/featured.jpg');
});

test('display image extracts first image from content', function () {
    $blog = Blog::factory()->create([
        'featured_image' => null,
        'content' => '<p>Some content</p><img src="/storage/first.jpg" alt="First"><img src="/storage/second.jpg" alt="Second">'
    ]);

    expect($blog->display_image)->toBe('/storage/first.jpg');
});

test('display image returns null when no images', function () {
    $blog = Blog::factory()->create([
        'featured_image' => null,
        'content' => '<p>Just text content without images</p>'
    ]);

    expect($blog->display_image)->toBeNull();
});

test('display image handles malformed html', function () {
    $blog = Blog::factory()->create([
        'featured_image' => null,
        'content' => '<p>Content with <img src="/test.jpg" broken tag'
    ]);

    expect($blog->display_image)->toBe('/test.jpg');
});

test('it soft deletes', function () {
    $blog = Blog::factory()->create();
    $blog->delete();

    $this->assertSoftDeleted('blogs', ['id' => $blog->id]);
    expect($blog->fresh()->deleted_at)->not->toBeNull();
});

test('it includes appended attributes', function () {
    $blog = Blog::factory()->create();
    $array = $blog->toArray();

    expect($array)->toHaveKey('status_label')
        ->and($array)->toHaveKey('display_image');
});
