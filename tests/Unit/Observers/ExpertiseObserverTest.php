<?php

use App\Models\Expertise;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();
});

test('clears homepage.expertises cache when expertise is created', function () {
    Cache::put('homepage.expertises', ['old' => 'data'], 3600);

    Expertise::factory()->create();

    expect(Cache::has('homepage.expertises'))->toBeFalse();
});

test('clears homepage.expertises cache when expertise is updated', function () {
    $expertise = Expertise::factory()->create();
    Cache::put('homepage.expertises', ['old' => 'data'], 3600);

    $expertise->update(['name' => 'Updated Expertise']);

    expect(Cache::has('homepage.expertises'))->toBeFalse();
});

test('clears homepage.expertises cache when expertise is deleted', function () {
    $expertise = Expertise::factory()->create();
    Cache::put('homepage.expertises', ['old' => 'data'], 3600);

    $expertise->delete();

    expect(Cache::has('homepage.expertises'))->toBeFalse();
});

test('clears admin:dashboard cache when expertise is created', function () {
    Cache::put('admin:dashboard', ['cached' => 'data'], 3600);

    Expertise::factory()->create();

    expect(Cache::has('admin:dashboard'))->toBeFalse();
});

test('clears admin:dashboard cache when expertise is updated', function () {
    $expertise = Expertise::factory()->create();
    Cache::put('admin:dashboard', ['cached' => 'data'], 3600);

    $expertise->update(['name' => 'New Expertise Name']);

    expect(Cache::has('admin:dashboard'))->toBeFalse();
});
