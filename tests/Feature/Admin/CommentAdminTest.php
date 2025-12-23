<?php

namespace Tests\Feature\Admin;

use App\Models\Comment;
use App\Models\CommentReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class CommentAdminTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $regularUser;

    /** @test */
    public function admin_can_view_all_comments()
    {
        Comment::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.comments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->component('admin/comments/index')
            ->has('comments.data', 3)
        );
    }

    /** @test */
    public function non_admin_cannot_access_comment_admin()
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('admin.comments.index'));

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_update_any_comment()
    {
        $comment = Comment::factory()->create([
            'user_id' => $this->regularUser->id,
            'content' => 'Original content',
        ]);

        $response = $this->actingAs($this->admin)
            ->put(route('admin.comments.update', $comment), [
                'content' => 'Admin edited content',
            ]);

        $response->assertRedirect();

        $comment->refresh();
        $this->assertEquals('Admin edited content', $comment->content);
        $this->assertTrue($comment->is_edited);
    }

    /** @test */
    public function admin_comment_update_strips_html_tags()
    {
        $comment = Comment::factory()->create();

        $response = $this->actingAs($this->admin)
            ->put(route('admin.comments.update', $comment), [
                'content' => 'Safe <script>alert("XSS")</script> content',
            ]);

        $comment->refresh();
        $this->assertEquals('Safe alert("XSS") content', $comment->content);
        $this->assertStringNotContainsString('<script>', $comment->content);
    }

    /** @test */
    public function admin_can_change_comment_status()
    {
        $comment = Comment::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.comments.update-status', $comment), [
                'status' => 'approved',
            ]);

        $response->assertRedirect();

        $comment->refresh();
        $this->assertEquals('approved', $comment->status);
    }

    /** @test */
    public function admin_can_delete_any_comment()
    {
        $comment = Comment::factory()->create([
            'user_id' => $this->regularUser->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.comments.destroy', $comment));

        $response->assertRedirect();

        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
    }

    /** @test */
    public function admin_can_view_reported_comments()
    {
        $comment = Comment::factory()->create();
        CommentReport::factory()->count(2)->create([
            'comment_id' => $comment->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.comments.reported'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->component('admin/comments/reported')
            ->has('reports.data', 2)
        );
    }

    /** @test */
    public function admin_can_review_and_hide_reported_comment()
    {
        $comment = Comment::factory()->create(['status' => 'approved']);
        $report = CommentReport::factory()->create([
            'comment_id' => $comment->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.comments.review-report', $report), [
                'action' => 'hide',
                'admin_notes' => 'Contains inappropriate content',
            ]);

        $response->assertRedirect();

        $comment->refresh();
        $this->assertEquals('hidden', $comment->status);

        $report->refresh();
        $this->assertEquals('actioned', $report->status);
        $this->assertEquals($this->admin->id, $report->reviewed_by);
        $this->assertNotNull($report->reviewed_at);
    }

    /** @test */
    public function admin_can_review_and_delete_reported_comment()
    {
        $comment = Comment::factory()->create();
        $report = CommentReport::factory()->create([
            'comment_id' => $comment->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.comments.review-report', $report), [
                'action' => 'delete',
                'admin_notes' => 'Severe violation',
            ]);

        $response->assertRedirect();

        $this->assertSoftDeleted('comments', ['id' => $comment->id]);

        $report->refresh();
        $this->assertEquals('actioned', $report->status);
    }

    /** @test */
    public function admin_can_dismiss_report()
    {
        $comment = Comment::factory()->create(['status' => 'approved']);
        $report = CommentReport::factory()->create([
            'comment_id' => $comment->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.comments.review-report', $report), [
                'action' => 'dismiss',
                'admin_notes' => 'False report',
            ]);

        $response->assertRedirect();

        $comment->refresh();
        $this->assertEquals('approved', $comment->status); // Status unchanged

        $report->refresh();
        $this->assertEquals('dismissed', $report->status);
    }

    /** @test */
    public function admin_can_bulk_approve_comments()
    {
        $comments = Comment::factory()->count(3)->create(['status' => 'pending']);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.comments.bulk-approve'), [
                'comment_ids' => $comments->pluck('id')->toArray(),
            ]);

        $response->assertRedirect();

        foreach ($comments as $comment) {
            $comment->refresh();
            $this->assertEquals('approved', $comment->status);
        }
    }

    /** @test */
    public function admin_can_bulk_hide_comments()
    {
        $comments = Comment::factory()->count(3)->create(['status' => 'approved']);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.comments.bulk-hide'), [
                'comment_ids' => $comments->pluck('id')->toArray(),
            ]);

        $response->assertRedirect();

        foreach ($comments as $comment) {
            $comment->refresh();
            $this->assertEquals('hidden', $comment->status);
        }
    }

    /** @test */
    public function admin_can_bulk_delete_comments()
    {
        $comments = Comment::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->post(route('admin.comments.bulk-delete'), [
                'comment_ids' => $comments->pluck('id')->toArray(),
            ]);

        $response->assertRedirect();

        foreach ($comments as $comment) {
            $this->assertSoftDeleted('comments', ['id' => $comment->id]);
        }
    }

    /** @test */
    public function non_admin_cannot_perform_bulk_operations()
    {
        $comments = Comment::factory()->count(3)->create();

        $response = $this->actingAs($this->regularUser)
            ->post(route('admin.comments.bulk-approve'), [
                'comment_ids' => $comments->pluck('id')->toArray(),
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_stats_are_calculated_correctly()
    {
        Comment::factory()->count(5)->create(['status' => 'approved']);
        Comment::factory()->count(3)->create(['status' => 'pending']);
        Comment::factory()->count(2)->create(['status' => 'hidden']);

        $comment = Comment::factory()->create(['status' => 'approved']);
        CommentReport::factory()->count(2)->create([
            'comment_id' => $comment->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.comments.index'));

        $response->assertInertia(fn($page) => $page
            ->has('stats')
            ->where('stats.total', 11)
            ->where('stats.approved', 6)
            ->where('stats.pending', 3)
            ->where('stats.hidden', 2)
            ->where('stats.reported', 2)
        );
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure admin user exists with ID = 1 (required for isAdmin() to work)
        if (!User::find(1)) {
            DB::table('users')->insert([
                'id' => 1,
                'name' => 'Admin User',
                'username' => 'admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
                'mobile' => fake()->phoneNumber(),
                'telephone' => fake()->phoneNumber(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Reset sequence for PostgreSQL so next user gets ID=2
            if (DB::getDriverName() === 'pgsql') {
                DB::statement("SELECT setval('users_id_seq', 1, true)");
            } elseif (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE users AUTO_INCREMENT = 2");
            } elseif (DB::getDriverName() === 'sqlite') {
                // SQLite handles this automatically
            }
        }
        $this->admin = User::find(1);

        $this->regularUser = User::factory()->create();
    }
}
