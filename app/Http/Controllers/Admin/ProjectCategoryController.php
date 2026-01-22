<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProjectCategory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectCategoryController extends Controller
{
    use AuthorizesRequests;

    public function index(): Response
    {
        $categories = ProjectCategory::ordered()
            ->withCount('projects')
            ->get();

        return Inertia::render('admin/project-categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:project_categories,slug',
            'description' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        ProjectCategory::create($validated);

        return redirect()
            ->route('admin.project-categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function update(Request $request, ProjectCategory $projectCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:project_categories,slug,'.$projectCategory->id,
            'description' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $projectCategory->update($validated);

        return redirect()
            ->route('admin.project-categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(ProjectCategory $projectCategory): RedirectResponse
    {
        // Check if category has projects
        if ($projectCategory->projects()->exists()) {
            return redirect()
                ->route('admin.project-categories.index')
                ->with('error', 'Cannot delete category with associated projects.');
        }

        $projectCategory->delete();

        return redirect()
            ->route('admin.project-categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:project_categories,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['items'] as $item) {
            ProjectCategory::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Category order updated successfully.');
    }
}
