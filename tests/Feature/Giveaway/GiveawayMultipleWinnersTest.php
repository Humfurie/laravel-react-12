<?php

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Illuminate\Support\Facades\Artisan;

test('it can create giveaway with multiple winners setting', function () {
    $giveaway = Giveaway::factory()->create([
        'number_of_winners' => 5,
    ]);

    expect($giveaway->number_of_winners)->toBe(5);
});

test('it defaults to 1 winner if not specified', function () {
    $giveaway = Giveaway::factory()->create();

    expect($giveaway->number_of_winners)->toBe(1);
});

test('it can select multiple winners', function () {
    $giveaway = Giveaway::factory()->create([
        'number_of_winners' => 3,
        'status' => Giveaway::STATUS_ACTIVE,
    ]);

    // Create 10 entries
    GiveawayEntry::factory(10)->create([
        'giveaway_id' => $giveaway->id,
        'status' => GiveawayEntry::STATUS_PENDING,
    ]);

    // Select winners
    $giveaway->selectWinner();
    $giveaway->refresh();

    // Should have 3 winners
    expect($giveaway->winners()->count())->toBe(3);

    // All should have winner status
    expect($giveaway->winners->every(fn($entry) => $entry->status === 'winner'))->toBeTrue();

    // Giveaway should be ended
    expect($giveaway->status)->toBe(Giveaway::STATUS_ENDED);
});

test('it selects all entries if number_of_winners exceeds entries', function () {
    $giveaway = Giveaway::factory()->create([
        'number_of_winners' => 10,
        'status' => Giveaway::STATUS_ACTIVE,
    ]);

    // Create only 5 entries
    GiveawayEntry::factory(5)->create([
        'giveaway_id' => $giveaway->id,
        'status' => GiveawayEntry::STATUS_PENDING,
    ]);

    $giveaway->selectWinner();
    $giveaway->refresh();

    // Should have 5 winners (all entries)
    expect($giveaway->winners()->count())->toBe(5);
});

test('it does not select rejected entries as winners', function () {
    $giveaway = Giveaway::factory()->create([
        'number_of_winners' => 3,
        'status' => Giveaway::STATUS_ACTIVE,
    ]);

    // Create 3 pending entries and 2 rejected
    GiveawayEntry::factory(3)->create([
        'giveaway_id' => $giveaway->id,
        'status' => GiveawayEntry::STATUS_PENDING,
    ]);

    $rejectedEntries = GiveawayEntry::factory(2)->create([
        'giveaway_id' => $giveaway->id,
        'status' => GiveawayEntry::STATUS_REJECTED,
    ]);

    $giveaway->selectWinner();
    $giveaway->refresh();

    // Should have 3 winners (none of them rejected)
    expect($giveaway->winners()->count())->toBe(3);

    $winnerIds = $giveaway->winners->pluck('id');
    foreach ($rejectedEntries as $rejected) {
        expect($winnerIds->contains($rejected->id))->toBeFalse();
    }
});

test('it does not select duplicate winners', function () {
    $giveaway = Giveaway::factory()->create([
        'number_of_winners' => 5,
        'status' => Giveaway::STATUS_ACTIVE,
    ]);

    GiveawayEntry::factory(10)->create([
        'giveaway_id' => $giveaway->id,
        'status' => GiveawayEntry::STATUS_PENDING,
    ]);

    $giveaway->selectWinner();
    $giveaway->refresh();

    $winnerIds = $giveaway->winners->pluck('id');

    // All winner IDs should be unique
    expect($winnerIds->unique()->count())->toBe($winnerIds->count());
});

test('scheduled command selects winners for multiple giveaways', function () {
    // Create 2 giveaways that need winners
    $giveaway1 = Giveaway::factory()->create([
        'number_of_winners' => 2,
        'status' => Giveaway::STATUS_ACTIVE,
        'end_date' => now()->subHour(),
    ]);

    $giveaway2 = Giveaway::factory()->create([
        'number_of_winners' => 3,
        'status' => Giveaway::STATUS_ACTIVE,
        'end_date' => now()->subHour(),
    ]);

    // Create entries for each
    GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway1->id]);
    GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway2->id]);

    // Run the command
    Artisan::call('giveaways:select-winners');

    // Check both have winners
    $giveaway1->refresh();
    $giveaway2->refresh();

    expect($giveaway1->winners()->count())->toBe(2);
    expect($giveaway2->winners()->count())->toBe(3);
});

test('scheduled command does not select winners for giveaway with all winners already selected', function () {
    $giveaway = Giveaway::factory()->create([
        'number_of_winners' => 2,
        'status' => Giveaway::STATUS_ENDED,
        'end_date' => now()->subHour(),
    ]);

    // Create 2 winners already
    GiveawayEntry::factory(2)->create([
        'giveaway_id' => $giveaway->id,
        'status' => 'winner',
    ]);

    // Create additional pending entries
    GiveawayEntry::factory(3)->create([
        'giveaway_id' => $giveaway->id,
        'status' => GiveawayEntry::STATUS_PENDING,
    ]);

    Artisan::call('giveaways:select-winners');

    $giveaway->refresh();

    // Should still have exactly 2 winners (no new ones)
    expect($giveaway->winners()->count())->toBe(2);
});

test('giveaway status updates to ended when end date passes', function () {
    $giveaway = Giveaway::factory()->create([
        'status' => Giveaway::STATUS_ACTIVE,
        'end_date' => now()->subHour(),
    ]);

    Artisan::call('giveaways:update-statuses');

    $giveaway->refresh();

    expect($giveaway->status)->toBe(Giveaway::STATUS_ENDED);
});

test('winners relationship returns only entries with winner status', function () {
    $giveaway = Giveaway::factory()->create();

    // Create various statuses
    GiveawayEntry::factory()->create([
        'giveaway_id' => $giveaway->id,
        'status' => 'winner',
    ]);

    GiveawayEntry::factory()->create([
        'giveaway_id' => $giveaway->id,
        'status' => 'winner',
    ]);

    GiveawayEntry::factory()->create([
        'giveaway_id' => $giveaway->id,
        'status' => GiveawayEntry::STATUS_PENDING,
    ]);

    expect($giveaway->winners()->count())->toBe(2);
    expect($giveaway->entries()->count())->toBe(3);
});

test('api returns winners array for giveaway', function () {
    $giveaway = Giveaway::factory()->active()->create([
        'number_of_winners' => 3,
    ]);

    $winners = GiveawayEntry::factory(3)->create([
        'giveaway_id' => $giveaway->id,
        'status' => 'winner',
    ]);

    $response = $this->getJson("/api/v1/giveaways/{$giveaway->slug}");

    $response->assertOk()
        ->assertJsonCount(3, 'data.winners')
        ->assertJsonPath('data.winners_count', 3)
        ->assertJsonPath('data.number_of_winners', 3);
});

test('api winners endpoint returns all winners for completed giveaways', function () {
    $giveaway = Giveaway::factory()->ended()->create([
        'number_of_winners' => 2,
    ]);

    GiveawayEntry::factory(2)->create([
        'giveaway_id' => $giveaway->id,
        'status' => 'winner',
    ]);

    // Update winner_id to make it appear in winners endpoint
    $giveaway->update(['winner_id' => $giveaway->entries()->first()->id]);

    $response = $this->getJson('/api/v1/giveaways/winners');

    $response->assertOk()
        ->assertJsonPath('data.0.winners_count', 2)
        ->assertJsonCount(2, 'data.0.winners');
});
