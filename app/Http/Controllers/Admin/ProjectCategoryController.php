<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderProjectCategoriesRequest;
use App\Http\Requests\StoreProjectCategoryRequest;
use App\Http\Requests\UpdateProjectCategoryRequest;
use App\Models\ProjectCategory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectCategoryController extends Controller
{
    use AuthorizesRequests;

    #[Authorize('viewAny', ProjectCategory::class)]
    public function index(): Response
    {
        $categories = ProjectCategory::ordered()
            ->withCount('projects')
            ->get();

        return Inertia::render('admin/project-categories/index', [
            'categories' => $categories,
        ]);
    }

    #[Authorize('create', ProjectCategory::class)]
    public function store(StoreProjectCategoryRequest $request): RedirectResponse
    {
        ProjectCategory::create($request->validated());

        return redirect()
            ->route('admin.project-categories.index')
            ->with('success', 'Category created successfully.');
    }

    #[Authorize('update', 'projectCategory')]
    public function update(UpdateProjectCategoryRequest $request, ProjectCategory $projectCategory): RedirectResponse
    {
        $projectCategory->update($request->validated());

        return redirect()
            ->route('admin.project-categories.index')
            ->with('success', 'Category updated successfully.');
    }

    #[Authorize('delete', 'projectCategory')]
    public function destroy(ProjectCategory $projectCategory): RedirectResponse
    {
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

    #[Authorize('viewAny', ProjectCategory::class)]
    public function reorder(ReorderProjectCategoriesRequest $request): RedirectResponse
    {
        // Authorization handled by route middleware (permission:project,update)
        // Additional check for viewAny since this is a bulk operation
        $items = $request->validated()['items'];

        // Use Eloquent within transaction for safe batch updates
        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                ProjectCategory::where('id', $item['id'])
                    ->update(['sort_order' => $item['sort_order']]);
            }
        });

        return back()->with('success', 'Category order updated successfully.');
    }
}
