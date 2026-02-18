<?php

use App\Mcp\Tools\Blog\CreateBlog;
use App\Mcp\Tools\Blog\DeleteBlog;
use App\Mcp\Tools\Blog\GetBlog;
use App\Mcp\Tools\Blog\ListBlogs;
use App\Mcp\Tools\Blog\UpdateBlog;
use App\Mcp\Tools\Comment\ListComments;
use App\Mcp\Tools\Comment\ModerateComment;
use App\Mcp\Tools\Dashboard\GetDashboardStats;
use App\Mcp\Tools\Guestbook\ModerateGuestbookEntry;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\GuestbookEntry;
use Illuminate\Support\Facades\Cache;
use Laravel\Mcp\Server\Tools\ToolResult;

/**
 * Extract decoded JSON data from a ToolResult.
 */
function toolResultData(ToolResult $result): array
{
    return json_decode($result->content[0]->text, true);
}

// ─── Blog: ListBlogs ──────────────────────────────────────────────

it('lists blogs with pagination', function () {
    Blog::factory()->published()->count(3)->create();

    $result = (new ListBlogs)->handle([]);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['data'])->toHaveCount(3);
    expect($data['meta']['total'])->toBe(3);
});

it('filters blogs by status', function () {
    Blog::factory()->published()->count(2)->create();
    Blog::factory()->draft()->count(3)->create();

    $result = (new ListBlogs)->handle(['status' => 'draft']);
    $data = toolResultData($result);

    expect($data['data'])->toHaveCount(3);
    expect($data['meta']['total'])->toBe(3);
});

// ─── Blog: GetBlog ────────────────────────────────────────────────

it('gets a blog by ID', function () {
    $blog = Blog::factory()->published()->create(['title' => 'Test Blog']);

    $result = (new GetBlog)->handle(['id' => $blog->id]);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['id'])->toBe($blog->id);
    expect($data['title'])->toBe('Test Blog');
});

it('gets a blog by slug', function () {
    $blog = Blog::factory()->published()->create(['slug' => 'my-test-slug']);

    $result = (new GetBlog)->handle(['slug' => 'my-test-slug']);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['slug'])->toBe('my-test-slug');
});

it('returns error when neither id nor slug is provided for GetBlog', function () {
    $result = (new GetBlog)->handle([]);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Either id or slug is required');
});

it('returns error when blog is not found', function () {
    $result = (new GetBlog)->handle(['id' => 99999]);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Blog not found');
});

// ─── Blog: CreateBlog ─────────────────────────────────────────────

it('creates a blog with valid data', function () {
    $result = (new CreateBlog)->handle([
        'title' => 'New Blog Post',
        'content' => '<p>Test content</p>',
        'status' => 'draft',
    ]);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['message'])->toContain('created successfully');
    expect(Blog::where('title', 'New Blog Post')->exists())->toBeTrue();
});

it('auto-sets published_at for published blogs', function () {
    $result = (new CreateBlog)->handle([
        'title' => 'Published Blog',
        'content' => '<p>Content</p>',
        'status' => 'published',
    ]);

    $blog = Blog::where('title', 'Published Blog')->first();

    expect($blog)->not->toBeNull();
    expect($blog->published_at)->not->toBeNull();
});

it('returns validation errors for invalid blog data', function () {
    $result = (new CreateBlog)->handle([
        'title' => '',
        'content' => '',
        'status' => 'invalid-status',
    ]);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Validation failed');
});

// ─── Blog: UpdateBlog ─────────────────────────────────────────────

it('updates a blog with valid data', function () {
    $blog = Blog::factory()->draft()->create(['title' => 'Old Title']);

    $result = (new UpdateBlog)->handle([
        'id' => $blog->id,
        'title' => 'New Title',
    ]);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['message'])->toContain('updated successfully');
    expect($blog->fresh()->title)->toBe('New Title');
});

it('returns error when updating a non-existent blog', function () {
    $result = (new UpdateBlog)->handle(['id' => 99999, 'title' => 'X']);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Blog not found');
});

// ─── Blog: DeleteBlog ─────────────────────────────────────────────

it('soft-deletes a blog', function () {
    $blog = Blog::factory()->create();

    $result = (new DeleteBlog)->handle(['id' => $blog->id]);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['message'])->toContain('soft-deleted');
    expect($blog->fresh()->trashed())->toBeTrue();
});

it('returns error when deleting a non-existent blog', function () {
    $result = (new DeleteBlog)->handle(['id' => 99999]);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Blog not found');
});

// ─── Comment: ListComments ────────────────────────────────────────

it('lists comments', function () {
    Comment::factory()->count(3)->create();

    $result = (new ListComments)->handle([]);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['data'])->toHaveCount(3);
});

it('filters comments by status', function () {
    Comment::factory()->count(2)->create(['status' => 'approved']);
    Comment::factory()->pending()->count(1)->create();

    $result = (new ListComments)->handle(['status' => 'pending']);
    $data = toolResultData($result);

    expect($data['data'])->toHaveCount(1);
});

