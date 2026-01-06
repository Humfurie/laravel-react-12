<?php

use App\Models\Blog;
use App\Models\BlogView;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it has correct fillable attributes', function () {
    $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'status',
        'featured_image',
        'meta_data',
        'tags',
        'isPrimary',
        'featured_until',
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

// Featured Blog Logic Tests

test('is manually featured returns true when isPrimary is true and no expiration', function () {
    $blog = Blog::factory()->create([
        'isPrimary' => true,
        'featured_until' => null,
    ]);

    expect($blog->isManuallyFeatured())->toBeTrue();
});

test('is manually featured returns true when isPrimary is true and featured_until is in future', function () {
    $blog = Blog::factory()->create([
        'isPrimary' => true,
        'featured_until' => now()->addDays(7),
    ]);

    expect($blog->isManuallyFeatured())->toBeTrue();
});

test('is manually featured returns false when isPrimary is true but featured_until has passed', function () {
    $blog = Blog::factory()->create([
        'isPrimary' => true,
        'featured_until' => now()->subDays(1),
    ]);

    expect($blog->isManuallyFeatured())->toBeFalse();
});

test('is manually featured returns false when isPrimary is false', function () {
    $blog = Blog::factory()->create([
        'isPrimary' => false,
    ]);

    expect($blog->isManuallyFeatured())->toBeFalse();
});

test('manually featured scope returns blogs with valid featured status', function () {
    // Blog with isPrimary and no expiration
    $featuredForever = Blog::factory()->create([
        'isPrimary' => true,
        'featured_until' => null,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDay(),
    ]);

    // Blog with isPrimary and future expiration
    $featuredWithFutureExpiry = Blog::factory()->create([
        'isPrimary' => true,
        'featured_until' => now()->addDays(7),
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDay(),
    ]);

    // Blog with isPrimary but expired
    $expiredFeatured = Blog::factory()->create([
        'isPrimary' => true,
        'featured_until' => now()->subDays(1),
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDay(),
    ]);

    // Regular blog
    $regularBlog = Blog::factory()->create([
        'isPrimary' => false,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDay(),
    ]);

    $manuallyFeatured = Blog::published()->manuallyFeatured()->get();

    expect($manuallyFeatured)->toHaveCount(2)
        ->and($manuallyFeatured->contains($featuredForever))->toBeTrue()
        ->and($manuallyFeatured->contains($featuredWithFutureExpiry))->toBeTrue()
        ->and($manuallyFeatured->contains($expiredFeatured))->toBeFalse()
        ->and($manuallyFeatured->contains($regularBlog))->toBeFalse();
});

test('get featured blog returns manually featured blog first', function () {
    // Create a manually featured blog
    $manualFeatured = Blog::factory()->create([
        'isPrimary' => true,
        'featured_until' => null,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDay(),
        'sort_order' => 1,
    ]);

    // Create a blog with many views
    $popularBlog = Blog::factory()->create([
        'isPrimary' => false,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDays(2),
        'view_count' => 1000,
    ]);

    // Add view records for the popular blog
    BlogView::create([
        'blog_id' => $popularBlog->id,
        'view_date' => now()->subDays(1),
        'view_count' => 500,
    ]);

    $featured = Blog::getFeaturedBlog();

    expect($featured->id)->toBe($manualFeatured->id);
});

test('get featured blog falls back to most viewed when no manual featured', function () {
    // Create blogs with different view counts
    $lessPopular = Blog::factory()->create([
        'isPrimary' => false,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDays(5),
    ]);

    $morePopular = Blog::factory()->create([
        'isPrimary' => false,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDays(3),
    ]);

    // Add view records
    BlogView::create([
        'blog_id' => $lessPopular->id,
        'view_date' => now()->subDays(2),
        'view_count' => 10,
    ]);

    BlogView::create([
        'blog_id' => $morePopular->id,
        'view_date' => now()->subDays(2),
        'view_count' => 100,
    ]);

    $featured = Blog::getFeaturedBlog();

    expect($featured->id)->toBe($morePopular->id);
});

test('get featured blog returns recent post when no views tracked', function () {
    $olderPost = Blog::factory()->create([
        'isPrimary' => false,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDays(10),
    ]);

    $recentPost = Blog::factory()->create([
        'isPrimary' => false,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDays(1),
    ]);

    $featured = Blog::getFeaturedBlog();

    expect($featured->id)->toBe($recentPost->id);
});

