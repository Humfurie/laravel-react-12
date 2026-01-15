<?php

use App\Models\Blog;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\User;
use App\Services\HomepageCacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(HomepageCacheService::class);
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
