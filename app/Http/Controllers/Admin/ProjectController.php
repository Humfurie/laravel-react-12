<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Image;
use App\Models\Project;
use App\Services\ImageService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;

class ProjectController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private ImageService $imageService
    )
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Project::class);

        $projects = Project::query()
            ->withTrashed()
            ->with(['primaryImage'])
            ->orderBy('sort_order')
            ->orderBy('updated_at', 'desc')
            ->paginate(12);

        return Inertia::render('admin/projects/index', [
            'projects' => $projects,
            'categories' => Project::getCategories(),
            'statuses' => Project::getStatuses(),
            'can' => [
                'create' => auth()->user()->can('create', Project::class),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @throws Throwable
     */
    public function store(StoreProjectRequest $request)
    {
        $this->authorize('create', Project::class);

        $validated = $request->validated();

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Set featured_at if marking as featured
        if (!empty($validated['is_featured'])) {
            $validated['featured_at'] = now();
        }

        $project = DB::transaction(function () use ($validated, $request) {
            $project = Project::create($validated);

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                $this->imageService->upload(
                    $request->file('thumbnail'),
                    $project,
                    'project-images',
                    true // isPrimary
                );
            }

            return $project;
        });

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project created successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Project::class);

        return Inertia::render('admin/projects/create', [
            'categories' => Project::getCategories(),
            'statuses' => Project::getStatuses(),
            'ownershipTypes' => Project::getOwnershipTypes(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        $this->authorize('update', $project);

        $project->load(['images' => fn($q) => $q->ordered()]);

        return Inertia::render('admin/projects/edit', [
            'project' => $project,
            'categories' => Project::getCategories(),
            'statuses' => Project::getStatuses(),
            'ownershipTypes' => Project::getOwnershipTypes(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @throws Throwable
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validated();

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Set featured_at if marking as featured for the first time
        if (!empty($validated['is_featured']) && !$project->is_featured) {
            $validated['featured_at'] = now();
        }

        DB::transaction(function () use ($project, $validated, $request) {
            $project->update($validated);

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                $this->imageService->upload(
                    $request->file('thumbnail'),
                    $project,
                    'project-images',
                    true // isPrimary
                );
            }
        });

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $this->authorize('delete', $project);

        $project->delete();

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project deleted successfully.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $slug)
    {
        $project = Project::withTrashed()->where('slug', $slug)->firstOrFail();
        $this->authorize('restore', $project);

        $project->restore();

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project restored successfully.');
    }

    /**
     * Force delete the specified resource from storage.
     */
    public function forceDestroy(string $slug)
    {
        $project = Project::withTrashed()->where('slug', $slug)->firstOrFail();
        $this->authorize('forceDelete', $project);

        // Delete all associated images
        foreach ($project->images as $image) {
            $this->imageService->delete($image);
        }

        $project->forceDelete();

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project permanently deleted successfully.');
    }

    /**
     * Upload images to the project gallery.
     */
    public function uploadImage(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $images = $this->imageService->uploadMultiple(
            $request->file('images'),
            $project,
            'project-images'
        );

        return back()->with('success', count($images) . ' image(s) uploaded successfully.');
    }

    /**
     * Delete an image from the project gallery.
     */
    public function deleteImage(Project $project, Image $image)
    {
        $this->authorize('update', $project);

        // Verify the image belongs to this project
        if ($image->imageable_type !== Project::class || $image->imageable_id !== $project->id) {
            abort(403, 'Image does not belong to this project.');
        }

        $this->imageService->delete($image);

        return back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Set an image as the primary thumbnail.
     */
    public function setPrimaryImage(Project $project, Image $image)
    {
        $this->authorize('update', $project);

        // Verify the image belongs to this project
        if ($image->imageable_type !== Project::class || $image->imageable_id !== $project->id) {
            abort(403, 'Image does not belong to this project.');
        }

        $this->imageService->setPrimary($image);

        return back()->with('success', 'Primary image updated successfully.');
    }
}
