<?php

namespace Tests\Feature\Giveaway;

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use App\Models\User;
use DB;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GiveawayControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;

    /** @test */
    public function it_can_list_active_giveaways(): void
    {
        Giveaway::factory()->active()->count(3)->create();
        Giveaway::factory()->draft()->create(); // Should not appear
        Giveaway::factory()->ended()->create(); // Should not appear

        $response = $this->get(route('giveaways.index'));

        $response->assertOk();
        // Inertia responses contain giveaways in props
        $this->assertEquals(3, count($response->viewData('page')['props']['giveaways']));
    }

    /** @test */
    public function it_can_show_active_giveaway(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        $response = $this->get(route('giveaways.show', $giveaway));

        $response->assertOk();
    }

    /** @test */
    public function it_cannot_show_draft_giveaway_to_public(): void
    {
        $giveaway = Giveaway::factory()->draft()->create();

        $response = $this->get(route('giveaways.show', $giveaway));

        $response->assertNotFound();
    }

    /** @test */
    public function it_can_show_ended_giveaway(): void
    {
        $giveaway = Giveaway::factory()->ended()->create();

        $response = $this->get(route('giveaways.show', $giveaway));

        $response->assertOk();
    }

    /** @test */
    public function it_can_list_giveaways_with_winners(): void
    {
        Giveaway::factory()->withWinner()->count(2)->create();
        Giveaway::factory()->active()->create(); // No winner

        $response = $this->get(route('giveaways.winners'));

        $response->assertOk();
        $this->assertEquals(2, count($response->viewData('page')['props']['giveaways']));
    }

    /** @test */
    public function it_can_show_entries_list(): void
    {
        $giveaway = Giveaway::factory()->active()->create();
        GiveawayEntry::factory(10)->create(['giveaway_id' => $giveaway->id]);

        $response = $this->get(route('giveaways.entries', $giveaway));

        $response->assertOk();
        $this->assertEquals(10, count($response->viewData('page')['props']['entries']));
    }

    /** @test */
    public function it_excludes_rejected_entries_from_public_view(): void
    {
        $giveaway = Giveaway::factory()->active()->create();
        GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);
        GiveawayEntry::factory(3)->rejected()->create(['giveaway_id' => $giveaway->id]);

        $response = $this->get(route('giveaways.entries', $giveaway));

        $response->assertOk();
        // Should only show 5 eligible entries, not the 3 rejected ones
        $this->assertEquals(5, count($response->viewData('page')['props']['entries']));
    }

    /** @test */
    public function admin_can_activate_draft_giveaway(): void
    {
        $giveaway = Giveaway::factory()->draft()->create();

        $response = $this->actingAs($this->admin)
            ->post(route('giveaways.activate', $giveaway));

        $response->assertRedirect(route('giveaways.show', $giveaway));
        $this->assertEquals(Giveaway::STATUS_ACTIVE, $giveaway->fresh()->status);
    }

    /** @test */
    public function regular_user_cannot_activate_giveaway(): void
    {
        $giveaway = Giveaway::factory()->draft()->create();

        $response = $this->actingAs($this->regularUser)
            ->post(route('giveaways.activate', $giveaway));

        $response->assertForbidden();
    }

    /** @test */
    public function guest_cannot_activate_giveaway(): void
    {
        $giveaway = Giveaway::factory()->draft()->create();

        $response = $this->post(route('giveaways.activate', $giveaway));

        $response->assertForbidden();
    }

    /** @test */
    public function admin_can_select_winner(): void
    {
        $giveaway = Giveaway::factory()->active()->create();
        GiveawayEntry::factory(10)->create(['giveaway_id' => $giveaway->id]);

        $response = $this->actingAs($this->admin)
            ->post(route('giveaways.pick-winner', $giveaway));

        $response->assertRedirect();
        $this->assertNotNull($giveaway->fresh()->winner_id);
    }

    /** @test */
    public function it_prevents_selecting_winner_twice(): void
    {
        $giveaway = Giveaway::factory()->withWinner()->create();
        $originalWinnerId = $giveaway->winner_id;

        $response = $this->actingAs($this->admin)
            ->post(route('giveaways.pick-winner', $giveaway));

        $response->assertRedirect();
        // Winner should not change
        $this->assertEquals($originalWinnerId, $giveaway->fresh()->winner_id);
    }

    /** @test */
    public function it_prevents_selecting_winner_without_entries(): void
    {
        $giveaway = Giveaway::factory()->active()->create();
        // No entries created

        $response = $this->actingAs($this->admin)
            ->post(route('giveaways.pick-winner', $giveaway));

        $response->assertRedirect();
        $this->assertNull($giveaway->fresh()->winner_id);
    }

    /** @test */
    public function it_updates_giveaway_status_when_showing(): void
    {
        // Create giveaway that ended yesterday but status is still active
        $giveaway = Giveaway::factory()->create([
            'status' => Giveaway::STATUS_ACTIVE,
            'start_date' => now()->subWeek(),
            'end_date' => now()->subDay(),
        ]);

        $this->get(route('giveaways.show', $giveaway));

        // Status should be updated to ended
        $this->assertEquals(Giveaway::STATUS_ENDED, $giveaway->fresh()->status);
    }

    /** @test */
    public function it_shows_can_start_giveaway_flag_for_admin(): void
    {
        $giveaway = Giveaway::factory()->active()->create();
        GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('giveaways.show', $giveaway));

        $response->assertOk();
        $props = $response->viewData('page')['props'];

        // Admin should be able to start giveaway
        $this->assertTrue($props['giveaway']['can_start_giveaway']);
    }

    /** @test */
    public function it_hides_can_start_giveaway_when_no_entries(): void
    {
        $giveaway = Giveaway::factory()->active()->create();
        // No entries

        $response = $this->actingAs($this->admin)
            ->get(route('giveaways.show', $giveaway));

        $response->assertOk();
        $props = $response->viewData('page')['props'];

        $this->assertFalse($props['giveaway']['can_start_giveaway']);
    }

    /** @test */
    public function it_hides_can_start_giveaway_when_giveaway_not_started(): void
    {
        $giveaway = Giveaway::factory()->upcoming()->create();
        GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('giveaways.show', $giveaway));

        $response->assertOk();
        $props = $response->viewData('page')['props'];

        $this->assertFalse($props['giveaway']['can_start_giveaway']);
    }

    /** @test */
    public function it_shows_winner_information_when_selected(): void
    {
        $giveaway = Giveaway::factory()->withWinner()->create();

        $response = $this->get(route('giveaways.show', $giveaway));

        $response->assertOk();
        $props = $response->viewData('page')['props'];

        $this->assertNotNull($props['giveaway']['winner']);
        $this->assertEquals($giveaway->winner->name, $props['giveaway']['winner']['name']);
    }

    /** @test */
    public function it_includes_eligible_entry_names_in_show_page(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        // Create eligible entries
        GiveawayEntry::factory()->create([
            'giveaway_id' => $giveaway->id,
            'name' => 'Juan Dela Cruz',
        ]);
        GiveawayEntry::factory()->create([
            'giveaway_id' => $giveaway->id,
            'name' => 'Maria Santos',
        ]);

        // Create rejected entry (should not appear)
        GiveawayEntry::factory()->rejected()->create([
            'giveaway_id' => $giveaway->id,
            'name' => 'Rejected Person',
        ]);

        $response = $this->get(route('giveaways.show', $giveaway));

        $response->assertOk();
        $props = $response->viewData('page')['props'];

        $entryNames = $props['giveaway']['entry_names'];

        $this->assertCount(2, $entryNames);
        $this->assertContains('Juan Dela Cruz', $entryNames);
        $this->assertContains('Maria Santos', $entryNames);
        $this->assertNotContains('Rejected Person', $entryNames);
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        // Note: User::isAdmin() checks if id === 1
        // We need to ensure this user gets id=1 by creating it first
        // and using a custom factory state that forces id=1

        // Clear any existing users in this test's transaction
        DB::table('users')->delete();

        // Reset auto-increment for PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval('users_id_seq', 1, false)");
        } elseif (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users AUTO_INCREMENT = 1");
        } elseif (DB::getDriverName() === 'sqlite') {
            DB::statement("DELETE FROM sqlite_sequence WHERE name = 'users'");
        }

        // Create admin user (will have id = 1)
        $this->admin = User::factory()->create();

        // Verify admin has id=1
        if ($this->admin->id !== 1) {
            $this->fail('Admin user must have id=1 for isAdmin() to work');
        }

        // Create regular user
        $this->regularUser = User::factory()->create();
    }
}
