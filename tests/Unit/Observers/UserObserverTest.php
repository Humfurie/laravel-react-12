<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();
});

test('clears homepage.user_profile cache when admin user is updated', function () {
    $adminId = config('app.admin_user_id');
    $adminUser = User::factory()->create(['id' => $adminId]);
    Cache::put('homepage.user_profile', ['old' => 'data'], 3600);

    $adminUser->update(['name' => 'Updated Admin Name']);

    expect(Cache::has('homepage.user_profile'))->toBeFalse();
});

test('does not clear homepage.user_profile cache when non-admin user is updated', function () {
    $nonAdminUser = User::factory()->create();
    Cache::put('homepage.user_profile', ['old' => 'data'], 3600);

    $nonAdminUser->update(['name' => 'Updated Name']);

    expect(Cache::has('homepage.user_profile'))->toBeTrue();
});

test('clears homepage.user_profile cache when admin user is deleted', function () {
    $adminId = config('app.admin_user_id');
    $adminUser = User::factory()->create(['id' => $adminId]);
    Cache::put('homepage.user_profile', ['old' => 'data'], 3600);

    $adminUser->delete();

    expect(Cache::has('homepage.user_profile'))->toBeFalse();
});

test('clears admin:dashboard cache when any user is created', function () {
    Cache::put('admin:dashboard', ['cached' => 'data'], 3600);

    User::factory()->create();

    expect(Cache::has('admin:dashboard'))->toBeFalse();
});

test('clears admin:dashboard cache when any user is updated', function () {
    $user = User::factory()->create();
    Cache::put('admin:dashboard', ['cached' => 'data'], 3600);

    $user->update(['name' => 'New Name']);

    expect(Cache::has('admin:dashboard'))->toBeFalse();
});

test('clears admin:dashboard cache when any user is deleted', function () {
    $user = User::factory()->create();
    Cache::put('admin:dashboard', ['cached' => 'data'], 3600);

    $user->delete();

    expect(Cache::has('admin:dashboard'))->toBeFalse();
});
