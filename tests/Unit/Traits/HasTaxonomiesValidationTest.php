<?php

use App\Models\Expertise;
use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create shared expertise taxonomy (no model bindings) - uses convention slug
    $this->sharedTaxonomy = Taxonomy::factory()->create([
        'name' => 'Expertise Categories (Shared)',
        'slug' => 'expertise-categories',
    ]);
    // Leave unbound - no models()->create() call
    $this->sharedTerm = TaxonomyTerm::factory()->create([
        'taxonomy_id' => $this->sharedTaxonomy->id,
        'name' => 'Shared Term',
    ]);

    // Create another expertise taxonomy that IS bound to Blog (not Expertise)
    // This tests that even if slug doesn't match our convention, we still validate bindings
    $this->expertiseTaxonomy = Taxonomy::factory()->create([
        'name' => 'Expertise Specialties',
        'slug' => 'expertise-specialties',
    ]);
    $this->expertiseTaxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
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

    // Create expertise - only expertise-categories will be in configured taxonomies by default
    $this->expertise = Expertise::factory()->create();
});

describe('getConfiguredTaxonomies', function () {
    test('includes shared taxonomies with matching slug', function () {
        // Expertise looks for 'expertise-categories' by convention
        // sharedTaxonomy has that slug and is unbound, so it should be included
        $taxonomies = $this->expertise->getConfiguredTaxonomies();

        expect($taxonomies->pluck('id'))->toContain($this->sharedTaxonomy->id);
    });

    test('excludes model-specific taxonomies with non-matching slug', function () {
        // expertiseTaxonomy has slug 'expertise-specialties' which is NOT in configured list
        $taxonomies = $this->expertise->getConfiguredTaxonomies();

        expect($taxonomies->pluck('id'))->not->toContain($this->expertiseTaxonomy->id);
    });

    test('excludes taxonomies bound to other models', function () {
        // blogTaxonomy slug doesn't match AND it's bound to Blog
        $taxonomies = $this->expertise->getConfiguredTaxonomies();

        expect($taxonomies->pluck('id'))->not->toContain($this->blogTaxonomy->id);
    });
});

describe('syncTerms validation', function () {
    test('allows terms from shared taxonomy', function () {
        expect(fn() => $this->expertise->syncTerms([$this->sharedTerm->id]))
            ->not->toThrow(InvalidArgumentException::class);

        expect($this->expertise->taxonomyTerms()->pluck('taxonomy_terms.id'))
            ->toContain($this->sharedTerm->id);
    });

    test('rejects terms from taxonomy with wrong slug', function () {
        // expertiseTerm is from 'expertise-specialties' which isn't in configured list
        expect(fn() => $this->expertise->syncTerms([$this->expertiseTerm->id]))
            ->toThrow(InvalidArgumentException::class);
    });

    test('throws exception for terms from wrong model taxonomy', function () {
        expect(fn() => $this->expertise->syncTerms([$this->blogTerm->id]))
            ->toThrow(InvalidArgumentException::class, 'cannot be used with Expertise model');
    });

    test('allows empty array', function () {
        expect(fn() => $this->expertise->syncTerms([]))
            ->not->toThrow(InvalidArgumentException::class);
    });

    test('exception message includes taxonomy name', function () {
        try {
            $this->expertise->syncTerms([$this->blogTerm->id]);
            expect(false)->toBeTrue(); // Should not reach here
        } catch (InvalidArgumentException $e) {
            expect($e->getMessage())
                ->toContain('Technology')
                ->toContain('Blog Categories')
                ->toContain('Expertise model');
        }
    });

    test('exception message shows which models taxonomy is bound to', function () {
        try {
            $this->expertise->syncTerms([$this->blogTerm->id]);
            expect(false)->toBeTrue(); // Should not reach here
        } catch (InvalidArgumentException $e) {
            expect($e->getMessage())->toContain('bound to: Blog');
        }
    });
});

describe('attachTerms validation', function () {
    test('validates terms before attaching', function () {
        expect(fn() => $this->expertise->attachTerms([$this->blogTerm->id]))
            ->toThrow(InvalidArgumentException::class);
    });

    test('allows valid terms', function () {
        expect(fn() => $this->expertise->attachTerms([$this->sharedTerm->id]))
            ->not->toThrow(InvalidArgumentException::class);
    });
});

describe('syncTermsByTaxonomy validation', function () {
    test('validates taxonomy is available for model', function () {
        expect(fn() => $this->expertise->syncTermsByTaxonomy('blog-categories', [$this->blogTerm->id]))
            ->toThrow(InvalidArgumentException::class, 'not available for Expertise model');
    });

    test('validates term IDs', function () {
        expect(fn() => $this->expertise->syncTermsByTaxonomy('expertise-categories', [$this->blogTerm->id]))
            ->toThrow(InvalidArgumentException::class);
    });

    test('allows valid taxonomy and terms', function () {
        expect(fn() => $this->expertise->syncTermsByTaxonomy('expertise-categories', [$this->sharedTerm->id]))
            ->not->toThrow(InvalidArgumentException::class);
    });
});

describe('detachTerms', function () {
    test('does not validate on detach', function () {
        // First attach a valid term
        $this->expertise->syncTerms([$this->sharedTerm->id]);

        // Detaching should not validate
        expect(fn() => $this->expertise->detachTerms([$this->sharedTerm->id]))
            ->not->toThrow(InvalidArgumentException::class);
    });
});

describe('mixed term scenarios', function () {
    test('validates all terms in array', function () {
        $termIds = [$this->sharedTerm->id, $this->blogTerm->id];

        expect(fn() => $this->expertise->syncTerms($termIds))
            ->toThrow(InvalidArgumentException::class);
    });

    test('allows multiple valid terms from same taxonomy', function () {
        // Create another term in the shared taxonomy
        $sharedTerm2 = TaxonomyTerm::factory()->create([
            'taxonomy_id' => $this->sharedTaxonomy->id,
            'name' => 'Another Shared Term',
        ]);

        $termIds = [$this->sharedTerm->id, $sharedTerm2->id];

        expect(fn() => $this->expertise->syncTerms($termIds))
            ->not->toThrow(InvalidArgumentException::class);

        expect($this->expertise->taxonomyTerms()->count())->toBe(2);
    });
});
