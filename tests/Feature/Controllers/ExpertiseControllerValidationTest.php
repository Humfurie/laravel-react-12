<?php

use App\Models\Expertise;
use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create or get admin user (ID = 1 is admin in this app)
    $this->user = User::find(1) ?? User::factory()->create(['id' => 1]);
    $this->actingAs($this->user);

    Storage::fake('public');

    // Create shared taxonomy
    $this->sharedTaxonomy = Taxonomy::factory()->create(['slug' => 'shared-taxonomy']);
    $this->sharedTerm = TaxonomyTerm::factory()->create([
        'taxonomy_id' => $this->sharedTaxonomy->id,
        'name' => 'Shared Term',
    ]);

    // Create Expertise-specific taxonomy
    $this->expertiseTaxonomy = Taxonomy::factory()->create(['slug' => 'expertise-categories']);
    $this->expertiseTaxonomy->models()->create(['model_class' => 'App\\Models\\Expertise']);
    $this->expertiseTerm = TaxonomyTerm::factory()->create([
        'taxonomy_id' => $this->expertiseTaxonomy->id,
        'name' => 'Backend',
    ]);

    // Create Blog-specific taxonomy
    $this->blogTaxonomy = Taxonomy::factory()->create([
        'name' => 'Blog Categories',
        'slug' => 'blog-categories',
    ]);
    $this->blogTaxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
    $this->blogTerm = TaxonomyTerm::factory()->create([
        'taxonomy_id' => $this->blogTaxonomy->id,
        'name' => 'Technology',
    ]);
});

describe('store with term validation', function () {
    test('allows terms from shared taxonomy', function () {
        $response = $this->post(route('admin.expertises.store'), [
            'name' => 'Laravel',
            'image' => UploadedFile::fake()->image('laravel.png'),
            'category_slug' => 'be',
            'order' => 0,
            'is_active' => true,
            'term_ids' => [$this->sharedTerm->id],
        ]);

        $response->assertRedirect(route('admin.expertises.index'));

        $expertise = Expertise::where('name', 'Laravel')->first();
        expect($expertise)->not->toBeNull()
            ->and($expertise->taxonomyTerms()->pluck('taxonomy_terms.id'))
            ->toContain($this->sharedTerm->id);
    });

    test('allows terms from expertise-specific taxonomy', function () {
        $response = $this->post(route('admin.expertises.store'), [
            'name' => 'Laravel',
            'image' => UploadedFile::fake()->image('laravel.png'),
            'category_slug' => 'be',
            'order' => 0,
            'is_active' => true,
            'term_ids' => [$this->expertiseTerm->id],
        ]);

        $response->assertRedirect(route('admin.expertises.index'));

        $expertise = Expertise::where('name', 'Laravel')->first();
        expect($expertise->taxonomyTerms()->pluck('taxonomy_terms.id'))
            ->toContain($this->expertiseTerm->id);
    });

    test('rejects terms from blog-specific taxonomy', function () {
        $response = $this->post(route('admin.expertises.store'), [
            'name' => 'Laravel',
            'image' => UploadedFile::fake()->image('laravel.png'),
            'category_slug' => 'be',
            'order' => 0,
            'is_active' => true,
            'term_ids' => [$this->blogTerm->id],
        ]);

        $response->assertSessionHasErrors('term_ids');
        expect(Expertise::where('name', 'Laravel')->exists())->toBeFalse();
    });

    test('deletes expertise on term validation failure', function () {
        $response = $this->post(route('admin.expertises.store'), [
            'name' => 'Laravel',
            'image' => UploadedFile::fake()->image('laravel.png'),
            'category_slug' => 'be',
            'order' => 0,
            'is_active' => true,
            'term_ids' => [$this->blogTerm->id],
        ]);

        // Expertise should be deleted after validation failure
        expect(Expertise::where('name', 'Laravel')->count())->toBe(0);
    });

    test('error message includes taxonomy name', function () {
        $response = $this->post(route('admin.expertises.store'), [
            'name' => 'Laravel',
            'image' => UploadedFile::fake()->image('laravel.png'),
            'category_slug' => 'be',
            'order' => 0,
            'is_active' => true,
            'term_ids' => [$this->blogTerm->id],
        ]);

        $response->assertSessionHasErrors('term_ids');

        $errors = session('errors');
        $message = $errors->get('term_ids')[0];

        expect($message)->toContain('Technology')
            ->and($message)->toContain('Blog Categories')
            ->and($message)->toContain('Expertise model');
    });

    test('allows multiple valid terms', function () {
        $response = $this->post(route('admin.expertises.store'), [
            'name' => 'Laravel',
            'image' => UploadedFile::fake()->image('laravel.png'),
            'category_slug' => 'be',
            'order' => 0,
            'is_active' => true,
            'term_ids' => [$this->sharedTerm->id, $this->expertiseTerm->id],
        ]);

        $response->assertRedirect(route('admin.expertises.index'));

        $expertise = Expertise::where('name', 'Laravel')->first();
        expect($expertise->taxonomyTerms()->count())->toBe(2);
    });

    test('allows empty term array', function () {
        $response = $this->post(route('admin.expertises.store'), [
            'name' => 'Laravel',
            'image' => UploadedFile::fake()->image('laravel.png'),
            'category_slug' => 'be',
            'order' => 0,
            'is_active' => true,
            'term_ids' => [],
        ]);

        $response->assertRedirect(route('admin.expertises.index'));
    });
});

