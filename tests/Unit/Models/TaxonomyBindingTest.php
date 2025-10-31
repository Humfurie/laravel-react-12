<?php

use App\Models\Taxonomy;
use App\Models\TaxonomyModel;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->taxonomy = Taxonomy::factory()->create([
        'name' => 'Test Taxonomy',
        'slug' => 'test-taxonomy',
    ]);
});

describe('isAvailableFor', function () {
    test('returns true for unbound taxonomy', function () {
        expect($this->taxonomy->isAvailableFor('App\\Models\\Blog'))->toBeTrue()
            ->and($this->taxonomy->isAvailableFor('App\\Models\\Expertise'))->toBeTrue();
    });

    test('returns true for bound model', function () {
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);

        expect($this->taxonomy->isAvailableFor('App\\Models\\Blog'))->toBeTrue();
    });

    test('returns false for non-bound model when taxonomy is bound', function () {
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);

        expect($this->taxonomy->isAvailableFor('App\\Models\\Expertise'))->toBeFalse();
    });

    test('returns true for multiple bound models', function () {
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Expertise']);

        expect($this->taxonomy->isAvailableFor('App\\Models\\Blog'))->toBeTrue()
            ->and($this->taxonomy->isAvailableFor('App\\Models\\Expertise'))->toBeTrue()
            ->and($this->taxonomy->isAvailableFor('App\\Models\\User'))->toBeFalse();
    });
});

describe('isBoundToModels', function () {
    test('returns false for unbound taxonomy', function () {
        expect($this->taxonomy->isBoundToModels())->toBeFalse();
    });

    test('returns true for bound taxonomy', function () {
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);

        expect($this->taxonomy->isBoundToModels())->toBeTrue();
    });
});

describe('getModelClasses', function () {
    test('returns empty array for unbound taxonomy', function () {
        expect($this->taxonomy->getModelClasses())->toBe([]);
    });

    test('returns single model class', function () {
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);

        expect($this->taxonomy->getModelClasses())->toBe(['App\\Models\\Blog']);
    });

    test('returns multiple model classes', function () {
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Expertise']);

        $classes = $this->taxonomy->getModelClasses();

        expect($classes)->toHaveCount(2)
            ->and($classes)->toContain('App\\Models\\Blog')
            ->and($classes)->toContain('App\\Models\\Expertise');
    });
});

describe('getModelNames', function () {
    test('returns empty array for unbound taxonomy', function () {
        expect($this->taxonomy->getModelNames())->toBe([]);
    });

    test('returns human-readable model names', function () {
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
        $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Expertise']);

        $names = $this->taxonomy->getModelNames();

        expect($names)->toHaveCount(2)
            ->and($names)->toContain('Blog')
            ->and($names)->toContain('Expertise');
    });
});

describe('models relationship', function () {
    test('has many taxonomy models', function () {
        $binding1 = $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
        $binding2 = $this->taxonomy->models()->create(['model_class' => 'App\\Models\\Expertise']);

        expect($this->taxonomy->models)->toHaveCount(2)
            ->and($this->taxonomy->models->first())->toBeInstanceOf(TaxonomyModel::class);
    });
});
