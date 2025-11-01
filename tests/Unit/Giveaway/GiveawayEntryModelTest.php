<?php

namespace Tests\Unit\Giveaway;

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GiveawayEntryModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_an_entry(): void
    {
        $giveaway = Giveaway::factory()->create();
        $entry = GiveawayEntry::factory()->create([
            'giveaway_id' => $giveaway->id,
            'name' => 'Juan Dela Cruz',
            'phone' => '+639123456789',
        ]);

        $this->assertDatabaseHas('giveaway_entries', [
            'name' => 'Juan Dela Cruz',
            'phone' => '+639123456789',
            'giveaway_id' => $giveaway->id,
        ]);
    }

    /** @test */
    public function it_belongs_to_a_giveaway(): void
    {
        $giveaway = Giveaway::factory()->create();
        $entry = GiveawayEntry::factory()->create(['giveaway_id' => $giveaway->id]);

        $this->assertInstanceOf(Giveaway::class, $entry->giveaway);
        $this->assertEquals($giveaway->id, $entry->giveaway->id);
    }

    /** @test */
    public function it_can_mark_entry_as_winner(): void
    {
        $entry = GiveawayEntry::factory()->create();

        $entry->markAsWinner();

        $this->assertEquals(GiveawayEntry::STATUS_WINNER, $entry->fresh()->status);
        $this->assertTrue($entry->fresh()->isWinner());
    }

    /** @test */
    public function it_can_mark_entry_as_verified(): void
    {
        $entry = GiveawayEntry::factory()->create();

        $entry->markAsVerified();

        $this->assertEquals(GiveawayEntry::STATUS_VERIFIED, $entry->fresh()->status);
        $this->assertTrue($entry->fresh()->isVerified());
    }

    /** @test */
    public function it_can_mark_entry_as_rejected(): void
    {
        $entry = GiveawayEntry::factory()->create();

        $entry->markAsRejected();

        $this->assertEquals(GiveawayEntry::STATUS_REJECTED, $entry->fresh()->status);
        $this->assertTrue($entry->fresh()->isRejected());
    }

    /** @test */
    public function it_can_check_if_entry_is_winner(): void
    {
        $winner = GiveawayEntry::factory()->winner()->create();
        $pending = GiveawayEntry::factory()->pending()->create();

        $this->assertTrue($winner->isWinner());
        $this->assertFalse($pending->isWinner());
    }

    /** @test */
    public function it_can_check_if_entry_is_rejected(): void
    {
        $rejected = GiveawayEntry::factory()->rejected()->create();
        $pending = GiveawayEntry::factory()->pending()->create();

        $this->assertTrue($rejected->isRejected());
        $this->assertFalse($pending->isRejected());
    }

    /** @test */
    public function it_can_check_if_entry_is_verified(): void
    {
        $verified = GiveawayEntry::factory()->verified()->create();
        $pending = GiveawayEntry::factory()->pending()->create();

        $this->assertTrue($verified->isVerified());
        $this->assertFalse($pending->isVerified());
    }

    /** @test */
    public function it_scopes_winners_correctly(): void
    {
        GiveawayEntry::factory()->winner()->count(2)->create();
        GiveawayEntry::factory()->pending()->create();
        GiveawayEntry::factory()->rejected()->create();

        $winners = GiveawayEntry::winners()->get();

        $this->assertCount(2, $winners);
        foreach ($winners as $winner) {
            $this->assertEquals(GiveawayEntry::STATUS_WINNER, $winner->status);
        }
    }

    /** @test */
    public function it_scopes_verified_correctly(): void
    {
        GiveawayEntry::factory()->verified()->count(3)->create();
        GiveawayEntry::factory()->pending()->create();

        $verified = GiveawayEntry::verified()->get();

        $this->assertCount(3, $verified);
    }

    /** @test */
    public function it_scopes_pending_correctly(): void
    {
        GiveawayEntry::factory()->pending()->count(4)->create();
        GiveawayEntry::factory()->verified()->create();

        $pending = GiveawayEntry::pending()->get();

        $this->assertCount(4, $pending);
    }

    /** @test */
    public function it_scopes_rejected_correctly(): void
    {
        GiveawayEntry::factory()->rejected()->count(2)->create();
        GiveawayEntry::factory()->pending()->create();

        $rejected = GiveawayEntry::rejected()->get();

        $this->assertCount(2, $rejected);
    }

    /** @test */
    public function it_scopes_eligible_entries_correctly(): void
    {
        // Eligible: pending and verified
        GiveawayEntry::factory()->pending()->count(3)->create();
        GiveawayEntry::factory()->verified()->count(2)->create();

        // Not eligible: winners and rejected
        GiveawayEntry::factory()->winner()->create();
        GiveawayEntry::factory()->rejected()->create();

        $eligible = GiveawayEntry::eligible()->get();

        // Should only return pending + verified = 5
        $this->assertCount(5, $eligible);
        foreach ($eligible as $entry) {
            $this->assertContains($entry->status, [
                GiveawayEntry::STATUS_PENDING,
                GiveawayEntry::STATUS_VERIFIED,
            ]);
        }
    }

    /** @test */
    public function it_excludes_rejected_entries_from_eligible_scope(): void
    {
        $giveaway = Giveaway::factory()->create();

        // Create eligible and rejected entries
        GiveawayEntry::factory()->pending()->create(['giveaway_id' => $giveaway->id]);
        GiveawayEntry::factory()->verified()->create(['giveaway_id' => $giveaway->id]);
        $rejectedEntry = GiveawayEntry::factory()->rejected()->create(['giveaway_id' => $giveaway->id]);

        $eligible = $giveaway->entries()->eligible()->get();

        $this->assertCount(2, $eligible);
        $this->assertFalse($eligible->contains('id', $rejectedEntry->id));
    }
}
