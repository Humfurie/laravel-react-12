<?php

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('it can list active giveaways', function () {
    Giveaway::factory()->active()->count(3)->create();
    Giveaway::factory()->draft()->create(); // Should not appear
    Giveaway::factory()->ended()->create(); // Should not appear

    $response = $this->getJson('/api/v1/giveaways');

    $response->assertOk()
        ->assertJsonCount(3, 'data');
});

test('it can show a giveaway', function () {
    $giveaway = Giveaway::factory()->active()->create([
        'title' => 'iPhone Giveaway',
    ]);

    $response = $this->getJson("/api/v1/giveaways/{$giveaway->slug}");

    $response->assertOk()
        ->assertJson([
            'data' => [
                'title' => 'iPhone Giveaway',
                'slug' => $giveaway->slug,
            ],
        ]);
});

test('it cannot show draft giveaway', function () {
    $giveaway = Giveaway::factory()->draft()->create();

    $response = $this->getJson("/api/v1/giveaways/{$giveaway->slug}");

    $response->assertNotFound();
});

test('it can submit entry to active giveaway', function () {
    Storage::fake('minio');
    $giveaway = Giveaway::factory()->active()->create();

    $entryData = [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan.delacruz',
        'screenshot' => UploadedFile::fake()->image('screenshot.jpg'),
    ];

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", $entryData);

    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
            'message' => 'Your entry has been submitted successfully!',
        ]);

    // Phone should be normalized in database
    $this->assertDatabaseHas('giveaway_entries', [
        'giveaway_id' => $giveaway->id,
        'name' => 'Juan Dela Cruz',
        'phone' => '+639123456789', // Normalized
        'facebook_url' => 'https://facebook.com/juan.delacruz',
    ]);
});

test('it normalizes phone number starting with 09', function () {
    Storage::fake('minio');
    $giveaway = Giveaway::factory()->active()->create();

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Maria Santos',
        'phone' => '09987654321',
        'facebook_url' => 'https://facebook.com/maria',
        'screenshot' => UploadedFile::fake()->image('screenshot.jpg'),
    ]);

    $response->assertStatus(201);

    // Should normalize 09 to +639
    $this->assertDatabaseHas('giveaway_entries', [
        'phone' => '+639987654321',
    ]);
});

test('it accepts phone number already in normalized format', function () {
    Storage::fake('minio');
    $giveaway = Giveaway::factory()->active()->create();

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Pedro Ramos',
        'phone' => '+639111222333',
        'facebook_url' => 'https://facebook.com/pedro',
        'screenshot' => UploadedFile::fake()->image('screenshot.jpg'),
    ]);

    $response->assertStatus(201);

    $this->assertDatabaseHas('giveaway_entries', [
        'phone' => '+639111222333',
    ]);
});

test('it prevents duplicate phone number for same giveaway', function () {
    $giveaway = Giveaway::factory()->active()->create();

    // First entry
    GiveawayEntry::factory()->create([
        'giveaway_id' => $giveaway->id,
        'phone' => '+639123456789',
    ]);

    // Try to submit with same phone
    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Another Person',
        'phone' => '09123456789', // Same number (will be normalized to +639123456789)
        'facebook_url' => 'https://facebook.com/another',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['phone']);
});

test('it allows same phone number for different giveaways', function () {
    Storage::fake('minio');
    $giveaway1 = Giveaway::factory()->active()->create();
    $giveaway2 = Giveaway::factory()->active()->create();

    $phone = '+639123456789';

    // First entry in giveaway 1
    GiveawayEntry::factory()->create([
        'giveaway_id' => $giveaway1->id,
        'phone' => $phone,
    ]);

    // Same phone in giveaway 2 should be allowed
    $response = $this->postJson("/api/v1/giveaways/{$giveaway2->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan',
        'screenshot' => UploadedFile::fake()->image('screenshot.jpg'),
    ]);

    $response->assertStatus(201);
});

test('it validates required fields', function () {
    Storage::fake('minio');
    $giveaway = Giveaway::factory()->active()->create();

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'phone', 'facebook_url', 'screenshot']);
});

test('it validates phone format', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Test User',
        'phone' => 'invalid-phone',
        'facebook_url' => 'https://facebook.com/test',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['phone']);
});

test('it validates facebook url format', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Test User',
        'phone' => '09123456789',
        'facebook_url' => 'not-a-url',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['facebook_url']);
});

test('it cannot submit entry to ended giveaway', function () {
    $giveaway = Giveaway::factory()->ended()->create();

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan',
    ]);

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => 'This giveaway is not currently accepting entries.',
        ]);
});

test('it cannot submit entry to upcoming giveaway', function () {
    $giveaway = Giveaway::factory()->upcoming()->create();

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan',
    ]);

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => 'This giveaway is not currently accepting entries.',
        ]);
});

test('it can check if phone already entered', function () {
    $giveaway = Giveaway::factory()->active()->create();

    GiveawayEntry::factory()->create([
        'giveaway_id' => $giveaway->id,
        'phone' => '+639123456789',
    ]);

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/check-phone", [
        'phone' => '09123456789',
    ]);

    $response->assertOk()
        ->assertJson([
            'exists' => true,
        ]);
});

test('it can check if phone not entered', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/check-phone", [
        'phone' => '09999999999',
    ]);

    $response->assertOk()
        ->assertJson([
            'exists' => false,
        ]);
});

test('it can list giveaways with winners', function () {
    Giveaway::factory()->withWinner()->count(2)->create();
    Giveaway::factory()->active()->create(); // No winner

    $response = $this->getJson('/api/v1/giveaways/winners');

    $response->assertOk()
        ->assertJsonCount(2, 'data');
});

test('it includes entries count in giveaway list', function () {
    $giveaway = Giveaway::factory()->active()->create();
    GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);

    $response = $this->getJson('/api/v1/giveaways');

    $response->assertOk()
        ->assertJsonPath('data.0.entries_count', 5);
});

test('it sets entry status to pending by default', function () {
    Storage::fake('minio');
    $giveaway = Giveaway::factory()->active()->create();

    $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Test User',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/test',
        'screenshot' => UploadedFile::fake()->image('screenshot.jpg'),
    ]);

    $this->assertDatabaseHas('giveaway_entries', [
        'giveaway_id' => $giveaway->id,
        'status' => GiveawayEntry::STATUS_PENDING,
    ]);
});
