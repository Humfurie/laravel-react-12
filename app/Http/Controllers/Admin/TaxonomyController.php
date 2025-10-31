<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Taxonomy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxonomyController extends Controller
{
    public function index()
    {
        $taxonomies = Taxonomy::withCount('terms')
            ->with('models')
            ->latest()
            ->get()
            ->map(function ($taxonomy) {
                return [
                    'id' => $taxonomy->id,
                    'name' => $taxonomy->name,
                    'slug' => $taxonomy->slug,
                    'description' => $taxonomy->description,
                    'terms_count' => $taxonomy->terms_count,
                    'model_names' => $taxonomy->getModelNames(),
                    'is_shared' => !$taxonomy->isBoundToModels(),
                    'created_at' => $taxonomy->created_at,
                    'updated_at' => $taxonomy->updated_at,
                ];
            });

        return Inertia::render('Admin/Taxonomy/Index', [
            'taxonomies' => $taxonomies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:taxonomies',
            'description' => 'nullable|string',
            'model_classes' => 'nullable|array',
            'model_classes.*' => 'string|in:' . implode(',', array_keys($this->getAvailableModels())),
        ]);

        $taxonomy = Taxonomy::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        // Sync model bindings if provided
        if (!empty($validated['model_classes'])) {
            foreach ($validated['model_classes'] as $modelClass) {
                $taxonomy->models()->create(['model_class' => $modelClass]);
            }
        }

        return redirect()
            ->route('admin.taxonomies.index')
            ->with('success', 'Taxonomy created successfully.');
    }

    /**
     * Get available models that can be bound to taxonomies.
     *
     * @return array Array of model class => display name
     */
    protected function getAvailableModels(): array
    {
        return [
            'App\\Models\\Blog' => 'Blog',
            'App\\Models\\Expertise' => 'Expertise',
            // Add more models here as needed
        ];
    }

    public function create()
    {
        $availableModels = $this->getAvailableModels();

        return Inertia::render('Admin/Taxonomy/Create', [
            'availableModels' => $availableModels,
        ]);
    }

    public function show(Taxonomy $taxonomy)
    {
        $taxonomy->load('terms');

        return Inertia::render('Admin/Taxonomy/Show', [
            'taxonomy' => $taxonomy,
        ]);
    }

    public function edit(Taxonomy $taxonomy)
    {
        $taxonomy->load('models');
        $availableModels = $this->getAvailableModels();

        return Inertia::render('Admin/Taxonomy/Edit', [
            'taxonomy' => [
                'id' => $taxonomy->id,
                'name' => $taxonomy->name,
                'slug' => $taxonomy->slug,
                'description' => $taxonomy->description,
                'model_classes' => $taxonomy->getModelClasses(),
            ],
            'availableModels' => $availableModels,
        ]);
    }

    public function update(Request $request, Taxonomy $taxonomy)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:taxonomies,name,' . $taxonomy->id,
            'description' => 'nullable|string',
            'model_classes' => 'nullable|array',
            'model_classes.*' => 'string|in:' . implode(',', array_keys($this->getAvailableModels())),
        ]);

        $taxonomy->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        // Sync model bindings
        $taxonomy->models()->delete(); // Remove existing bindings
        if (!empty($validated['model_classes'])) {
            foreach ($validated['model_classes'] as $modelClass) {
                $taxonomy->models()->create(['model_class' => $modelClass]);
            }
        }

        return redirect()
            ->route('admin.taxonomies.index')
            ->with('success', 'Taxonomy updated successfully.');
    }

    public function destroy(Taxonomy $taxonomy)
    {
        $taxonomy->delete();

        return redirect()
            ->route('admin.taxonomies.index')
            ->with('success', 'Taxonomy deleted successfully.');
    }
}
