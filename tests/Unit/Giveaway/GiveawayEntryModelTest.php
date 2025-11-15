<?php

use App\Models\Giveaway;
use App\Models\GiveawayEntry;

test('it can create an entry', function () {
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
});

test('it belongs to a giveaway', function () {
    $giveaway = Giveaway::factory()->create();
    $entry = GiveawayEntry::factory()->create(['giveaway_id' => $giveaway->id]);

    expect($entry->giveaway)->toBeInstanceOf(Giveaway::class);
    expect($entry->giveaway->id)->toBe($giveaway->id);
});

test('it can mark entry as winner', function () {
    $entry = GiveawayEntry::factory()->create();

    $entry->markAsWinner();

    expect($entry->fresh()->status)->toBe(GiveawayEntry::STATUS_WINNER);
    expect($entry->fresh()->isWinner())->toBeTrue();
});

test('it can mark entry as verified', function () {
    $entry = GiveawayEntry::factory()->create();

    $entry->markAsVerified();

    expect($entry->fresh()->status)->toBe(GiveawayEntry::STATUS_VERIFIED);
    expect($entry->fresh()->isVerified())->toBeTrue();
});

test('it can mark entry as rejected', function () {
    $entry = GiveawayEntry::factory()->create();

    $entry->markAsRejected();

    expect($entry->fresh()->status)->toBe(GiveawayEntry::STATUS_REJECTED);
    expect($entry->fresh()->isRejected())->toBeTrue();
});

test('it can check if entry is winner', function () {
    $winner = GiveawayEntry::factory()->winner()->create();
    $pending = GiveawayEntry::factory()->pending()->create();

    expect($winner->isWinner())->toBeTrue();
    expect($pending->isWinner())->toBeFalse();
});

test('it can check if entry is rejected', function () {
    $rejected = GiveawayEntry::factory()->rejected()->create();
    $pending = GiveawayEntry::factory()->pending()->create();

    expect($rejected->isRejected())->toBeTrue();
    expect($pending->isRejected())->toBeFalse();
});

test('it can check if entry is verified', function () {
    $verified = GiveawayEntry::factory()->verified()->create();
    $pending = GiveawayEntry::factory()->pending()->create();

    expect($verified->isVerified())->toBeTrue();
    expect($pending->isVerified())->toBeFalse();
});

test('it scopes winners correctly', function () {
    GiveawayEntry::factory()->winner()->count(2)->create();
    GiveawayEntry::factory()->pending()->create();
    GiveawayEntry::factory()->rejected()->create();

    $winners = GiveawayEntry::winners()->get();

    expect($winners)->toHaveCount(2);
    foreach ($winners as $winner) {
        expect($winner->status)->toBe(GiveawayEntry::STATUS_WINNER);
    }
});

test('it scopes verified correctly', function () {
    GiveawayEntry::factory()->verified()->count(3)->create();
    GiveawayEntry::factory()->pending()->create();

    $verified = GiveawayEntry::verified()->get();

    expect($verified)->toHaveCount(3);
});

test('it scopes pending correctly', function () {
    GiveawayEntry::factory()->pending()->count(4)->create();
    GiveawayEntry::factory()->verified()->create();

    $pending = GiveawayEntry::pending()->get();

    expect($pending)->toHaveCount(4);
});

test('it scopes rejected correctly', function () {
    GiveawayEntry::factory()->rejected()->count(2)->create();
    GiveawayEntry::factory()->pending()->create();

    $rejected = GiveawayEntry::rejected()->get();

    expect($rejected)->toHaveCount(2);
});

test('it scopes eligible entries correctly', function () {
    // Eligible: pending and verified
    GiveawayEntry::factory()->pending()->count(3)->create();
    GiveawayEntry::factory()->verified()->count(2)->create();

    // Not eligible: winners and rejected
    GiveawayEntry::factory()->winner()->create();
    GiveawayEntry::factory()->rejected()->create();

    $eligible = GiveawayEntry::eligible()->get();

    // Should only return pending + verified = 5
    expect($eligible)->toHaveCount(5);
    foreach ($eligible as $entry) {
        expect($entry->status)->toBeIn([
            GiveawayEntry::STATUS_PENDING,
            GiveawayEntry::STATUS_VERIFIED,
        ]);
    }
});

test('it excludes rejected entries from eligible scope', function () {
    $giveaway = Giveaway::factory()->create();

    // Create eligible and rejected entries
    GiveawayEntry::factory()->pending()->create(['giveaway_id' => $giveaway->id]);
    GiveawayEntry::factory()->verified()->create(['giveaway_id' => $giveaway->id]);
    $rejectedEntry = GiveawayEntry::factory()->rejected()->create(['giveaway_id' => $giveaway->id]);

    $eligible = $giveaway->entries()->eligible()->get();

    expect($eligible)->toHaveCount(2);
    expect($eligible->contains('id', $rejectedEntry->id))->toBeFalse();
});
