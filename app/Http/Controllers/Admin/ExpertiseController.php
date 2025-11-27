<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expertise;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

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

        return Inertia::render('admin/expertise/index', [
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
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = $file->getClientOriginalName();

            // Store in MinIO images/techstack directory
            $path = $file->storeAs('images/techstack', $filename, 'minio');
            $validated['image'] = Storage::disk('minio')->url($path);
        }

        Expertise::create($validated);

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

        $categories = [
            ['name' => 'Backend', 'slug' => 'be'],
            ['name' => 'Frontend', 'slug' => 'fe'],
            ['name' => 'Tools & DevOps', 'slug' => 'td'],
        ];

        return Inertia::render('admin/expertise/create', [
            'categories' => $categories,
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

        return Inertia::render('admin/expertise/edit', [
            'expertise' => $expertise,
            'categories' => $categories,
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
        ]);

        // Handle image upload if file is provided
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = $file->getClientOriginalName();

            // Store in MinIO images/techstack directory
            $path = $file->storeAs('images/techstack', $filename, 'minio');
            $validated['image'] = Storage::disk('minio')->url($path);
        }

        $expertise->update($validated);

        return redirect()
            ->route('admin.expertises.index')
            ->with('success', 'Expertise updated successfully.');
    }
}
