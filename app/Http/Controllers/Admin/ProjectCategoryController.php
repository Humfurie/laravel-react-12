<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderProjectCategoriesRequest;
use App\Http\Requests\StoreProjectCategoryRequest;
use App\Http\Requests\UpdateProjectCategoryRequest;
use App\Models\ProjectCategory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectCategoryController extends Controller
{
    use AuthorizesRequests;

    public function index(): Response
    {
        $this->authorize('viewAny', ProjectCategory::class);

        $categories = ProjectCategory::ordered()
            ->withCount('projects')
            ->get();

        return Inertia::render('admin/project-categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreProjectCategoryRequest $request): RedirectResponse
    {
        ProjectCategory::create($request->validated());

        return redirect()
            ->route('admin.project-categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function update(UpdateProjectCategoryRequest $request, ProjectCategory $projectCategory): RedirectResponse
    {
        $projectCategory->update($request->validated());

        return redirect()
            ->route('admin.project-categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(ProjectCategory $projectCategory): RedirectResponse
    {
        $this->authorize('delete', $projectCategory);

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

    public function reorder(ReorderProjectCategoriesRequest $request): RedirectResponse
    {
        foreach ($request->validated()['items'] as $item) {
            ProjectCategory::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Category order updated successfully.');
    }
}
