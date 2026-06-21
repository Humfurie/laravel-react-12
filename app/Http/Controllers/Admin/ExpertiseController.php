<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expertise;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExpertiseController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    #[Authorize('viewAny', Expertise::class)]
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'in:all,be,fe,td'],
        ]);

        $query = Expertise::query();

        if (! empty($validated['search'])) {
            $query->whereLike('name', '%'.$validated['search'].'%');
        }

        if (! empty($validated['category']) && $validated['category'] !== 'all') {
            $query->where('category_slug', $validated['category']);
        }

        $expertises = $query->ordered()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/expertise/index', [
            'expertises' => $expertises,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[Authorize('create', Expertise::class)]
    public function store(Request $request)
    {
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

            // Store in configured disk images/techstack directory
            $path = $file->storeAs('images/techstack', $filename, config('filesystems.default'));
            $validated['image'] = Storage::disk(config('filesystems.default'))->url($path);
        }

        Expertise::create($validated);

        return redirect()
            ->route('admin.expertises.index')
            ->with('success', 'Expertise created successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    #[Authorize('create', Expertise::class)]
    public function create(): Response
    {
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
    #[Authorize('update', 'expertise')]
    public function edit(Expertise $expertise): Response
    {
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
    #[Authorize('delete', 'expertise')]
    public function destroy(Expertise $expertise)
    {
        $expertise->delete();

        return redirect()
            ->route('admin.expertises.index')
            ->with('success', 'Expertise deleted successfully.');
    }

    /**
     * Update the order of expertises.
     */
    #[Authorize('update', Expertise::class)]
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
    #[Authorize('update', 'expertise')]
    public function update(Request $request, Expertise $expertise)
    {
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

            // Store in configured disk images/techstack directory
            $path = $file->storeAs('images/techstack', $filename, config('filesystems.default'));
            $validated['image'] = Storage::disk(config('filesystems.default'))->url($path);
        }

        $expertise->update($validated);

        return redirect()
            ->route('admin.expertises.index')
            ->with('success', 'Expertise updated successfully.');
    }
}
