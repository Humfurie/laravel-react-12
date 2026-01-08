<?php

use App\Models\Blog;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();

    // Set admin user ID in config
    config(['app.admin_user_id' => 1]);
});

test('command warms all homepage caches successfully', function () {
    $admin = createAdminUser('blog');
    config(['app.admin_user_id' => $admin->id]);

    Blog::factory()->published()->count(5)->create();
    Project::factory()->count(3)->create(['user_id' => $admin->id, 'is_published' => true]);
    Experience::factory()->count(2)->create(['user_id' => $admin->id]);
    Expertise::factory()->count(4)->create(['user_id' => $admin->id]);

    Artisan::call('cache:warm-homepage');

    expect(Cache::has(config('cache-ttl.keys.homepage_blogs')))->toBeTrue()
        ->and(Cache::has(config('cache-ttl.keys.homepage_projects')))->toBeTrue()
        ->and(Cache::has(config('cache-ttl.keys.homepage_experiences')))->toBeTrue()
        ->and(Cache::has(config('cache-ttl.keys.homepage_expertises')))->toBeTrue()
        ->and(Cache::has(config('cache-ttl.keys.homepage_user_profile')))->toBeTrue();
});

test('command uses configured admin user id', function () {
    $wrongUser = User::factory()->create();
    $admin = createAdminUser('blog');
    config(['app.admin_user_id' => $admin->id]);

    Project::factory()->count(2)->create(['user_id' => $wrongUser->id, 'is_published' => true]);
    Project::factory()->count(3)->create(['user_id' => $admin->id, 'is_published' => true]);

    Artisan::call('cache:warm-homepage');

    $cachedProjects = Cache::get(config('cache-ttl.keys.homepage_projects'));

    expect($cachedProjects)->toHaveKey('featured')
        ->and($cachedProjects['featured'])->toHaveCount(3)
        ->and($cachedProjects['featured']->every(fn($project) => $project->user_id === $admin->id))->toBeTrue();
});

test('command only caches published projects', function () {
    $admin = createAdminUser('blog');
    config(['app.admin_user_id' => $admin->id]);

    Project::factory()->count(2)->create(['user_id' => $admin->id, 'is_published' => true]);
    Project::factory()->count(3)->create(['user_id' => $admin->id, 'is_published' => false]);

    Artisan::call('cache:warm-homepage');

    $cachedProjects = Cache::get(config('cache-ttl.keys.homepage_projects'));

    expect($cachedProjects)->toHaveKey('featured')
        ->and($cachedProjects['featured'])->toHaveCount(2)
        ->and($cachedProjects['featured']->every(fn($project) => $project->is_published === true))->toBeTrue();
});

test('command limits projects to 6 items', function () {
    $admin = createAdminUser('blog');
    config(['app.admin_user_id' => $admin->id]);

    Project::factory()->count(10)->create(['user_id' => $admin->id, 'is_published' => true]);

    Artisan::call('cache:warm-homepage');

    $cachedProjects = Cache::get(config('cache-ttl.keys.homepage_projects'));

    expect($cachedProjects)->toHaveKey('featured')
        ->and($cachedProjects['featured'])->toHaveCount(6);
});

test('command caches user profile correctly', function () {
    $admin = createAdminUser('blog');
    config(['app.admin_user_id' => $admin->id]);

    Artisan::call('cache:warm-homepage');

    $cachedUser = Cache::get(config('cache-ttl.keys.homepage_user_profile'));

    expect($cachedUser)->not->toBeNull()
        ->and($cachedUser->id)->toBe($admin->id);
});

test('command overwrites existing cache', function () {
    $admin = createAdminUser('blog');
    config(['app.admin_user_id' => $admin->id]);

    Cache::put(config('cache-ttl.keys.homepage_blogs'), ['old' => 'data'], 3600);

    Blog::factory()->published()->count(3)->create();

    Artisan::call('cache:warm-homepage');

    $cachedBlogs = Cache::get(config('cache-ttl.keys.homepage_blogs'));

    expect($cachedBlogs)->not->toBe(['old' => 'data'])
        ->and($cachedBlogs)->toHaveKeys(['primary', 'latest', 'stats']);
});

test('command throws exception when admin user not found', function () {
    config(['app.admin_user_id' => 9999]);

    Artisan::call('cache:warm-homepage');
})->throws(RuntimeException::class, 'Admin user with ID 9999 not found');

test('command displays progress messages', function () {
    $admin = createAdminUser('blog');
    config(['app.admin_user_id' => $admin->id]);

    Artisan::call('cache:warm-homepage');

    $output = Artisan::output();

    expect($output)->toContain('Warming homepage caches')
        ->and($output)->toContain('Homepage caches warmed successfully');
});

test('command respects force option', function () {
    $admin = createAdminUser('blog');
    config(['app.admin_user_id' => $admin->id]);

    // Warm cache first time
    Artisan::call('cache:warm-homepage');
    $output1 = Artisan::output();

    // Try warming again without force
    Artisan::call('cache:warm-homepage');
    $output2 = Artisan::output();

    // Try warming with force
    Artisan::call('cache:warm-homepage', ['--force' => true]);
    $output3 = Artisan::output();

    expect($output1)->toContain('✓')
        ->and($output2)->toContain('already cached')
        ->and($output3)->toContain('✓');
});

test('command caches experiences for configured admin user', function () {
    $wrongUser = User::factory()->create();
    $admin = createAdminUser('blog');
    config(['app.admin_user_id' => $admin->id]);

    Experience::factory()->count(2)->create(['user_id' => $wrongUser->id]);
    Experience::factory()->count(3)->create(['user_id' => $admin->id]);

    Artisan::call('cache:warm-homepage');

    $cachedExperiences = Cache::get(config('cache-ttl.keys.homepage_experiences'));

    expect($cachedExperiences)->toHaveCount(3)
        ->and($cachedExperiences->every(fn($exp) => $exp->user_id === $admin->id))->toBeTrue();
});
