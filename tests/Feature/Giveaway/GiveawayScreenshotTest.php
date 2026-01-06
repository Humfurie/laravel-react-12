<?php

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('minio');
});

test('it requires screenshot when submitting entry', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan',
        // Missing screenshot
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['screenshot']);
});

test('it accepts valid screenshot image', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $screenshot = UploadedFile::fake()->image('screenshot.jpg', 1000, 800);

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan',
        'screenshot' => $screenshot,
    ]);

    $response->assertStatus(201);

    // Screenshot should be stored in MinIO
    $entry = GiveawayEntry::first();
    expect($entry->screenshot_path)->not->toBeNull();

    Storage::disk('minio')->assertExists($entry->screenshot_path);
});

test('it stores screenshot in correct path format', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $screenshot = UploadedFile::fake()->image('screenshot.png');

    $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan',
        'screenshot' => $screenshot,
    ]);

    $entry = GiveawayEntry::first();

    // Path should start with screenshots/
    expect($entry->screenshot_path)->toStartWith('screenshots/');

    // Should include giveaway ID in the filename
    expect($entry->screenshot_path)->toContain("giveaway_{$giveaway->id}");
});

test('it validates screenshot file type', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $invalidFile = UploadedFile::fake()->create('document.pdf', 1000);

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan',
        'screenshot' => $invalidFile,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['screenshot']);
});

test('it validates screenshot file size', function () {
    $giveaway = Giveaway::factory()->active()->create();

    // Create a file larger than 5MB (5120 KB)
    $largeFile = UploadedFile::fake()->image('large.jpg')->size(6000);

    $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan',
        'screenshot' => $largeFile,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['screenshot']);
});

test('it accepts jpg, jpeg, and png screenshots', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $formats = ['jpg', 'jpeg', 'png'];
    $phoneNumbers = ['+639123456780', '+639123456781', '+639123456782'];

    foreach ($formats as $index => $format) {
        $screenshot = UploadedFile::fake()->image("screenshot.{$format}");

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
            'name' => "User {$format}",
            'phone' => $phoneNumbers[$index],
            'facebook_url' => "https://facebook.com/user.{$format}",
            'screenshot' => $screenshot,
        ]);

        $response->assertStatus(201);
    }

    expect(GiveawayEntry::count())->toBe(3);
});

test('screenshot path is stored in database', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $screenshot = UploadedFile::fake()->image('screenshot.jpg');

    $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => '09123456789',
        'facebook_url' => 'https://facebook.com/juan',
        'screenshot' => $screenshot,
    ]);

    $this->assertDatabaseHas('giveaway_entries', [
        'giveaway_id' => $giveaway->id,
        'name' => 'Juan Dela Cruz',
    ]);

    $entry = GiveawayEntry::first();
    expect($entry->screenshot_path)->not->toBeNull();
    expect($entry->screenshot_path)->toBeString();
});

test('different users can upload screenshots with same filename', function () {
    $giveaway = Giveaway::factory()->active()->create();

    // Two users uploading files with the same name
    $screenshot1 = UploadedFile::fake()->image('screenshot.jpg');
    $screenshot2 = UploadedFile::fake()->image('screenshot.jpg');

    $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'User One',
        'phone' => '09111111111',
        'facebook_url' => 'https://facebook.com/user1',
        'screenshot' => $screenshot1,
    ]);

    $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'User Two',
        'phone' => '09222222222',
        'facebook_url' => 'https://facebook.com/user2',
        'screenshot' => $screenshot2,
    ]);

    $entries = GiveawayEntry::all();

    // Both screenshots should be stored with different paths
    expect($entries[0]->screenshot_path)->not->toBe($entries[1]->screenshot_path);

    Storage::disk('minio')->assertExists($entries[0]->screenshot_path);
    Storage::disk('minio')->assertExists($entries[1]->screenshot_path);
});

test('screenshot uses phone hash in filename for privacy', function () {
    $giveaway = Giveaway::factory()->active()->create();

    $phone = '09123456789';
    $screenshot = UploadedFile::fake()->image('screenshot.jpg');

    $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
        'name' => 'Juan Dela Cruz',
        'phone' => $phone,
        'facebook_url' => 'https://facebook.com/juan',
        'screenshot' => $screenshot,
    ]);

    $entry = GiveawayEntry::first();

    // Phone should be normalized
    $normalizedPhone = '+639123456789';
    $phoneHash = md5($normalizedPhone);

    // Filename should contain phone hash
    expect($entry->screenshot_path)->toContain($phoneHash);
});
