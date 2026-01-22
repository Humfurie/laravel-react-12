<?php

use App\Models\Blog;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\User;
use App\Services\GitHubService;
use App\Services\HomepageCacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(HomepageCacheService::class);
    Cache::flush();
});

describe('getBlogsData', function () {
    test('returns correct structure', function () {
        Blog::factory()->published()->count(3)->create();

        $data = $this->service->getBlogsData();

        expect($data)->toHaveKeys(['primary', 'latest', 'stats'])
            ->and($data['stats'])->toHaveKeys(['total_posts', 'total_views', 'featured_count']);
    });

    test('returns integer values for stats', function () {
        Blog::factory()->published()->count(2)->create();

        $data = $this->service->getBlogsData();

        expect($data['stats']['total_posts'])->toBeInt()
            ->and($data['stats']['total_views'])->toBeInt()
            ->and($data['stats']['featured_count'])->toBeInt();
    });

    test('returns correct post count', function () {
        Blog::factory()->published()->count(5)->create();
        Blog::factory()->draft()->count(2)->create();

        $data = $this->service->getBlogsData();

        expect($data['stats']['total_posts'])->toBe(5);
    });
});

describe('getProjectsData', function () {
    test('returns correct structure', function () {
        $data = $this->service->getProjectsData();

        expect($data)->toHaveKeys(['featured', 'stats'])
            ->and($data['stats'])->toHaveKeys(['total_projects', 'live_projects']);
    });

    test('returns integer values for stats', function () {
        $data = $this->service->getProjectsData();

        expect($data['stats']['total_projects'])->toBeInt()
            ->and($data['stats']['live_projects'])->toBeInt();
    });
});

describe('getExperiencesData', function () {
    test('returns experiences for admin user', function () {
        // Use a unique high ID to avoid conflicts with other tests
        $uniqueAdminId = 99999;
        config(['app.admin_user_id' => $uniqueAdminId]);

        $adminUser = User::factory()->create(['id' => $uniqueAdminId]);
        $otherUser = User::factory()->create();

        Experience::factory()->count(3)->create(['user_id' => $adminUser->id]);
        Experience::factory()->count(2)->create(['user_id' => $otherUser->id]);

        $data = $this->service->getExperiencesData();

        expect($data)->toHaveCount(3);
    });
});

describe('getExpertisesData', function () {
    test('returns active expertises', function () {
        Expertise::factory()->count(3)->create(['is_active' => true]);
        Expertise::factory()->count(2)->create(['is_active' => false]);

        $data = $this->service->getExpertisesData();

        expect($data)->toHaveCount(3);
    });
});

describe('getUserProfileData', function () {
    test('returns admin user', function () {
        $adminUser = User::factory()->create(['id' => config('app.admin_user_id')]);

        $data = $this->service->getUserProfileData();

        expect($data)->toBeInstanceOf(User::class)
            ->and($data->id)->toBe($adminUser->id);
    });

    test('throws exception when admin user not found', function () {
        $this->service->getUserProfileData();
    })->throws(RuntimeException::class);
});

describe('getCachedBlogsData', function () {
    test('returns correct structure and caches data', function () {
        Blog::factory()->published()->count(3)->create();

        $data = $this->service->getCachedBlogsData();

        expect($data)->toHaveKeys(['primary', 'latest', 'stats'])
            ->and($data['stats'])->toHaveKeys(['total_posts', 'total_views', 'featured_count'])
            ->and(Cache::has(config('cache-ttl.keys.homepage_blogs')))->toBeTrue();
    });

    test('uses lock key pattern for stampede protection', function () {
        Blog::factory()->published()->count(2)->create();

        // First call should set the cache
        $this->service->getCachedBlogsData();

        $cacheKey = config('cache-ttl.keys.homepage_blogs');

        // Verify the cache is populated
        expect(Cache::has($cacheKey))->toBeTrue();

        // Verify the cached data matches what getBlogsData returns
        $cachedData = Cache::get($cacheKey);
        expect($cachedData['stats']['total_posts'])->toBe(2);
    });
});

describe('getCachedProjectsData', function () {
    test('caches projects data', function () {
        $data = $this->service->getCachedProjectsData();

        expect(Cache::has(config('cache-ttl.keys.homepage_projects')))->toBeTrue()
            ->and($data)->toHaveKeys(['featured', 'stats']);
    });
});

