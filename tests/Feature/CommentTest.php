<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Models\Comment;
use App\Models\CommentReport;
use App\Models\Giveaway;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Blog $blog;

    /** @test */
    public function authenticated_user_can_create_comment()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/blogs/{$this->blog->id}/comments", [
                'content' => 'This is a test comment',
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'comment' => ['id', 'content', 'user_id'],
        ]);

        $this->assertDatabaseHas('comments', [
            'user_id' => $this->user->id,
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
            'content' => 'This is a test comment',
            'status' => 'approved',
        ]);
    }

    /** @test */
    public function guest_cannot_create_comment()
    {
        $response = $this->postJson("/blogs/{$this->blog->id}/comments", [
            'content' => 'Guest comment',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function comment_content_strips_all_html_tags()
    {
        $maliciousContent = 'Safe text <script>alert("XSS")</script> <a href="javascript:alert()">click</a>';

        $response = $this->actingAs($this->user)
            ->postJson("/blogs/{$this->blog->id}/comments", [
                'content' => $maliciousContent,
            ]);

        $response->assertStatus(201);

        // Verify HTML tags are stripped
        $comment = Comment::first();
        $this->assertEquals('Safe text alert("XSS") click', $comment->content);
        $this->assertStringNotContainsString('<script>', $comment->content);
        $this->assertStringNotContainsString('<a', $comment->content);
    }

    /** @test */
    public function user_can_create_nested_reply()
    {
        $parentComment = Comment::factory()->create([
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
            'parent_id' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/blogs/{$this->blog->id}/comments", [
                'content' => 'This is a reply',
                'parent_id' => $parentComment->id,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('comments', [
            'parent_id' => $parentComment->id,
            'content' => 'This is a reply',
        ]);
    }

    /** @test */
    public function comment_nesting_depth_is_limited_to_three_levels()
    {
        // Create comment hierarchy: root -> reply -> reply
        $level1 = Comment::factory()->create([
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
            'parent_id' => null,
        ]);

        $level2 = Comment::factory()->create([
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
            'parent_id' => $level1->id,
        ]);

        $level3 = Comment::factory()->create([
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
            'parent_id' => $level2->id,
        ]);

        // Trying to create a 4th level should fail
        $response = $this->actingAs($this->user)
            ->postJson("/blogs/{$this->blog->id}/comments", [
                'content' => 'Too deep',
                'parent_id' => $level3->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('parent_id');
        $this->assertStringContainsString('cannot be nested more than 3 levels deep', $response->json('errors.parent_id.0'));
    }

    /** @test */
    public function cannot_reply_to_deleted_comment()
    {
        $deletedComment = Comment::factory()->create([
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
        ]);
        $deletedComment->delete();

        $response = $this->actingAs($this->user)
            ->postJson("/blogs/{$this->blog->id}/comments", [
                'content' => 'Reply to deleted',
                'parent_id' => $deletedComment->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('parent_id');
    }

    /** @test */
    public function user_can_update_own_comment()
    {
        $comment = Comment::factory()->create([
            'user_id' => $this->user->id,
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
            'content' => 'Original content',
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/comments/{$comment->id}", [
                'content' => 'Updated content',
            ]);

        $response->assertStatus(200);

        $comment->refresh();
        $this->assertEquals('Updated content', $comment->content);
        $this->assertTrue($comment->is_edited);
        $this->assertNotNull($comment->edited_at);
    }

    /** @test */
    public function user_cannot_update_others_comment()
    {
        $otherUser = User::factory()->create();
        $comment = Comment::factory()->create([
            'user_id' => $otherUser->id,
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/comments/{$comment->id}", [
                'content' => 'Hacked content',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_delete_own_comment()
    {
        $comment = Comment::factory()->create([
            'user_id' => $this->user->id,
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/comments/{$comment->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
    }

    /** @test */
    public function user_cannot_delete_others_comment()
    {
        $otherUser = User::factory()->create();
        $comment = Comment::factory()->create([
            'user_id' => $otherUser->id,
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/comments/{$comment->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_report_comment()
    {
        $comment = Comment::factory()->create([
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/comments/{$comment->id}/report", [
                'reason' => 'spam',
                'description' => 'This is spam content',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('comment_reports', [
            'comment_id' => $comment->id,
            'reported_by' => $this->user->id,
            'reason' => 'spam',
            'description' => 'This is spam content',
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function user_cannot_report_same_comment_twice()
    {
        $comment = Comment::factory()->create([
            'commentable_type' => Blog::class,
            'commentable_id' => $this->blog->id,
        ]);

        CommentReport::create([
            'comment_id' => $comment->id,
            'reported_by' => $this->user->id,
            'reason' => 'spam',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/comments/{$comment->id}/report", [
                'reason' => 'harassment',
                'description' => 'Another report',
            ]);

        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'You have already reported this comment.',
        ]);
    }

    /** @test */
    public function comment_validates_minimum_length()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/blogs/{$this->blog->id}/comments", [
                'content' => 'ab', // Only 2 characters
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('content');
    }

    /** @test */
    public function comment_validates_maximum_length()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/blogs/{$this->blog->id}/comments", [
                'content' => str_repeat('a', 1001), // 1001 characters
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('content');
    }

    /** @test */
    public function comments_work_on_giveaways_too()
    {
        $giveaway = Giveaway::factory()->create(['status' => 'active']);

        $response = $this->actingAs($this->user)
            ->postJson("/giveaways/{$giveaway->id}/comments", [
                'content' => 'Comment on giveaway',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('comments', [
            'commentable_type' => Giveaway::class,
            'commentable_id' => $giveaway->id,
            'content' => 'Comment on giveaway',
        ]);
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->blog = Blog::factory()->create(['status' => 'published']);
    }
}
