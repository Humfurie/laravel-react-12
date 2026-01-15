<?php

use App\Models\Experience;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();
});

test('clears homepage.experiences cache when experience is created', function () {
    $user = User::factory()->create();
    Cache::put('homepage.experiences', ['old' => 'data'], 3600);

    Experience::factory()->create(['user_id' => $user->id]);

    expect(Cache::has('homepage.experiences'))->toBeFalse();
});

test('clears homepage.experiences cache when experience is updated', function () {
    $experience = Experience::factory()->create();
    Cache::put('homepage.experiences', ['old' => 'data'], 3600);

    $experience->update(['position' => 'Updated Position']);

    expect(Cache::has('homepage.experiences'))->toBeFalse();
});

test('clears homepage.experiences cache when experience is deleted', function () {
    $experience = Experience::factory()->create();
    Cache::put('homepage.experiences', ['old' => 'data'], 3600);

    $experience->delete();

    expect(Cache::has('homepage.experiences'))->toBeFalse();
});

test('clears homepage.experiences cache when experience is restored', function () {
    $experience = Experience::factory()->create();
    $experience->delete();
    Cache::put('homepage.experiences', ['old' => 'data'], 3600);

    $experience->restore();

    expect(Cache::has('homepage.experiences'))->toBeFalse();
});

test('clears homepage.experiences cache when experience is force deleted', function () {
    $experience = Experience::factory()->create();
    Cache::put('homepage.experiences', ['old' => 'data'], 3600);

    $experience->forceDelete();

    expect(Cache::has('homepage.experiences'))->toBeFalse();
});

test('clears admin:dashboard cache when experience is created', function () {
    $user = User::factory()->create();
    Cache::put('admin:dashboard', ['cached' => 'data'], 3600);

    Experience::factory()->create(['user_id' => $user->id]);

    expect(Cache::has('admin:dashboard'))->toBeFalse();
});

test('clears admin:dashboard cache when experience is updated', function () {
    $experience = Experience::factory()->create();
    Cache::put('admin:dashboard', ['cached' => 'data'], 3600);

    $experience->update(['position' => 'New Position']);

    expect(Cache::has('admin:dashboard'))->toBeFalse();
});