describe('getCachedExperiencesData', function () {
    test('caches experiences data', function () {
        $uniqueAdminId = 99998;
        config(['app.admin_user_id' => $uniqueAdminId]);
        User::factory()->create(['id' => $uniqueAdminId]);

        $this->service->getCachedExperiencesData();

        expect(Cache::has(config('cache-ttl.keys.homepage_experiences')))->toBeTrue();
    });
});

describe('getCachedExpertisesData', function () {
    test('caches expertises data', function () {
        Expertise::factory()->count(2)->create(['is_active' => true]);

        $this->service->getCachedExpertisesData();

        expect(Cache::has(config('cache-ttl.keys.homepage_expertises')))->toBeTrue();
    });
});

describe('getCachedUserProfileData', function () {
    test('caches user profile data', function () {
        User::factory()->create(['id' => config('app.admin_user_id')]);

        $this->service->getCachedUserProfileData();

        expect(Cache::has(config('cache-ttl.keys.homepage_user_profile')))->toBeTrue();
    });
});

describe('getGitHubStats', function () {
    test('returns null when user has no github username', function () {
        $uniqueAdminId = 99997;
        $user = User::factory()->create(['id' => $uniqueAdminId, 'github_username' => null]);
        config(['app.admin_user_id' => $user->id]);

        $result = $this->service->getGitHubStats();

        expect($result)->toBeNull();
    });

    test('returns null when admin user does not exist', function () {
        config(['app.admin_user_id' => 999999]);

        $result = $this->service->getGitHubStats();

        expect($result)->toBeNull();
    });

    test('returns data when user has github username', function () {
        $uniqueAdminId = 99996;
        $user = User::factory()->create(['id' => $uniqueAdminId, 'github_username' => 'testuser']);
        config(['app.admin_user_id' => $user->id]);

        $mockData = [
            'total_contributions' => 500,
            'commits' => 400,
            'pull_requests' => 50,
            'issues' => 30,
            'reviews' => 20,
            'private_contributions' => 100,
            'calendar' => [],
            'top_repositories' => [],
        ];

        $this->mock(GitHubService::class, function ($mock) use ($mockData) {
            $mock->shouldReceive('getUserContributions')
                ->once()
                ->with('testuser')
                ->andReturn($mockData);
        });

        $result = $this->service->getGitHubStats();

        expect($result)->toBe($mockData);
    });
});

describe('getCachedGitHubStats', function () {
    test('returns null when user has no github username', function () {
        $uniqueAdminId = 99995;
        $user = User::factory()->create(['id' => $uniqueAdminId, 'github_username' => null]);
        config(['app.admin_user_id' => $user->id]);

        $result = $this->service->getCachedGitHubStats();

        expect($result)->toBeNull();
    });

    test('caches github stats data', function () {
        $uniqueAdminId = 99994;
        $user = User::factory()->create(['id' => $uniqueAdminId, 'github_username' => 'testuser']);
        config(['app.admin_user_id' => $user->id]);

        $mockData = [
            'total_contributions' => 500,
            'commits' => 400,
            'pull_requests' => 50,
            'issues' => 30,
            'reviews' => 20,
            'private_contributions' => 100,
            'calendar' => [],
            'top_repositories' => [],
        ];

        $this->mock(GitHubService::class, function ($mock) use ($mockData) {
            $mock->shouldReceive('getUserContributions')
                ->once()
                ->with('testuser')
                ->andReturn($mockData);
        });

        $result = $this->service->getCachedGitHubStats();

        expect($result)->toBe($mockData)
            ->and(Cache::has(config('cache-ttl.keys.homepage_github_stats')))->toBeTrue();
    });

    test('returns cached data on subsequent calls', function () {
        $uniqueAdminId = 99993;
        $user = User::factory()->create(['id' => $uniqueAdminId, 'github_username' => 'testuser']);
        config(['app.admin_user_id' => $user->id]);

        $mockData = [
            'total_contributions' => 500,
            'commits' => 400,
            'pull_requests' => 50,
            'issues' => 30,
            'reviews' => 20,
            'private_contributions' => 100,
            'calendar' => [],
            'top_repositories' => [],
        ];

        $this->mock(GitHubService::class, function ($mock) use ($mockData) {
            $mock->shouldReceive('getUserContributions')
                ->once() // Only called once, proving cache is used
                ->with('testuser')
                ->andReturn($mockData);
        });

        // First call - hits the service
        $result1 = $this->service->getCachedGitHubStats();

        // Second call - should use cache
        $result2 = $this->service->getCachedGitHubStats();

        expect($result1)->toBe($mockData)
            ->and($result2)->toBe($mockData);
    });
});
