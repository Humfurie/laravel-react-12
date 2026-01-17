<?php

use App\Providers\AppServiceProvider;
use Illuminate\Support\Facades\Log;

beforeEach(function () {
    // Clear any existing mock expectations
    Log::spy();
});

test('logs warning when admin_user_id is null', function () {
    config(['app.admin_user_id' => null]);

    Log::shouldReceive('warning')
        ->once()
        ->with('ADMIN_USER_ID is not configured. Homepage features may not work correctly.');

    // Use reflection to call the private method directly
    $provider = new AppServiceProvider(app());
    $reflection = new ReflectionClass($provider);
    $method = $reflection->getMethod('validateConfiguration');
    $method->setAccessible(true);
    $method->invoke($provider);
});

test('logs warning when admin_user_id is empty string', function () {
    config(['app.admin_user_id' => '']);

    Log::shouldReceive('warning')
        ->once()
        ->with('ADMIN_USER_ID is not configured. Homepage features may not work correctly.');

    $provider = new AppServiceProvider(app());
    $reflection = new ReflectionClass($provider);
    $method = $reflection->getMethod('validateConfiguration');
    $method->setAccessible(true);
    $method->invoke($provider);
});

test('logs warning when admin_user_id is non-numeric', function () {
    config(['app.admin_user_id' => 'invalid']);

    Log::shouldReceive('warning')
        ->once()
        ->withArgs(function ($message) {
            return str_contains($message, 'ADMIN_USER_ID must be a positive integer');
        });

    $provider = new AppServiceProvider(app());
    $reflection = new ReflectionClass($provider);
    $method = $reflection->getMethod('validateConfiguration');
    $method->setAccessible(true);
    $method->invoke($provider);
});

test('logs warning when admin_user_id is zero', function () {
    config(['app.admin_user_id' => 0]);

    Log::shouldReceive('warning')
        ->once()
        ->withArgs(function ($message) {
            return str_contains($message, 'ADMIN_USER_ID must be a positive integer');
        });

    $provider = new AppServiceProvider(app());
    $reflection = new ReflectionClass($provider);
    $method = $reflection->getMethod('validateConfiguration');
    $method->setAccessible(true);
    $method->invoke($provider);
});

test('logs warning when admin_user_id is negative', function () {
    config(['app.admin_user_id' => -1]);

    Log::shouldReceive('warning')
        ->once()
        ->withArgs(function ($message) {
            return str_contains($message, 'ADMIN_USER_ID must be a positive integer');
        });

    $provider = new AppServiceProvider(app());
    $reflection = new ReflectionClass($provider);
    $method = $reflection->getMethod('validateConfiguration');
    $method->setAccessible(true);
    $method->invoke($provider);
});

test('does not log warning when admin_user_id is valid positive integer', function () {
    config(['app.admin_user_id' => 1]);

    Log::shouldReceive('warning')->never();

    $provider = new AppServiceProvider(app());
    $reflection = new ReflectionClass($provider);
    $method = $reflection->getMethod('validateConfiguration');
    $method->setAccessible(true);
    $method->invoke($provider);
});

test('does not log warning when admin_user_id is valid numeric string', function () {
    config(['app.admin_user_id' => '42']);

    Log::shouldReceive('warning')->never();

    $provider = new AppServiceProvider(app());
    $reflection = new ReflectionClass($provider);
    $method = $reflection->getMethod('validateConfiguration');
    $method->setAccessible(true);
    $method->invoke($provider);
});
