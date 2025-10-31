<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expertise;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class ExpertiseController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Expertise::class);

        $expertises = Expertise::ordered()->get();

        return Inertia::render('Admin/Expertise/Index', [
            'expertises' => $expertises,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Expertise::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
            'category_slug' => ['required', 'string', Rule::in(['be', 'fe', 'td'])],
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'term_ids' => 'nullable|array',
            'term_ids.*' => 'exists:taxonomy_terms,id',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = $file->getClientOriginalName();

            // Store in public/images/techstack directory
            $file->storeAs('images/techstack', $filename, 'public');
            $validated['image'] = 'storage/images/techstack/' . $filename;
        }

        $expertise = Expertise::create($validated);

        // Sync taxonomy terms
        if (!empty($validated['term_ids'])) {
            try {
                $expertise->syncTerms($validated['term_ids']);
            } catch (InvalidArgumentException $e) {
                // Delete the created expertise since term validation failed
                $expertise->delete();

                return back()->withErrors([
                    'term_ids' => $e->getMessage()
                ])->withInput();
            }
        }

        return redirect()
            ->route('admin.expertises.index')
            ->with('success', 'Expertise created successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Expertise::class);

        $expertise = new Expertise();

        $categories = [
            ['name' => 'Backend', 'slug' => 'be'],
            ['name' => 'Frontend', 'slug' => 'fe'],
            ['name' => 'Tools & DevOps', 'slug' => 'td'],
        ];

        return Inertia::render('Admin/Expertise/Create', [
            'categories' => $categories,
            'taxonomies' => $expertise->getConfiguredTaxonomies(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Expertise $expertise): Response
    {
        $this->authorize('update', $expertise);

        $categories = [
            ['name' => 'Backend', 'slug' => 'be'],
            ['name' => 'Frontend', 'slug' => 'fe'],
            ['name' => 'Tools & DevOps', 'slug' => 'td'],
        ];

        return Inertia::render('Admin/Expertise/Edit', [
            'expertise' => $expertise,
            'categories' => $categories,
            'taxonomies' => $expertise->getConfiguredTaxonomies(),
            'selectedTermIds' => $expertise->getAssignedTermIds(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expertise $expertise)
    {
        $this->authorize('delete', $expertise);

        $expertise->delete();

        return redirect()
            ->route('admin.expertises.index')
            ->with('success', 'Expertise deleted successfully.');
    }

    /**
     * Update the order of expertises.
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:expertises,id',
            'items.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['items'] as $item) {
            Expertise::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return back()->with('success', 'Expertise order updated successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Expertise $expertise)
    {
        $this->authorize('update', $expertise);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
            'category_slug' => ['required', 'string', Rule::in(['be', 'fe', 'td'])],
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'term_ids' => 'nullable|array',
            'term_ids.*' => 'exists:taxonomy_terms,id',
        ]);

        // Handle image upload if file is provided
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = $file->getClientOriginalName();

            // Store in public/images/techstack directory
            $file->storeAs('images/techstack', $filename, 'public');
            $validated['image'] = 'storage/images/techstack/' . $filename;
        }

        // Validate taxonomy terms BEFORE updating
        if (isset($validated['term_ids'])) {
            try {
                // Just validate without syncing yet
                $expertise->validateTermIds($validated['term_ids']);
            } catch (InvalidArgumentException $e) {
                return back()->withErrors([
                    'term_ids' => $e->getMessage()
                ])->withInput();
            }
        }

        $expertise->update($validated);

        // Now sync taxonomy terms (validation already passed)
        if (isset($validated['term_ids'])) {
            $expertise->syncTerms($validated['term_ids']);
        }

        return redirect()
            ->route('admin.expertises.index')
            ->with('success', 'Expertise updated successfully.');
    }
}
