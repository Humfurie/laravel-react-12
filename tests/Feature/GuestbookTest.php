<?php

use App\Models\GuestbookEntry;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('guestbook page loads successfully', function () {
    $response = $this->get('/guestbook');

    $response->assertStatus(200)
        ->assertInertia(function (AssertableInertia $page) {
            $page->component('user/guestbook')
                ->has('entries');
        });
});

test('guestbook shows only approved entries', function () {
    GuestbookEntry::factory(3)->create();
    GuestbookEntry::factory(2)->unapproved()->create();

    $response = $this->get('/guestbook');

    $response->assertStatus(200)
        ->assertInertia(function (AssertableInertia $page) {
            $page->component('user/guestbook')
                ->has('entries.data', 3);
        });
});

test('authenticated user can create guestbook entry', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/guestbook', [
        'message' => 'Hello from the guestbook!',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('entry.message', 'Hello from the guestbook!');
    $this->assertDatabaseHas('guestbook_entries', [
        'user_id' => $user->id,
        'message' => 'Hello from the guestbook!',
        'is_approved' => true,
    ]);
});

test('guest cannot create guestbook entry', function () {
    $response = $this->post('/guestbook', [
        'message' => 'Unauthorized message',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseMissing('guestbook_entries', [
        'message' => 'Unauthorized message',
    ]);
});

test('guestbook entry message strips html tags', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/guestbook', [
        'message' => '<script>alert("xss")</script>Hello world',
    ]);

    $this->assertDatabaseHas('guestbook_entries', [
        'user_id' => $user->id,
        'message' => 'alert("xss")Hello world',
    ]);
});

test('guestbook entry validates minimum message length', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/guestbook', [
        'message' => 'Hi',
    ]);

    $response->assertSessionHasErrors('message');
});

test('guestbook entry validates maximum message length', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/guestbook', [
        'message' => str_repeat('a', 501),
    ]);

    $response->assertSessionHasErrors('message');
});

test('user can delete own guestbook entry', function () {
    $user = User::factory()->create();
    $entry = GuestbookEntry::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->deleteJson("/guestbook/{$entry->id}");

    $response->assertOk()
        ->assertJson(['success' => true]);
    $this->assertSoftDeleted('guestbook_entries', ['id' => $entry->id]);
});

test('user cannot delete others guestbook entry', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $entry = GuestbookEntry::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->delete("/guestbook/{$entry->id}");

    $response->assertForbidden();
});

test('guestbook entries are paginated', function () {
    GuestbookEntry::factory(25)->create();

    $response = $this->get('/guestbook');

    $response->assertStatus(200)
        ->assertInertia(function (AssertableInertia $page) {
            $page->component('user/guestbook')
                ->has('entries.data', 20)
                ->where('entries.last_page', 2);
        });
});
