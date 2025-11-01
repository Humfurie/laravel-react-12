<?php

namespace Tests\Unit\Giveaway;

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GiveawayModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_giveaway(): void
    {
        $giveaway = Giveaway::factory()->create([
            'title' => 'Test Giveaway',
            'description' => 'Test description',
        ]);

        $this->assertDatabaseHas('giveaways', [
            'title' => 'Test Giveaway',
            'description' => 'Test description',
        ]);
    }

    /** @test */
    public function it_automatically_generates_slug_from_title(): void
    {
        $giveaway = Giveaway::factory()->create([
            'title' => 'Amazing iPhone Giveaway',
        ]);

        $this->assertEquals('amazing-iphone-giveaway', $giveaway->slug);
    }

    /** @test */
    public function it_can_check_if_giveaway_is_active(): void
    {
        $activeGiveaway = Giveaway::factory()->active()->create();
        $draftGiveaway = Giveaway::factory()->draft()->create();
        $endedGiveaway = Giveaway::factory()->ended()->create();

        $this->assertTrue($activeGiveaway->isActive());
        $this->assertFalse($draftGiveaway->isActive());
        $this->assertFalse($endedGiveaway->isActive());
    }

    /** @test */
    public function it_can_check_if_giveaway_has_ended(): void
    {
        $activeGiveaway = Giveaway::factory()->active()->create();
        $endedGiveaway = Giveaway::factory()->ended()->create();

        $this->assertFalse($activeGiveaway->hasEnded());
        $this->assertTrue($endedGiveaway->hasEnded());
    }

    /** @test */
    public function it_can_check_if_giveaway_can_accept_entries(): void
    {
        $activeGiveaway = Giveaway::factory()->active()->create();
        $endedGiveaway = Giveaway::factory()->ended()->create();
        $upcomingGiveaway = Giveaway::factory()->upcoming()->create();

        $this->assertTrue($activeGiveaway->canAcceptEntries());
        $this->assertFalse($endedGiveaway->canAcceptEntries());
        $this->assertFalse($upcomingGiveaway->canAcceptEntries());
    }

    /** @test */
    public function it_has_many_entries(): void
    {
        $giveaway = Giveaway::factory()->create();
        GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);

        $this->assertCount(5, $giveaway->entries);
    }

    /** @test */
    public function it_can_select_a_random_winner(): void
    {
        $giveaway = Giveaway::factory()->active()->create();
        GiveawayEntry::factory(10)->create(['giveaway_id' => $giveaway->id]);

        $winner = $giveaway->selectWinner();

        $this->assertNotNull($winner);
        $this->assertEquals(GiveawayEntry::STATUS_WINNER, $winner->status);
        $this->assertEquals($winner->id, $giveaway->fresh()->winner_id);
        $this->assertEquals(Giveaway::STATUS_ENDED, $giveaway->fresh()->status);
    }

    /** @test */
    public function it_does_not_select_rejected_entries_as_winner(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        // Create 5 eligible entries
        $eligibleEntries = GiveawayEntry::factory(5)
            ->create(['giveaway_id' => $giveaway->id]);

        // Create 5 rejected entries
        GiveawayEntry::factory(5)
            ->rejected()
            ->create(['giveaway_id' => $giveaway->id]);

        $winner = $giveaway->selectWinner();

        // Winner should be one of the eligible entries, not rejected
        $this->assertNotNull($winner);
        $this->assertContains($winner->id, $eligibleEntries->pluck('id'));
        $this->assertEquals(GiveawayEntry::STATUS_WINNER, $winner->status);
    }

    /** @test */
    public function it_can_reject_winner_and_select_new_one(): void
    {
        $giveaway = Giveaway::factory()->active()->create();
        GiveawayEntry::factory(10)->create(['giveaway_id' => $giveaway->id]);

        // Select first winner
        $firstWinner = $giveaway->selectWinner();
        $firstWinnerId = $firstWinner->id;

        // Reject first winner and select new one
        $newWinner = $giveaway->fresh()->rejectWinner('Did not respond');

        $this->assertNotNull($newWinner);
        $this->assertNotEquals($firstWinnerId, $newWinner->id);
        $this->assertEquals(GiveawayEntry::STATUS_REJECTED, $firstWinner->fresh()->status);
        $this->assertEquals(GiveawayEntry::STATUS_WINNER, $newWinner->status);
    }

    /** @test */
    public function it_can_mark_prize_as_claimed(): void
    {
        $giveaway = Giveaway::factory()->withWinner()->create();

        $this->assertFalse($giveaway->prize_claimed);
        $this->assertNull($giveaway->prize_claimed_at);

        $giveaway->markPrizeAsClaimed();

        $this->assertTrue($giveaway->fresh()->prize_claimed);
        $this->assertNotNull($giveaway->fresh()->prize_claimed_at);
    }

    /** @test */
    public function it_updates_status_to_ended_when_end_date_passes(): void
    {
        $giveaway = Giveaway::factory()->create([
            'status' => Giveaway::STATUS_ACTIVE,
            'start_date' => now()->subWeek(),
            'end_date' => now()->subDay(),
        ]);

        $giveaway->updateStatusIfNeeded();

        $this->assertEquals(Giveaway::STATUS_ENDED, $giveaway->fresh()->status);
    }

    /** @test */
    public function it_updates_status_to_draft_when_start_date_is_future(): void
    {
        $giveaway = Giveaway::factory()->create([
            'status' => Giveaway::STATUS_ACTIVE,
            'start_date' => now()->addWeek(),
            'end_date' => now()->addMonth(),
        ]);

        $giveaway->updateStatusIfNeeded();

        $this->assertEquals(Giveaway::STATUS_DRAFT, $giveaway->fresh()->status);
    }

    /** @test */
    public function it_scopes_active_giveaways_correctly(): void
    {
        Giveaway::factory()->active()->create();
        Giveaway::factory()->draft()->create();
        Giveaway::factory()->ended()->create();

        $activeGiveaways = Giveaway::active()->get();

        $this->assertCount(1, $activeGiveaways);
    }

    /** @test */
    public function it_scopes_ended_giveaways_correctly(): void
    {
        Giveaway::factory()->active()->create();
        Giveaway::factory()->ended()->count(2)->create();

        $endedGiveaways = Giveaway::ended()->get();

        $this->assertCount(2, $endedGiveaways);
    }

    /** @test */
    public function it_scopes_draft_giveaways_correctly(): void
    {
        Giveaway::factory()->active()->create();
        Giveaway::factory()->draft()->count(3)->create();

        $draftGiveaways = Giveaway::draft()->get();

        $this->assertCount(3, $draftGiveaways);
    }

    /** @test */
    public function it_returns_null_when_no_eligible_entries_for_winner_selection(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        // Only create rejected entries
        GiveawayEntry::factory(5)
            ->rejected()
            ->create(['giveaway_id' => $giveaway->id]);

        $winner = $giveaway->selectWinner();

        $this->assertNull($winner);
        $this->assertNull($giveaway->fresh()->winner_id);
    }

    /** @test */
    public function it_does_not_select_new_winner_if_winner_already_exists(): void
    {
        $giveaway = Giveaway::factory()->withWinner()->create();
        $originalWinnerId = $giveaway->winner_id;

        // Try to select winner again
        $winner = $giveaway->selectWinner();

        // Should return existing winner
        $this->assertEquals($originalWinnerId, $winner->id);
        $this->assertEquals($originalWinnerId, $giveaway->fresh()->winner_id);
    }
}
