<?php

use App\Models\User;

test('blog route exists at /blog not /blogs', function () {
    User::factory()->create(['id' => config('app.admin_user_id')]);

    // /blog should return 200
    $this->get('/blog')->assertStatus(200);

    // /blogs should return 404
    $this->get('/blogs')->assertStatus(404);
});

test('homepage contains correct blog link', function () {
    User::factory()->create(['id' => config('app.admin_user_id')]);

    $response = $this->get('/');

    $response->assertStatus(200);
    // Verify the correct route is linked, not the typo
    $response->assertSee('/blog', false);
});
