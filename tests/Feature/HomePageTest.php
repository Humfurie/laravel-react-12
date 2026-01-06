<?php


use Inertia\Testing\AssertableInertia;

test('', function () {
    $response = $this->get('/');

    $response->assertStatus(200)
        ->assertInertia(function (AssertableInertia $page) {
            $page->component('user/home');
        });
});
