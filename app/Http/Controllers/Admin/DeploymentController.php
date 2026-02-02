<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeploymentRequest;
use App\Http\Requests\UpdateDeploymentRequest;
use App\Models\Deployment;
use App\Models\Image;
use App\Models\Project;
use App\Services\ImageService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;

class DeploymentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private ImageService $imageService
    ) {}

    public function index()
    {
        $this->authorize('viewAny', Deployment::class);

        $deployments = Deployment::query()
            ->withTrashed()
            ->with(['primaryImage', 'project:id,title'])
            ->orderBy('sort_order')
            ->orderBy('updated_at', 'desc')
            ->paginate(12);

        return Inertia::render('admin/deployments/index', [
            'deployments' => $deployments,
            'statuses' => Deployment::getStatuses(),
            'clientTypes' => Deployment::getClientTypes(),
            'can' => [
                'create' => auth()->user()->can('create', Deployment::class),
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Deployment::class);

        $projects = Project::query()
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        return Inertia::render('admin/deployments/create', [
            'statuses' => Deployment::getStatuses(),
            'clientTypes' => Deployment::getClientTypes(),
            'projects' => $projects,
        ]);
    }

    /**
     * @throws Throwable
     */
    public function store(StoreDeploymentRequest $request)
    {
        $this->authorize('create', Deployment::class);

        $validated = $request->validated();

        $deployment = DB::transaction(function () use ($validated, $request) {
            $deployment = Deployment::create($validated);

            if ($request->hasFile('thumbnail')) {
                $this->imageService->upload(
                    $request->file('thumbnail'),
                    $deployment,
                    'deployment-images',
                    true
                );
            }

            return $deployment;
        });

        return redirect()->route('admin.deployments.index')
            ->with('success', 'Deployment created successfully.');
    }

    public function edit(Deployment $deployment)
    {
        $this->authorize('update', $deployment);

        $deployment->load(['images' => fn ($q) => $q->ordered()]);

        $projects = Project::query()
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        return Inertia::render('admin/deployments/edit', [
            'deployment' => $deployment,
            'statuses' => Deployment::getStatuses(),
            'clientTypes' => Deployment::getClientTypes(),
            'projects' => $projects,
        ]);
    }

    /**
     * @throws Throwable
     */
    public function update(UpdateDeploymentRequest $request, Deployment $deployment)
    {
        $this->authorize('update', $deployment);

        $validated = $request->validated();

        DB::transaction(function () use ($deployment, $validated, $request) {
            $deployment->update($validated);

            if ($request->hasFile('thumbnail')) {
                $this->imageService->upload(
                    $request->file('thumbnail'),
                    $deployment,
                    'deployment-images',
                    true
                );
            }
        });

        return redirect()->route('admin.deployments.index')
            ->with('success', 'Deployment updated successfully.');
    }

    public function destroy(Deployment $deployment)
    {
        $this->authorize('delete', $deployment);

        $deployment->delete();

        return redirect()->route('admin.deployments.index')
            ->with('success', 'Deployment deleted successfully.');
    }

    public function restore(string $slug)
    {
        $deployment = Deployment::withTrashed()->where('slug', $slug)->firstOrFail();
        $this->authorize('restore', $deployment);

        $deployment->restore();

        return redirect()->route('admin.deployments.index')
            ->with('success', 'Deployment restored successfully.');
    }

    public function forceDestroy(string $slug)
    {
        $deployment = Deployment::withTrashed()->where('slug', $slug)->firstOrFail();
        $this->authorize('forceDelete', $deployment);

        DB::transaction(function () use ($deployment) {
            $deployment->load('images');

            foreach ($deployment->images as $image) {
                $this->imageService->delete($image);
            }

            $deployment->forceDelete();
        });

        return redirect()->route('admin.deployments.index')
            ->with('success', 'Deployment permanently deleted successfully.');
    }

    public function uploadImage(Request $request, Deployment $deployment)
    {
        $this->authorize('update', $deployment);

        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $images = $this->imageService->uploadMultiple(
            $request->file('images'),
            $deployment,
            'deployment-images'
        );

        return back()->with('success', count($images).' image(s) uploaded successfully.');
    }

    public function deleteImage(Deployment $deployment, Image $image)
    {
        $this->authorize('update', $deployment);

        if ($image->imageable_type !== Deployment::class || $image->imageable_id !== $deployment->id) {
            abort(403, 'Image does not belong to this deployment.');
        }

        $this->imageService->delete($image);

        return back()->with('success', 'Image deleted successfully.');
    }

    public function setPrimaryImage(Deployment $deployment, Image $image)
    {
        $this->authorize('update', $deployment);

        if ($image->imageable_type !== Deployment::class || $image->imageable_id !== $deployment->id) {
            abort(403, 'Image does not belong to this deployment.');
        }

        $this->imageService->setPrimary($image);

        return back()->with('success', 'Primary image updated successfully.');
    }
}
