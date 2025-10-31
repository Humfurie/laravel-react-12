<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxonomyTermController extends Controller
{
    public function index(Request $request)
    {
        $query = TaxonomyTerm::with('taxonomy');

        if ($request->has('taxonomy_id')) {
            $query->where('taxonomy_id', $request->taxonomy_id);
        }

        $terms = $query->orderBy('order')->get();

        return Inertia::render('Admin/TaxonomyTerm/Index', [
            'terms' => $terms,
            'taxonomies' => Taxonomy::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'taxonomy_id' => 'required|exists:taxonomies,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
        ]);

        TaxonomyTerm::create($validated);

        return redirect()
            ->route('admin.taxonomy-terms.index', ['taxonomy_id' => $validated['taxonomy_id']])
            ->with('success', 'Term created successfully.');
    }

    public function create(Request $request)
    {
        $taxonomies = Taxonomy::all();

        return Inertia::render('Admin/TaxonomyTerm/Create', [
            'taxonomies' => $taxonomies,
            'selectedTaxonomyId' => $request->taxonomy_id,
        ]);
    }

    public function show(TaxonomyTerm $taxonomyTerm)
    {
        $taxonomyTerm->load('taxonomy');

        return Inertia::render('Admin/TaxonomyTerm/Show', [
            'term' => $taxonomyTerm,
        ]);
    }

    public function edit(TaxonomyTerm $taxonomyTerm)
    {
        $taxonomyTerm->load('taxonomy');

        return Inertia::render('Admin/TaxonomyTerm/Edit', [
            'term' => $taxonomyTerm,
            'taxonomies' => Taxonomy::all(),
        ]);
    }

    public function update(Request $request, TaxonomyTerm $taxonomyTerm)
    {
        $validated = $request->validate([
            'taxonomy_id' => 'required|exists:taxonomies,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
        ]);

        $taxonomyTerm->update($validated);

        return redirect()
            ->route('admin.taxonomy-terms.index', ['taxonomy_id' => $validated['taxonomy_id']])
            ->with('success', 'Term updated successfully.');
    }

    public function destroy(TaxonomyTerm $taxonomyTerm)
    {
        $taxonomyId = $taxonomyTerm->taxonomy_id;
        $taxonomyTerm->delete();

        return redirect()
            ->route('admin.taxonomy-terms.index', ['taxonomy_id' => $taxonomyId])
            ->with('success', 'Term deleted successfully.');
    }
}
