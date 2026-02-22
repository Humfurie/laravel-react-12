<?php

use App\Mcp\Tools\Image\UploadImageFromUrl;
use App\Models\Blog;
use App\Models\Expertise;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

function callUploadTool(array $arguments): Response
{
    return (new UploadImageFromUrl)->handle(new Request($arguments));
}

function uploadToolData(Response $result): array
{
    return json_decode((string) $result->content(), true);
}

// ─── Validation ──────────────────────────────────────────────────

it('rejects non-HTTPS URLs', function () {
    $result = callUploadTool(['url' => 'http://example.com/image.jpg']);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('HTTPS');
});

it('rejects URLs without a scheme', function () {
    $result = callUploadTool(['url' => 'example.com/image.jpg']);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('HTTPS');
});

it('rejects invalid content types', function () {
    Http::fake([
        'https://example.com/file.pdf' => Http::response('not-an-image', 200, [
            'Content-Type' => 'application/pdf',
        ]),
    ]);

    Storage::fake('minio');

    $result = callUploadTool(['url' => 'https://example.com/file.pdf']);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('Invalid content type');
});

it('rejects providing both blog_id and expertise_id', function () {
    $result = callUploadTool([
        'url' => 'https://example.com/photo.jpg',
        'blog_id' => 1,
        'expertise_id' => 1,
    ]);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('not both');
});

it('rejects oversized images', function () {
    $oversizedBody = str_repeat('x', 6 * 1024 * 1024); // 6MB

    Http::fake([
        'https://example.com/huge.jpg' => Http::response($oversizedBody, 200, [
            'Content-Type' => 'image/jpeg',
        ]),
    ]);

    Storage::fake('minio');

    $result = callUploadTool(['url' => 'https://example.com/huge.jpg']);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('5MB');
});

// ─── Download failures ──────────────────────────────────────────

it('handles download failure gracefully', function () {
    Http::fake([
        'https://example.com/missing.jpg' => Http::response('Not Found', 404),
    ]);

    Storage::fake('minio');

    $result = callUploadTool(['url' => 'https://example.com/missing.jpg']);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('404');
});

// ─── Successful upload ──────────────────────────────────────────

it('downloads and stores an image successfully', function () {
    $fakeImageContent = 'fake-image-binary-data';

    Http::fake([
        'https://example.com/photo.png' => Http::response($fakeImageContent, 200, [
            'Content-Type' => 'image/png',
        ]),
    ]);

    Storage::fake('minio');

    $result = callUploadTool(['url' => 'https://example.com/photo.png']);
    $data = uploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['path'])->toStartWith('/storage/blog-images/');
    expect($data['path'])->toEndWith('.png');
    expect($data['size'])->toBe(strlen($fakeImageContent));
    expect($data['mime_type'])->toBe('image/png');
    expect($data['blog_updated'])->toBe('none');

    // Verify file was stored
    $storagePath = str_replace('/storage/', '', $data['path']);
    Storage::disk('minio')->assertExists($storagePath);
});

it('handles Content-Type with charset parameter', function () {
    Http::fake([
        'https://example.com/photo.jpg' => Http::response('image-data', 200, [
            'Content-Type' => 'image/jpeg; charset=utf-8',
        ]),
    ]);

    Storage::fake('minio');

    $result = callUploadTool(['url' => 'https://example.com/photo.jpg']);
    $data = uploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['mime_type'])->toBe('image/jpeg');
});

// ─── Blog association ───────────────────────────────────────────

it('associates uploaded image with a blog by ID', function () {
    $blog = Blog::factory()->published()->create(['featured_image' => null]);

    Http::fake([
        'https://example.com/featured.webp' => Http::response('webp-data', 200, [
            'Content-Type' => 'image/webp',
        ]),
    ]);

    Storage::fake('minio');

    $result = callUploadTool([
        'url' => 'https://example.com/featured.webp',
        'blog_id' => $blog->id,
    ]);
    $data = uploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['blog_updated'])->toBe('updated');
    expect($blog->fresh()->featured_image)->toBe($data['path']);
});

it('associates uploaded image with a blog by slug', function () {
    $blog = Blog::factory()->published()->create(['slug' => 'my-test-blog', 'featured_image' => null]);

    Http::fake([
        'https://example.com/featured.gif' => Http::response('gif-data', 200, [
            'Content-Type' => 'image/gif',
        ]),
    ]);

    Storage::fake('minio');

    $result = callUploadTool([
        'url' => 'https://example.com/featured.gif',
        'blog_slug' => 'my-test-blog',
    ]);
    $data = uploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['blog_updated'])->toBe('updated');
    expect($blog->fresh()->featured_image)->toBe($data['path']);
});

it('skips blog that already has a featured image without downloading', function () {
    $blog = Blog::factory()->published()->create(['featured_image' => '/storage/existing.jpg']);

    Http::fake();
    Storage::fake('minio');

    $result = callUploadTool([
        'url' => 'https://example.com/new.webp',
        'blog_id' => $blog->id,
    ]);
    $data = uploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['blog_updated'])->toBe('skipped');
    expect($data['path'])->toBeNull();
    expect($blog->fresh()->featured_image)->toBe('/storage/existing.jpg');
    Http::assertNothingSent();
});

it('succeeds even when blog_id does not exist', function () {
    Http::fake([
        'https://example.com/photo.jpg' => Http::response('image-data', 200, [
            'Content-Type' => 'image/jpeg',
        ]),
    ]);

    Storage::fake('minio');

    $result = callUploadTool([
        'url' => 'https://example.com/photo.jpg',
        'blog_id' => 99999,
    ]);
    $data = uploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['blog_updated'])->toBe('not_found');
});

// ─── Expertise association ──────────────────────────────────────

it('associates uploaded image with an expertise by ID', function () {
    $expertise = Expertise::factory()->create(['image' => null]);

    Http::fake([
        'https://example.com/icon.png' => Http::response('png-data', 200, [
            'Content-Type' => 'image/png',
        ]),
    ]);

    Storage::fake('minio');

    $result = callUploadTool([
        'url' => 'https://example.com/icon.png',
        'expertise_id' => $expertise->id,
    ]);
    $data = uploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['expertise_updated'])->toBe('updated');
    expect($data['path'])->toStartWith('/storage/images/techstack/');
    expect($expertise->fresh()->image)->toBe($data['path']);
});

it('skips expertise that already has an image without downloading', function () {
    $expertise = Expertise::factory()->create(['image' => '/storage/existing-icon.png']);

    Http::fake();
    Storage::fake('minio');

    $result = callUploadTool([
        'url' => 'https://example.com/new-icon.png',
        'expertise_id' => $expertise->id,
    ]);
    $data = uploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['expertise_updated'])->toBe('skipped');
    expect($data['path'])->toBeNull();
    expect($expertise->fresh()->image)->toBe('/storage/existing-icon.png');
    Http::assertNothingSent();
});

it('stores in blog-images when expertise_id does not exist', function () {
    Http::fake([
        'https://example.com/icon.png' => Http::response('png-data', 200, [
            'Content-Type' => 'image/png',
        ]),
    ]);

    Storage::fake('minio');

    $result = callUploadTool([
        'url' => 'https://example.com/icon.png',
        'expertise_id' => 99999,
    ]);
    $data = uploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['expertise_updated'])->toBe('not_found');
    expect($data['path'])->toStartWith('/storage/blog-images/');
});
