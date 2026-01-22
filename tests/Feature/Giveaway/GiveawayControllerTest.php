<?php

use App\Models\Giveaway;
use App\Models\GiveawayEntry;

// Skip all tests in this file - public giveaway routes have been removed
// These tests were for the web routes that are now commented out in routes/web.php
// Giveaways are now only accessible via admin routes and API
beforeEach(function () {
    $this->markTestSkipped('Public giveaway routes have been removed - giveaways now only via admin/API');
});

test('it can list active giveaways', function () {
    Giveaway::factory()->active()->count(3)->create();
    Giveaway::factory()->draft()->create(); // Should not appear
    Giveaway::factory()->ended()->create(); // Should not appear

    $response = $this->get(route('giveaways.index'));

    $response->assertOk();
    // Inertia responses contain giveaways in props
    expect($response->viewData('page')['props']['giveaways'])->toHaveCount(3);
});

test('it can show active giveaway', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $response = $this->get(route('giveaways.show', $giveaway));

    $response->assertOk();
});

test('it cannot show draft giveaway to public', function () {
    $giveaway = Giveaway::factory()->draft()->create();

    $response = $this->get(route('giveaways.show', $giveaway));

    $response->assertNotFound();
});

test('it can show ended giveaway', function () {
    $giveaway = Giveaway::factory()->ended()->create();

    $response = $this->get(route('giveaways.show', $giveaway));

    $response->assertOk();
});

test('it can list giveaways with winners', function () {
    Giveaway::factory()->withWinner()->count(2)->create();
    Giveaway::factory()->active()->create(); // No winner

    $response = $this->get(route('giveaways.winners'));

    $response->assertOk();
    expect($response->viewData('page')['props']['giveaways'])->toHaveCount(2);
});

test('it can show entries list', function () {
    $giveaway = Giveaway::factory()->active()->create();
    GiveawayEntry::factory(10)->create(['giveaway_id' => $giveaway->id]);

    $response = $this->get(route('giveaways.entries', $giveaway));

    $response->assertOk();
    expect($response->viewData('page')['props']['entries'])->toHaveCount(10);
});

test('it excludes rejected entries from public view', function () {
    $giveaway = Giveaway::factory()->active()->create();
    GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);
    GiveawayEntry::factory(3)->rejected()->create(['giveaway_id' => $giveaway->id]);

    $response = $this->get(route('giveaways.entries', $giveaway));

    $response->assertOk();
    // Should only show 5 eligible entries, not the 3 rejected ones
    expect($response->viewData('page')['props']['entries'])->toHaveCount(5);
});

test('admin can activate draft giveaway', function () {
    $giveaway = Giveaway::factory()->draft()->create();

    $response = $this->actingAs($this->admin)
        ->post(route('giveaways.activate', $giveaway));

    $response->assertRedirect(route('giveaways.show', $giveaway));
    expect($giveaway->fresh()->status)->toBe(Giveaway::STATUS_ACTIVE);
});

test('regular user cannot activate giveaway', function () {
    $giveaway = Giveaway::factory()->draft()->create();

    $response = $this->actingAs($this->regularUser)
        ->post(route('giveaways.activate', $giveaway));

    $response->assertForbidden();
});

test('guest cannot activate giveaway', function () {
    $giveaway = Giveaway::factory()->draft()->create();

    $response = $this->post(route('giveaways.activate', $giveaway));

    $response->assertForbidden();
});

test('admin can select winner', function () {
    $giveaway = Giveaway::factory()->active()->create();
    GiveawayEntry::factory(10)->create(['giveaway_id' => $giveaway->id]);

    $response = $this->actingAs($this->admin)
        ->post(route('giveaways.pick-winner', $giveaway));

    $response->assertRedirect();
    expect($giveaway->fresh()->winner_id)->not->toBeNull();
});

test('it prevents selecting winner twice', function () {
    $giveaway = Giveaway::factory()->withWinner()->create();
    $originalWinnerId = $giveaway->winner_id;

    $response = $this->actingAs($this->admin)
        ->post(route('giveaways.pick-winner', $giveaway));

    $response->assertRedirect();
    // Winner should not change
    expect($giveaway->fresh()->winner_id)->toBe($originalWinnerId);
});

test('it prevents selecting winner without entries', function () {
    $giveaway = Giveaway::factory()->active()->create();
    // No entries created

    $response = $this->actingAs($this->admin)
        ->post(route('giveaways.pick-winner', $giveaway));

    $response->assertRedirect();
    expect($giveaway->fresh()->winner_id)->toBeNull();
});

test('it updates giveaway status when showing', function () {
    // Create giveaway that ended yesterday but status is still active
    $giveaway = Giveaway::factory()->create([
        'status' => Giveaway::STATUS_ACTIVE,
        'start_date' => now()->subWeek(),
        'end_date' => now()->subDay(),
    ]);

    $this->get(route('giveaways.show', $giveaway));

    // Status should be updated to ended
    expect($giveaway->fresh()->status)->toBe(Giveaway::STATUS_ENDED);
});

test('it shows can start giveaway flag for admin', function () {
    $giveaway = Giveaway::factory()->active()->create();
    GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);

    $response = $this->actingAs($this->admin)
        ->get(route('giveaways.show', $giveaway));

    $response->assertOk();
    $props = $response->viewData('page')['props'];

    // Admin should be able to start giveaway
    expect($props['giveaway']['can_start_giveaway'])->toBeTrue();
});

test('it hides can start giveaway when no entries', function () {
    $giveaway = Giveaway::factory()->active()->create();
    // No entries

    $response = $this->actingAs($this->admin)
        ->get(route('giveaways.show', $giveaway));

    $response->assertOk();
    $props = $response->viewData('page')['props'];

    expect($props['giveaway']['can_start_giveaway'])->toBeFalse();
});

test('it hides can start giveaway when giveaway not started', function () {
    $giveaway = Giveaway::factory()->upcoming()->create();
    GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);

    $response = $this->actingAs($this->admin)
        ->get(route('giveaways.show', $giveaway));

    $response->assertOk();
    $props = $response->viewData('page')['props'];

    expect($props['giveaway']['can_start_giveaway'])->toBeFalse();
});

test('it shows winner information when selected', function () {
    $giveaway = Giveaway::factory()->withWinner()->create();

    $response = $this->get(route('giveaways.show', $giveaway));

    $response->assertOk();
    $props = $response->viewData('page')['props'];

    expect($props['giveaway']['winner'])->not->toBeNull();
    expect($props['giveaway']['winner']['name'])->toBe($giveaway->winner->name);
});

test('it includes eligible entry names in show page', function () {
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

    expect($entryNames)->toHaveCount(2);
    expect($entryNames)->toContain('Juan Dela Cruz');
    expect($entryNames)->toContain('Maria Santos');
    expect($entryNames)->not->toContain('Rejected Person');
});
