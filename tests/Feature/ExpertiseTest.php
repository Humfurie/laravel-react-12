<?php

use App\Models\Expertise;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createAdminUser('expertise');
});

test('admin expertise index loads successfully', function () {
    $this->actingAs($this->user)
        ->get(route('admin.expertises.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/expertise/index'));
});

test('admin expertise index filters by category', function () {
    Expertise::factory()->create(['category_slug' => 'be']);
    Expertise::factory()->create(['category_slug' => 'fe']);
    Expertise::factory()->create(['category_slug' => 'td']);

    $this->actingAs($this->user)
        ->get(route('admin.expertises.index', ['category' => 'be']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('expertises.data', 1)
            ->where('expertises.data.0.category_slug', 'be')
        );
});

test('admin expertise index searches by name', function () {
    Expertise::factory()->create(['name' => 'Laravel']);
    Expertise::factory()->create(['name' => 'React']);

    $this->actingAs($this->user)
        ->get(route('admin.expertises.index', ['search' => 'Laravel']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('expertises.data', 1)
            ->where('expertises.data.0.name', 'Laravel')
        );
});

test('admin expertise index search is case insensitive', function () {
    Expertise::factory()->create(['name' => 'TypeScript']);

    $this->actingAs($this->user)
        ->get(route('admin.expertises.index', ['search' => 'typescript']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('expertises.data', 1));
});

test('admin expertise index paginates results', function () {
    Expertise::factory()->count(20)->create();

    $this->actingAs($this->user)
        ->get(route('admin.expertises.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('expertises.data', 15)
            ->where('expertises.last_page', 2)
        );
});

test('admin expertise index passes filters back to frontend', function () {
    $this->actingAs($this->user)
        ->get(route('admin.expertises.index', ['search' => 'test', 'category' => 'fe']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.search', 'test')
            ->where('filters.category', 'fe')
        );
});

test('admin expertise index combines search and category filter', function () {
    Expertise::factory()->create(['name' => 'Laravel', 'category_slug' => 'be']);
    Expertise::factory()->create(['name' => 'React', 'category_slug' => 'fe']);
    Expertise::factory()->create(['name' => 'Node.js', 'category_slug' => 'be']);

    $this->actingAs($this->user)
        ->get(route('admin.expertises.index', ['search' => 'Laravel', 'category' => 'be']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('expertises.data', 1)
            ->where('expertises.data.0.name', 'Laravel')
        );
});

test('guest cannot access admin expertise routes', function () {
    $this->get(route('admin.expertises.index'))
        ->assertRedirect(route('login'));
});
