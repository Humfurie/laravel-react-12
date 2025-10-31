<?php

use App\Models\Taxonomy;
use App\Models\TaxonomyModel;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->taxonomy = Taxonomy::factory()->create([
        'name' => 'Test Taxonomy',
        'slug' => 'test-taxonomy',
    ]);
});

test('can create taxonomy model binding', function () {
    $binding = TaxonomyModel::create([
        'taxonomy_id' => $this->taxonomy->id,
        'model_class' => 'App\\Models\\Blog',
    ]);

    expect($binding)->toBeInstanceOf(TaxonomyModel::class)
        ->and($binding->taxonomy_id)->toBe($this->taxonomy->id)
        ->and($binding->model_class)->toBe('App\\Models\\Blog');
});

test('belongs to taxonomy', function () {
    $binding = TaxonomyModel::create([
        'taxonomy_id' => $this->taxonomy->id,
        'model_class' => 'App\\Models\\Blog',
    ]);

    expect($binding->taxonomy)->toBeInstanceOf(Taxonomy::class)
        ->and($binding->taxonomy->id)->toBe($this->taxonomy->id);
});

test('enforces unique constraint on taxonomy and model class', function () {
    TaxonomyModel::create([
        'taxonomy_id' => $this->taxonomy->id,
        'model_class' => 'App\\Models\\Blog',
    ]);

    // Attempting to create duplicate should fail
    expect(fn() => TaxonomyModel::create([
        'taxonomy_id' => $this->taxonomy->id,
        'model_class' => 'App\\Models\\Blog',
    ]))->toThrow(QueryException::class);
});

test('can create multiple bindings for same taxonomy', function () {
    $binding1 = TaxonomyModel::create([
        'taxonomy_id' => $this->taxonomy->id,
        'model_class' => 'App\\Models\\Blog',
    ]);

    $binding2 = TaxonomyModel::create([
        'taxonomy_id' => $this->taxonomy->id,
        'model_class' => 'App\\Models\\Expertise',
    ]);

    expect($binding1)->toBeInstanceOf(TaxonomyModel::class)
        ->and($binding2)->toBeInstanceOf(TaxonomyModel::class)
        ->and($this->taxonomy->models()->count())->toBe(2);
});

test('cascades on taxonomy delete', function () {
    $binding = TaxonomyModel::create([
        'taxonomy_id' => $this->taxonomy->id,
        'model_class' => 'App\\Models\\Blog',
    ]);

    $bindingId = $binding->id;
    $this->taxonomy->delete();

    expect(TaxonomyModel::find($bindingId))->toBeNull();
});
