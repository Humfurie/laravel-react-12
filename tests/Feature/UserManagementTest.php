<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = createAdminUser('user');
});

test('admin user index loads successfully', function () {
    $this->actingAs($this->admin)
        ->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/user'));
});

test('admin user index searches by name', function () {
    User::factory()->create(['name' => 'John Smith']);
    User::factory()->create(['name' => 'Jane Doe']);

    $this->actingAs($this->admin)
        ->get('/admin/users?search=John')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.search', 'John')
            ->has('users.data', fn ($data) => $data
                ->each(fn ($user) => $user
                    ->where('name', fn ($name) => str_contains(strtolower($name), 'john'))
                    ->etc()
                )
            )
        );
});

test('admin user index searches by email', function () {
    User::factory()->create(['email' => 'john@example.com']);
    User::factory()->create(['email' => 'jane@test.com']);

    $this->actingAs($this->admin)
        ->get('/admin/users?search=example.com')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.search', 'example.com')
        );
});

test('admin user index filters by role', function () {
    $editor = createUserWithRole('Editor', 'editor', 'blog', ['viewAny']);
    User::factory()->create();

    $this->actingAs($this->admin)
        ->get('/admin/users?role=editor')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.role', 'editor')
        );
});

test('admin user index paginates results', function () {
    User::factory()->count(20)->create();

    $this->actingAs($this->admin)
        ->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('users.data', 15)
            ->where('users.last_page', 2)
        );
});

test('admin user index passes filters back to frontend', function () {
    $this->actingAs($this->admin)
        ->get('/admin/users?search=test&role=admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.search', 'test')
            ->where('filters.role', 'admin')
        );
});

test('guest cannot access admin user index', function () {
    $this->get('/admin/users')
        ->assertRedirect(route('login'));
});