test('get featured blogs returns mix of manual and auto featured', function () {
    // Create 2 manually featured blogs
    $manual1 = Blog::factory()->create([
        'isPrimary' => true,
        'featured_until' => null,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDay(),
        'sort_order' => 1,
    ]);

    $manual2 = Blog::factory()->create([
        'isPrimary' => true,
        'featured_until' => now()->addDays(7),
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDays(2),
        'sort_order' => 2,
    ]);

    // Create popular blogs
    $popular = Blog::factory()->create([
        'isPrimary' => false,
        'status' => Blog::STATUS_PUBLISHED,
        'published_at' => now()->subDays(5),
    ]);

    BlogView::create([
        'blog_id' => $popular->id,
        'view_date' => now()->subDays(1),
        'view_count' => 500,
    ]);

    $featured = Blog::getFeaturedBlogs(3);

    expect($featured)->toHaveCount(3)
        ->and($featured[0]->id)->toBe($manual1->id)
        ->and($featured[1]->id)->toBe($manual2->id)
        ->and($featured[2]->id)->toBe($popular->id);
});

// BlogView Model Tests

test('blog view records view correctly', function () {
    $blog = Blog::factory()->create();

    BlogView::recordView($blog->id);

    $view = BlogView::where('blog_id', $blog->id)
        ->where('view_date', now()->toDateString())
        ->first();

    expect($view)->not->toBeNull()
        ->and($view->view_count)->toBe(1);
});

test('blog view increments count for same day', function () {
    $blog = Blog::factory()->create();

    BlogView::recordView($blog->id);
    BlogView::recordView($blog->id);
    BlogView::recordView($blog->id);

    $view = BlogView::where('blog_id', $blog->id)
        ->where('view_date', now()->toDateString())
        ->first();

    expect($view->view_count)->toBe(3);
});

test('get views in last days sums correctly', function () {
    $blog = Blog::factory()->create();

    // Create views for past days
    BlogView::create([
        'blog_id' => $blog->id,
        'view_date' => now()->subDays(5)->toDateString(),
        'view_count' => 10,
    ]);

    BlogView::create([
        'blog_id' => $blog->id,
        'view_date' => now()->subDays(10)->toDateString(),
        'view_count' => 20,
    ]);

    // View outside of 7 days
    BlogView::create([
        'blog_id' => $blog->id,
        'view_date' => now()->subDays(35)->toDateString(),
        'view_count' => 100,
    ]);

    $viewsIn7Days = BlogView::getViewsInLastDays($blog->id, 7);
    $viewsIn30Days = BlogView::getViewsInLastDays($blog->id, 30);

    expect($viewsIn7Days)->toBe(10)
        ->and($viewsIn30Days)->toBe(30);
});

test('get most viewed blog ids returns correct order', function () {
    $blog1 = Blog::factory()->create();
    $blog2 = Blog::factory()->create();
    $blog3 = Blog::factory()->create();

    BlogView::create([
        'blog_id' => $blog1->id,
        'view_date' => now()->subDays(5)->toDateString(),
        'view_count' => 50,
    ]);

    BlogView::create([
        'blog_id' => $blog2->id,
        'view_date' => now()->subDays(5)->toDateString(),
        'view_count' => 200,
    ]);

    BlogView::create([
        'blog_id' => $blog3->id,
        'view_date' => now()->subDays(5)->toDateString(),
        'view_count' => 100,
    ]);

    $mostViewed = BlogView::getMostViewedBlogIds(30, 10);

    expect($mostViewed)->toBe([$blog2->id, $blog3->id, $blog1->id]);
});

test('daily views relationship works correctly', function () {
    $blog = Blog::factory()->create();

    BlogView::create([
        'blog_id' => $blog->id,
        'view_date' => now()->subDays(1)->toDateString(),
        'view_count' => 10,
    ]);

    BlogView::create([
        'blog_id' => $blog->id,
        'view_date' => now()->subDays(2)->toDateString(),
        'view_count' => 20,
    ]);

    expect($blog->dailyViews)->toHaveCount(2);
});

test('blog get views in last days method works', function () {
    $blog = Blog::factory()->create();

    BlogView::create([
        'blog_id' => $blog->id,
        'view_date' => now()->subDays(5)->toDateString(),
        'view_count' => 100,
    ]);

    expect($blog->getViewsInLastDays(30))->toBe(100);
});
