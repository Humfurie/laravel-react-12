<?php

use App\Models\Experience;
use App\Models\Expertise;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('resume page loads successfully with required data', function () {
    User::factory()->create(['id' => config('app.admin_user_id')]);

    $response = $this->get('/resume');

    $response->assertStatus(200)
        ->assertInertia(function (AssertableInertia $page) {
            $page->component('user/resume')
                ->has('profileUser')
                ->has('experiences')
                ->has('expertises');
        });
});

test('resume page includes profile user data', function () {
    $user = User::factory()->create([
        'id' => config('app.admin_user_id'),
        'name' => 'Test User',
        'headline' => 'Software Engineer',
        'bio' => 'A passionate developer.',
    ]);

    $response = $this->get('/resume');

    $response->assertStatus(200)
        ->assertInertia(function (AssertableInertia $page) {
            $page->component('user/resume')
                ->where('profileUser.name', 'Test User')
                ->where('profileUser.headline', 'Software Engineer')
                ->where('profileUser.bio', 'A passionate developer.');
        });
});

test('resume page includes education data', function () {
    $education = [
        [
            'degree' => 'BS Computer Science',
            'institution' => 'Test University',
            'start_year' => 2019,
            'end_year' => 2023,
        ],
    ];

    User::factory()->create([
        'id' => config('app.admin_user_id'),
        'education' => $education,
    ]);

    $response = $this->get('/resume');

    $response->assertStatus(200)
        ->assertInertia(function (AssertableInertia $page) use ($education) {
            $page->component('user/resume')
                ->where('profileUser.education', $education);
        });
});
