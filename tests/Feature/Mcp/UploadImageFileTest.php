<?php

use App\Mcp\Tools\Image\UploadImageFile;
use App\Models\Blog;
use App\Models\Expertise;
use App\Models\Project;
use Illuminate\Support\Facades\Storage;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

function callFileUploadTool(array $arguments): Response
{
    return (new UploadImageFile)->handle(new Request($arguments));
}

function fileUploadToolData(Response $result): array
{
    return json_decode((string) $result->content(), true);
}

// ─── Validation ──────────────────────────────────────────────────

it('rejects missing base64', function () {
    $result = callFileUploadTool([]);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('base64 is required');
});

it('rejects invalid base64 data', function () {
    $result = callFileUploadTool(['base64' => 'not-valid-base64!!!']);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('Invalid base64');
});

it('rejects oversized images', function () {
    $oversizedData = str_repeat('A', 6 * 1024 * 1024);
    $b64 = base64_encode($oversizedData);

    $result = callFileUploadTool(['base64' => $b64]);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('5MB');
});

it('rejects invalid mime types', function () {
    $pdfHeader = "%PDF-1.4 fake pdf content";
    $b64 = base64_encode($pdfHeader);

    $result = callFileUploadTool(['base64' => $b64]);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('Invalid content type');
});

it('rejects providing both blog_id and expertise_id', function () {
    $result = callFileUploadTool([
        'base64' => base64_encode('fake'),
        'blog_id' => 1,
        'expertise_id' => 1,
    ]);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('only one of');
});

it('rejects providing both project_id and expertise_id', function () {
    $result = callFileUploadTool([
        'base64' => base64_encode('fake'),
        'project_id' => 1,
        'expertise_id' => 1,
    ]);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('only one of');
});

// ─── Successful upload ──────────────────────────────────────────

it('stores a PNG image successfully', function () {
    // Minimal valid 1x1 PNG
    $pngData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');

    Storage::fake();

    $result = callFileUploadTool(['base64' => base64_encode($pngData)]);
    $data = fileUploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['path'])->toContain('/blog-images/');
    expect($data['path'])->toEndWith('.png');
    expect($data['mime_type'])->toBe('image/png');
    expect($data['blog_updated'])->toBe('none');
    expect($data['expertise_updated'])->toBe('none');
    expect($data['project_updated'])->toBe('none');
});

// ─── Blog association ───────────────────────────────────────────

it('associates uploaded image with a blog by ID', function () {
    $pngData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    $blog = Blog::factory()->published()->create(['featured_image' => null]);

    Storage::fake();

    $result = callFileUploadTool([
        'base64' => base64_encode($pngData),
        'blog_id' => $blog->id,
    ]);
    $data = fileUploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['blog_updated'])->toBe('updated');
    expect($blog->fresh()->featured_image)->toBe($data['path']);
});

it('skips blog that already has a featured image', function () {
    $blog = Blog::factory()->published()->create(['featured_image' => '/storage/existing.jpg']);

    Storage::fake();

    $result = callFileUploadTool([
        'base64' => base64_encode('fake'),
        'blog_id' => $blog->id,
    ]);
    $data = fileUploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['blog_updated'])->toBe('skipped');
    expect($data['path'])->toBeNull();
    expect($blog->fresh()->featured_image)->toBe('/storage/existing.jpg');
});

it('returns error when blog_id does not exist', function () {
    $result = callFileUploadTool([
        'base64' => base64_encode('fake'),
        'blog_id' => 99999,
    ]);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('Blog not found');
});

// ─── Expertise association ──────────────────────────────────────

it('associates uploaded image with an expertise', function () {
    $pngData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    $expertise = Expertise::factory()->create(['image' => null]);

    Storage::fake();

    $result = callFileUploadTool([
        'base64' => base64_encode($pngData),
        'expertise_id' => $expertise->id,
    ]);
    $data = fileUploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['expertise_updated'])->toBe('updated');
    expect($data['path'])->toContain('/images/techstack/');
    expect($expertise->fresh()->image)->toBe($data['path']);
});

it('returns error when expertise_id does not exist', function () {
    $result = callFileUploadTool([
        'base64' => base64_encode('fake'),
        'expertise_id' => 99999,
    ]);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('Expertise not found');
});

// ─── Project association ─────────────────────────────────────────

it('associates uploaded image with a project', function () {
    $pngData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    $project = Project::factory()->create();

    Storage::fake();

    $result = callFileUploadTool([
        'base64' => base64_encode($pngData),
        'project_id' => $project->id,
    ]);
    $data = fileUploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['project_updated'])->toBe('updated');
    expect($data['path'])->toContain('/project-images/');
    expect($project->fresh()->primaryImage)->not->toBeNull();
});

it('skips project that already has a primary image', function () {
    $project = Project::factory()->create();
    $project->images()->create([
        'name' => 'existing.jpg',
        'path' => 'project-images/existing.jpg',
        'filename' => 'existing.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 1024,
        'order' => 0,
        'is_primary' => true,
        'sizes' => [],
    ]);

    Storage::fake();

    $result = callFileUploadTool([
        'base64' => base64_encode('fake'),
        'project_id' => $project->id,
    ]);
    $data = fileUploadToolData($result);

    expect($result->isError())->toBeFalse();
    expect($data['project_updated'])->toBe('skipped');
    expect($data['path'])->toBeNull();
});

it('returns error when project_id does not exist', function () {
    $result = callFileUploadTool([
        'base64' => base64_encode('fake'),
        'project_id' => 99999,
    ]);

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('Project not found');
});
