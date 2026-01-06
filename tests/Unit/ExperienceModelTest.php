<?php

use App\Models\Experience;
use App\Models\Image;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('belongs to a user', function () {
    $user = User::factory()->create();
    $experience = Experience::factory()->create(['user_id' => $user->id]);

    expect($experience->user)->toBeInstanceOf(User::class)
        ->and($experience->user->id)->toBe($user->id);
});

test('has a polymorphic image relationship', function () {
    $experience = Experience::factory()->create();
    $image = $experience->image()->create([
        'name' => 'test-image.png',
        'path' => 'experiences/test-image.png',
    ]);

    expect($experience->image)->toBeInstanceOf(Image::class)
        ->and($experience->image->id)->toBe($image->id)
        ->and($image->imageable_id)->toBe($experience->id)
        ->and($image->imageable_type)->toBe(Experience::class);
});

test('casts description to array', function () {
    $description = ['Point 1', 'Point 2', 'Point 3'];
    $experience = Experience::factory()->create(['description' => $description]);

    $experience->refresh();

    expect($experience->description)->toBeArray()
        ->toHaveCount(3)
        ->toBe($description);
});

test('casts is current position to boolean', function () {
    $experience = Experience::factory()->create(['is_current_position' => true]);

    expect($experience->is_current_position)->toBeBool()
        ->toBeTrue();
});

test('has image url attribute', function () {
    $experience = Experience::factory()->create();
    $experience->image()->create([
        'name' => 'company-logo.png',
        'path' => 'experiences/company-logo.png',
    ]);

    $imageUrl = $experience->image_url;

    expect($imageUrl)->not->toBeNull()
        ->toContain('experiences/company-logo.png');
});

test('returns null image url when no image exists', function () {
    $experience = Experience::factory()->create();

    expect($experience->image_url)->toBeNull();
});

test('can scope to current positions', function () {
    Experience::factory()->count(3)->current()->create();
    Experience::factory()->count(2)->ended()->create();

    $currentExperiences = Experience::current()->get();

    expect($currentExperiences)->toHaveCount(3);
    $currentExperiences->each(function ($experience) {
        expect($experience->is_current_position)->toBeTrue();
    });
});

test('can scope to ordered experiences', function () {
    $exp1 = Experience::factory()->create([
        'display_order' => 3,
        'start_year' => 2020,
        'start_month' => 5,
    ]);

    $exp2 = Experience::factory()->create([
        'display_order' => 1,
        'start_year' => 2023,
        'start_month' => 2,
    ]);

    $exp3 = Experience::factory()->create([
        'display_order' => 1,
        'start_year' => 2024,
        'start_month' => 0,
    ]);

    $orderedExperiences = Experience::ordered()->get();

    // Should order by display_order ASC, then by start_year DESC (most recent first within same display_order)
    expect($orderedExperiences->first()->id)->toBe($exp3->id) // Most recent with display_order=1
    ->and($orderedExperiences->last()->id)->toBe($exp1->id); // display_order=3
});

test('soft deletes', function () {
    $experience = Experience::factory()->create();

    $experience->delete();

    $this->assertSoftDeleted('experiences', ['id' => $experience->id]);
    expect($experience->fresh()->deleted_at)->not->toBeNull();
});

test('has fillable attributes', function () {
    $fillable = [
        'user_id',
        'position',
        'company',
        'location',
        'description',
        'start_month',
        'start_year',
        'end_month',
        'end_year',
        'is_current_position',
        'display_order',
    ];

    $experience = new Experience();

    expect($experience->getFillable())->toBe($fillable);
});

test('appends image url to array', function () {
    $experience = Experience::factory()->create();

    $array = $experience->toArray();

    expect($array)->toHaveKey('image_url');
});
