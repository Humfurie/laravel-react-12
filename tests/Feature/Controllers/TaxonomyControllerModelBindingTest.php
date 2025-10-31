<?php

use App\Models\Taxonomy;
use App\Models\TaxonomyModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create or get admin user (ID = 1 is admin in this app)
    $this->user = User::find(1) ?? User::factory()->create(['id' => 1]);
    $this->actingAs($this->user);
});

describe('index', function () {
    test('displays model bindings in taxonomy list', function () {
        $taxonomy = Taxonomy::factory()->create();
        $taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
        $taxonomy->models()->create(['model_class' => 'App\\Models\\Expertise']);

        $response = $this->get(route('admin.taxonomies.index'));

        $response->assertInertia(fn($page) => $page
            ->component('Admin/Taxonomy/Index')
            ->has('taxonomies', 1)
            ->where('taxonomies.0.model_names', ['Blog', 'Expertise'])
            ->where('taxonomies.0.is_shared', false)
        );
    });

    test('marks unbound taxonomy as shared', function () {
        $taxonomy = Taxonomy::factory()->create();

        $response = $this->get(route('admin.taxonomies.index'));

        $response->assertInertia(fn($page) => $page
            ->where('taxonomies.0.is_shared', true)
            ->where('taxonomies.0.model_names', [])
        );
    });
});

describe('create', function () {
    test('provides available models list', function () {
        $response = $this->get(route('admin.taxonomies.create'));

        $response->assertInertia(fn($page) => $page
            ->component('Admin/Taxonomy/Create')
            ->has('availableModels')
            ->where('availableModels', [
                'App\\Models\\Blog' => 'Blog',
                'App\\Models\\Expertise' => 'Expertise',
            ])
        );
    });
});

describe('store', function () {
    test('creates taxonomy without model bindings', function () {
        $response = $this->post(route('admin.taxonomies.store'), [
            'name' => 'Test Taxonomy',
            'description' => 'Test Description',
        ]);

        $response->assertRedirect(route('admin.taxonomies.index'));

        $taxonomy = Taxonomy::where('name', 'Test Taxonomy')->first();
        expect($taxonomy)->not->toBeNull()
            ->and($taxonomy->isBoundToModels())->toBeFalse();
    });

    test('creates taxonomy with single model binding', function () {
        $response = $this->post(route('admin.taxonomies.store'), [
            'name' => 'Blog Categories',
            'description' => 'Categories for blogs',
            'model_classes' => ['App\\Models\\Blog'],
        ]);

        $response->assertRedirect(route('admin.taxonomies.index'));

        $taxonomy = Taxonomy::where('name', 'Blog Categories')->first();
        expect($taxonomy)->not->toBeNull()
            ->and($taxonomy->isBoundToModels())->toBeTrue()
            ->and($taxonomy->getModelClasses())->toBe(['App\\Models\\Blog']);
    });

    test('creates taxonomy with multiple model bindings', function () {
        $response = $this->post(route('admin.taxonomies.store'), [
            'name' => 'General Categories',
            'description' => 'Categories for multiple models',
            'model_classes' => ['App\\Models\\Blog', 'App\\Models\\Expertise'],
        ]);

        $response->assertRedirect(route('admin.taxonomies.index'));

        $taxonomy = Taxonomy::where('name', 'General Categories')->first();
        expect($taxonomy->models()->count())->toBe(2)
            ->and($taxonomy->getModelClasses())->toContain('App\\Models\\Blog')
            ->and($taxonomy->getModelClasses())->toContain('App\\Models\\Expertise');
    });

    test('validates model classes', function () {
        $response = $this->post(route('admin.taxonomies.store'), [
            'name' => 'Invalid Taxonomy',
            'model_classes' => ['App\\Models\\InvalidModel'],
        ]);

        $response->assertSessionHasErrors('model_classes.0');
    });

    test('allows empty model classes array', function () {
        $response = $this->post(route('admin.taxonomies.store'), [
            'name' => 'Shared Taxonomy',
            'model_classes' => [],
        ]);

        $response->assertRedirect(route('admin.taxonomies.index'));

        $taxonomy = Taxonomy::where('name', 'Shared Taxonomy')->first();
        expect($taxonomy->isBoundToModels())->toBeFalse();
    });
});

describe('edit', function () {
    test('provides current model bindings', function () {
        $taxonomy = Taxonomy::factory()->create();
        $taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
        $taxonomy->models()->create(['model_class' => 'App\\Models\\Expertise']);

        $response = $this->get(route('admin.taxonomies.edit', $taxonomy));

        $response->assertInertia(fn($page) => $page
            ->component('Admin/Taxonomy/Edit')
            ->has('taxonomy')
            ->where('taxonomy.model_classes', ['App\\Models\\Blog', 'App\\Models\\Expertise'])
            ->has('availableModels')
        );
    });

    test('provides empty array for unbound taxonomy', function () {
        $taxonomy = Taxonomy::factory()->create();

        $response = $this->get(route('admin.taxonomies.edit', $taxonomy));

        $response->assertInertia(fn($page) => $page
            ->where('taxonomy.model_classes', [])
        );
    });
});

describe('update', function () {
    test('updates model bindings', function () {
        $taxonomy = Taxonomy::factory()->create();
        $taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);

        $response = $this->put(route('admin.taxonomies.update', $taxonomy), [
            'name' => $taxonomy->name,
            'description' => $taxonomy->description,
            'model_classes' => ['App\\Models\\Expertise'],
        ]);

        $response->assertRedirect(route('admin.taxonomies.index'));

        $taxonomy->refresh();
        expect($taxonomy->models()->count())->toBe(1)
            ->and($taxonomy->getModelClasses())->toBe(['App\\Models\\Expertise']);
    });

    test('removes all bindings when empty array provided', function () {
        $taxonomy = Taxonomy::factory()->create();
        $taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
        $taxonomy->models()->create(['model_class' => 'App\\Models\\Expertise']);

        $response = $this->put(route('admin.taxonomies.update', $taxonomy), [
            'name' => $taxonomy->name,
            'description' => $taxonomy->description,
            'model_classes' => [],
        ]);

        $response->assertRedirect(route('admin.taxonomies.index'));

        $taxonomy->refresh();
        expect($taxonomy->isBoundToModels())->toBeFalse();
    });

    test('adds multiple new bindings', function () {
        $taxonomy = Taxonomy::factory()->create();

        $response = $this->put(route('admin.taxonomies.update', $taxonomy), [
            'name' => $taxonomy->name,
            'description' => $taxonomy->description,
            'model_classes' => ['App\\Models\\Blog', 'App\\Models\\Expertise'],
        ]);

        $response->assertRedirect(route('admin.taxonomies.index'));

        $taxonomy->refresh();
        expect($taxonomy->models()->count())->toBe(2);
    });
});

describe('destroy', function () {
    test('cascades delete to model bindings', function () {
        $taxonomy = Taxonomy::factory()->create();
        $binding = $taxonomy->models()->create(['model_class' => 'App\\Models\\Blog']);
        $bindingId = $binding->id;

        $response = $this->delete(route('admin.taxonomies.destroy', $taxonomy));

        $response->assertRedirect(route('admin.taxonomies.index'));

        expect(Taxonomy::find($taxonomy->id))->toBeNull()
            ->and(TaxonomyModel::find($bindingId))->toBeNull();
    });
});
