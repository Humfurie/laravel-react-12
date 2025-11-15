<?php

use App\Models\Giveaway;
use App\Models\GiveawayEntry;

test('it can create a giveaway', function () {
    $giveaway = Giveaway::factory()->create([
        'title' => 'Test Giveaway',
        'description' => 'Test description',
    ]);

    $this->assertDatabaseHas('giveaways', [
        'title' => 'Test Giveaway',
        'description' => 'Test description',
    ]);
});

test('it automatically generates slug from title', function () {
    $giveaway = Giveaway::factory()->create([
        'title' => 'Amazing iPhone Giveaway',
    ]);

    expect($giveaway->slug)->toBe('amazing-iphone-giveaway');
});

test('it can check if giveaway is active', function () {
    $activeGiveaway = Giveaway::factory()->active()->create();
    $draftGiveaway = Giveaway::factory()->draft()->create();
    $endedGiveaway = Giveaway::factory()->ended()->create();

    expect($activeGiveaway->isActive())->toBeTrue();
    expect($draftGiveaway->isActive())->toBeFalse();
    expect($endedGiveaway->isActive())->toBeFalse();
});

test('it can check if giveaway has ended', function () {
    $activeGiveaway = Giveaway::factory()->active()->create();
    $endedGiveaway = Giveaway::factory()->ended()->create();

    expect($activeGiveaway->hasEnded())->toBeFalse();
    expect($endedGiveaway->hasEnded())->toBeTrue();
});

test('it can check if giveaway can accept entries', function () {
    $activeGiveaway = Giveaway::factory()->active()->create();
    $endedGiveaway = Giveaway::factory()->ended()->create();
    $upcomingGiveaway = Giveaway::factory()->upcoming()->create();

    expect($activeGiveaway->canAcceptEntries())->toBeTrue();
    expect($endedGiveaway->canAcceptEntries())->toBeFalse();
    expect($upcomingGiveaway->canAcceptEntries())->toBeFalse();
});

test('it has many entries', function () {
    $giveaway = Giveaway::factory()->create();
    GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);

    expect($giveaway->entries)->toHaveCount(5);
});

test('it can select a random winner', function () {
    $giveaway = Giveaway::factory()->active()->create();
    GiveawayEntry::factory(10)->create(['giveaway_id' => $giveaway->id]);

    $winner = $giveaway->selectWinner();

    expect($winner)->not->toBeNull();
    expect($winner->status)->toBe(GiveawayEntry::STATUS_WINNER);
    expect($giveaway->fresh()->winner_id)->toBe($winner->id);
    expect($giveaway->fresh()->status)->toBe(Giveaway::STATUS_ENDED);
});

test('it does not select rejected entries as winner', function () {
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
    expect($winner)->not->toBeNull();
    expect($eligibleEntries->pluck('id')->contains($winner->id))->toBeTrue();
    expect($winner->status)->toBe(GiveawayEntry::STATUS_WINNER);
});

test('it can reject winner and select new one', function () {
    $giveaway = Giveaway::factory()->active()->create();
    GiveawayEntry::factory(10)->create(['giveaway_id' => $giveaway->id]);

    // Select first winner
    $firstWinner = $giveaway->selectWinner();
    $firstWinnerId = $firstWinner->id;

    // Reject first winner and select new one
    $newWinner = $giveaway->fresh()->rejectWinner('Did not respond');

    expect($newWinner)->not->toBeNull();
    expect($newWinner->id)->not->toBe($firstWinnerId);
    expect($firstWinner->fresh()->status)->toBe(GiveawayEntry::STATUS_REJECTED);
    expect($newWinner->status)->toBe(GiveawayEntry::STATUS_WINNER);
});

test('it can mark prize as claimed', function () {
    $giveaway = Giveaway::factory()->withWinner()->create();

    expect($giveaway->prize_claimed)->toBeFalse();
    expect($giveaway->prize_claimed_at)->toBeNull();

    $giveaway->markPrizeAsClaimed();

    expect($giveaway->fresh()->prize_claimed)->toBeTrue();
    expect($giveaway->fresh()->prize_claimed_at)->not->toBeNull();
});

test('it updates status to ended when end date passes', function () {
    $giveaway = Giveaway::factory()->create([
        'status' => Giveaway::STATUS_ACTIVE,
        'start_date' => now()->subWeek(),
        'end_date' => now()->subDay(),
    ]);

    $giveaway->updateStatusIfNeeded();

    expect($giveaway->fresh()->status)->toBe(Giveaway::STATUS_ENDED);
});

test('it updates status to draft when start date is future', function () {
    $giveaway = Giveaway::factory()->create([
        'status' => Giveaway::STATUS_ACTIVE,
        'start_date' => now()->addWeek(),
        'end_date' => now()->addMonth(),
    ]);

    $giveaway->updateStatusIfNeeded();

    expect($giveaway->fresh()->status)->toBe(Giveaway::STATUS_DRAFT);
});

test('it scopes active giveaways correctly', function () {
    Giveaway::factory()->active()->create();
    Giveaway::factory()->draft()->create();
    Giveaway::factory()->ended()->create();

    $activeGiveaways = Giveaway::active()->get();

    expect($activeGiveaways)->toHaveCount(1);
});

test('it scopes ended giveaways correctly', function () {
    Giveaway::factory()->active()->create();
    Giveaway::factory()->ended()->count(2)->create();

    $endedGiveaways = Giveaway::ended()->get();

    expect($endedGiveaways)->toHaveCount(2);
});

test('it scopes draft giveaways correctly', function () {
    Giveaway::factory()->active()->create();
    Giveaway::factory()->draft()->count(3)->create();

    $draftGiveaways = Giveaway::draft()->get();

    expect($draftGiveaways)->toHaveCount(3);
});

test('it returns null when no eligible entries for winner selection', function () {
    $giveaway = Giveaway::factory()->active()->create();

    // Only create rejected entries
    GiveawayEntry::factory(5)
        ->rejected()
        ->create(['giveaway_id' => $giveaway->id]);

    $winner = $giveaway->selectWinner();

    expect($winner)->toBeNull();
    expect($giveaway->fresh()->winner_id)->toBeNull();
});

test('it does not select new winner if winner already exists', function () {
    $giveaway = Giveaway::factory()->withWinner()->create();
    $originalWinnerId = $giveaway->winner_id;

    // Try to select winner again
    $winner = $giveaway->selectWinner();

    // Should return existing winner
    expect($winner->id)->toBe($originalWinnerId);
    expect($giveaway->fresh()->winner_id)->toBe($originalWinnerId);
});
