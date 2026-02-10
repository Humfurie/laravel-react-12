<?php

use App\Models\GuestbookEntry;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->admin = createAdminUser('guestbook-entry');
    config(['app.admin_user_id' => $this->admin->id]);
});

test('admin can view guestbook entries', function () {
    GuestbookEntry::factory(3)->create();

    $response = $this->actingAs($this->admin)->get('/admin/guestbook');

    $response->assertOk()
        ->assertInertia(function (AssertableInertia $page) {
            $page->component('admin/guestbook/index')
                ->has('entries.data', 3)
                ->has('stats');
        });
});

test('admin can update guestbook entry status', function () {
    $entry = GuestbookEntry::factory()->create(['is_approved' => true]);

    $response = $this->actingAs($this->admin)
        ->patch("/admin/guestbook/{$entry->id}/status", ['is_approved' => false]);

    $response->assertRedirect();
    expect($entry->fresh()->is_approved)->toBeFalse();
});

test('admin can soft delete guestbook entry', function () {
    $entry = GuestbookEntry::factory()->create();

    $response = $this->actingAs($this->admin)->delete("/admin/guestbook/{$entry->id}");

    $response->assertRedirect();
    $this->assertSoftDeleted('guestbook_entries', ['id' => $entry->id]);
});

test('admin can restore soft-deleted guestbook entry', function () {
    $entry = GuestbookEntry::factory()->create();
    $entry->delete();

    $response = $this->actingAs($this->admin)
        ->patch("/admin/guestbook/{$entry->id}/restore");

    $response->assertRedirect();
    expect($entry->fresh()->deleted_at)->toBeNull();
});

test('admin can force delete guestbook entry', function () {
    $entry = GuestbookEntry::factory()->create();
    $entry->delete();

    $response = $this->actingAs($this->admin)
        ->delete("/admin/guestbook/{$entry->id}/force");

    $response->assertRedirect();
    $this->assertDatabaseMissing('guestbook_entries', ['id' => $entry->id]);
});

test('non-admin cannot access guestbook admin', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/admin/guestbook');

    $response->assertForbidden();
});
