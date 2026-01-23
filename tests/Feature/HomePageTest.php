<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('homepage loads successfully with required data', function () {
    // Create admin user with the configured admin_user_id
    User::factory()->create(['id' => config('app.admin_user_id')]);

    $response = $this->get('/');

    $response->assertStatus(200)
        ->assertInertia(function (AssertableInertia $page) {
            $page->component('user/home')
                ->has('profileUser')
                ->has('experiences')
                ->has('expertises')
                ->has('projects')
                ->has('projectStats')
                ->has('githubStats');
        });
});