describe('update with term validation', function () {
    beforeEach(function () {
        $this->expertise = Expertise::factory()->create();
    });

    test('allows valid term updates', function () {
        $response = $this->put(route('admin.expertises.update', $this->expertise), [
            'name' => $this->expertise->name,
            'category_slug' => $this->expertise->category_slug,
            'order' => $this->expertise->order,
            'is_active' => $this->expertise->is_active,
            'term_ids' => [$this->expertiseTerm->id],
        ]);

        $response->assertRedirect(route('admin.expertises.index'));

        $this->expertise->refresh();
        expect($this->expertise->taxonomyTerms()->pluck('taxonomy_terms.id'))
            ->toContain($this->expertiseTerm->id);
    });

    test('rejects invalid terms on update', function () {
        $response = $this->put(route('admin.expertises.update', $this->expertise), [
            'name' => $this->expertise->name,
            'category_slug' => $this->expertise->category_slug,
            'order' => $this->expertise->order,
            'is_active' => $this->expertise->is_active,
            'term_ids' => [$this->blogTerm->id],
        ]);

        $response->assertSessionHasErrors('term_ids');
    });

    test('preserves expertise on update validation failure', function () {
        $originalName = $this->expertise->name;

        $response = $this->put(route('admin.expertises.update', $this->expertise), [
            'name' => 'Updated Name',
            'category_slug' => $this->expertise->category_slug,
            'order' => $this->expertise->order,
            'is_active' => $this->expertise->is_active,
            'term_ids' => [$this->blogTerm->id],
        ]);

        $response->assertSessionHasErrors('term_ids');

        $this->expertise->refresh();
        expect($this->expertise->name)->toBe($originalName);
    });

    test('can update to remove all terms', function () {
        $this->expertise->syncTerms([$this->expertiseTerm->id]);

        $response = $this->put(route('admin.expertises.update', $this->expertise), [
            'name' => $this->expertise->name,
            'category_slug' => $this->expertise->category_slug,
            'order' => $this->expertise->order,
            'is_active' => $this->expertise->is_active,
            'term_ids' => [],
        ]);

        $response->assertRedirect(route('admin.expertises.index'));

        $this->expertise->refresh();
        expect($this->expertise->taxonomyTerms()->count())->toBe(0);
    });
});
