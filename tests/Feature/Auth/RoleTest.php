<?php


test('can get', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