it('filters comments by valid commentable_type', function () {
    Comment::factory()->count(2)->create(['commentable_type' => 'App\\Models\\Blog']);

    $result = (new ListComments)->handle(['commentable_type' => 'blog']);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['data'])->toHaveCount(2);
});

it('rejects invalid commentable_type', function () {
    $result = (new ListComments)->handle(['commentable_type' => 'App\\Models\\User']);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Invalid commentable_type');
});

// ─── Comment: ModerateComment ─────────────────────────────────────

it('approves a comment', function () {
    $comment = Comment::factory()->pending()->create();

    $result = (new ModerateComment)->handle(['id' => $comment->id, 'action' => 'approve']);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['status'])->toBe('approved');
    expect($comment->fresh()->status)->toBe('approved');
});

it('hides a comment', function () {
    $comment = Comment::factory()->create(['status' => 'approved']);

    $result = (new ModerateComment)->handle(['id' => $comment->id, 'action' => 'hide']);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['status'])->toBe('hidden');
    expect($comment->fresh()->status)->toBe('hidden');
});

it('soft-deletes a comment', function () {
    $comment = Comment::factory()->create();

    $result = (new ModerateComment)->handle(['id' => $comment->id, 'action' => 'delete']);

    expect($result->isError)->toBeFalse();
    expect($comment->fresh()->trashed())->toBeTrue();
});

it('returns error for invalid moderate comment action', function () {
    $comment = Comment::factory()->create();

    $result = (new ModerateComment)->handle(['id' => $comment->id, 'action' => 'ban']);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Invalid action');
});

it('returns error when moderating a non-existent comment', function () {
    $result = (new ModerateComment)->handle(['id' => 99999, 'action' => 'approve']);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Comment not found');
});

// ─── Guestbook: ModerateGuestbookEntry ────────────────────────────

it('approves a guestbook entry', function () {
    $entry = GuestbookEntry::factory()->unapproved()->create();

    $result = (new ModerateGuestbookEntry)->handle(['id' => $entry->id, 'action' => 'approve']);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['message'])->toContain('approved');
    expect($entry->fresh()->is_approved)->toBeTrue();
});

it('rejects a guestbook entry', function () {
    $entry = GuestbookEntry::factory()->create();

    $result = (new ModerateGuestbookEntry)->handle(['id' => $entry->id, 'action' => 'reject']);

    expect($entry->fresh()->is_approved)->toBeFalse();
});

it('soft-deletes a guestbook entry', function () {
    $entry = GuestbookEntry::factory()->create();

    $result = (new ModerateGuestbookEntry)->handle(['id' => $entry->id, 'action' => 'delete']);

    expect($result->isError)->toBeFalse();
    expect($entry->fresh()->trashed())->toBeTrue();
});

it('returns error for invalid moderate guestbook action', function () {
    $entry = GuestbookEntry::factory()->create();

    $result = (new ModerateGuestbookEntry)->handle(['id' => $entry->id, 'action' => 'spam']);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Invalid action');
});

// ─── Dashboard: GetDashboardStats ─────────────────────────────────

it('returns correct dashboard stats', function () {
    $blogs = Blog::factory()->published()->count(2)->create();
    Blog::factory()->draft()->count(1)->create();

    // Create comments tied to existing blogs to avoid inflating blog count
    $blog = $blogs->first();
    Comment::factory()->count(3)->create([
        'status' => 'approved',
        'commentable_type' => Blog::class,
        'commentable_id' => $blog->id,
    ]);
    Comment::factory()->pending()->count(1)->create([
        'commentable_type' => Blog::class,
        'commentable_id' => $blog->id,
    ]);

    Cache::forget('mcp:dashboard-stats');

    $result = (new GetDashboardStats)->handle([]);
    $data = toolResultData($result);

    expect($result->isError)->toBeFalse();
    expect($data['blogs']['total'])->toBe(3);
    expect($data['blogs']['published'])->toBe(2);
    expect($data['blogs']['drafts'])->toBe(1);
    expect($data['comments']['total'])->toBe(4);
    expect($data['comments']['approved'])->toBe(3);
    expect($data['comments']['pending'])->toBe(1);
});

it('caches dashboard stats', function () {
    Blog::factory()->published()->count(2)->create();

    Cache::forget('mcp:dashboard-stats');

    $result1 = (new GetDashboardStats)->handle([]);
    $data1 = toolResultData($result1);

    // Create more blogs — but cached result shouldn't change
    Blog::factory()->published()->count(3)->create();

    $result2 = (new GetDashboardStats)->handle([]);
    $data2 = toolResultData($result2);

    expect($data1['blogs']['total'])->toBe(2);
    expect($data2['blogs']['total'])->toBe(2); // Still cached
});
