<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogLocation;
use App\Models\Image;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogLocationController extends Controller
{
    use AuthorizesRequests;

    /**
     * Store a new location for a blog.
     */
    public function store(Request $request, Blog $blog): JsonResponse
    {
        $this->authorize('update', $blog);

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:255',
        ]);

        // Get the next order number
        $maxOrder = $blog->locations()->max('order') ?? -1;
        $validated['order'] = $maxOrder + 1;

        $location = $blog->locations()->create($validated);

        return response()->json([
            'success' => true,
            'location' => $location->load('images'),
        ]);
    }

    /**
     * Update an existing location.
     */
    public function update(Request $request, Blog $blog, BlogLocation $location): JsonResponse
    {
        $this->authorize('update', $blog);

        // Ensure location belongs to blog
        if ($location->blog_id !== $blog->id) {
            abort(404);
        }

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:255',
        ]);

        $location->update($validated);

        return response()->json([
            'success' => true,
            'location' => $location->fresh()->load('images'),
        ]);
    }

    /**
     * Delete a location.
     */
    public function destroy(Blog $blog, BlogLocation $location): JsonResponse
    {
        $this->authorize('update', $blog);

        if ($location->blog_id !== $blog->id) {
            abort(404);
        }

        // Images will be deleted via cascade (soft delete location, hard delete images)
        $location->images()->each(fn($image) => $image->delete());
        $location->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Reorder locations.
     */
    public function reorder(Request $request, Blog $blog): JsonResponse
    {
        $this->authorize('update', $blog);

        $validated = $request->validate([
            'locations' => 'required|array',
            'locations.*.id' => 'required|integer|exists:blog_locations,id',
            'locations.*.order' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $blog) {
            foreach ($validated['locations'] as $locationData) {
                BlogLocation::where('id', $locationData['id'])
                    ->where('blog_id', $blog->id)
                    ->update(['order' => $locationData['order']]);
            }
        });

        return response()->json([
            'success' => true,
            'locations' => $blog->locations()->with('images')->get(),
        ]);
    }

    /**
     * Upload an image to a location.
     */
    public function uploadImage(Request $request, Blog $blog, BlogLocation $location): JsonResponse
    {
        $this->authorize('update', $blog);

        if ($location->blog_id !== $blog->id) {
            abort(404);
        }

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $file = $request->file('image');
        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('blog-location-images', $filename, 'minio');

        // Get the next order for images
        $maxOrder = $location->images()->max('order') ?? -1;

        // Determine if this should be primary (first image)
        $isPrimary = $location->images()->count() === 0;

        $image = $location->images()->create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'filename' => $filename,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'order' => $maxOrder + 1,
            'is_primary' => $isPrimary,
        ]);

        return response()->json([
            'success' => true,
            'image' => $image,
        ]);
    }

    /**
     * Delete an image from a location.
     */
    public function deleteImage(Blog $blog, BlogLocation $location, Image $image): JsonResponse
    {
        $this->authorize('update', $blog);

        if ($location->blog_id !== $blog->id) {
            abort(404);
        }

        // Verify image belongs to this location
        if ($image->imageable_id !== $location->id || $image->imageable_type !== BlogLocation::class) {
            abort(404);
        }

        $wasPrimary = $image->is_primary;
        $image->delete();

        // If deleted image was primary, set first remaining image as primary
        if ($wasPrimary) {
            $firstImage = $location->images()->first();
            if ($firstImage) {
                $firstImage->update(['is_primary' => true]);
            }
        }

        return response()->json(['success' => true]);
    }

    /**
     * Set an image as primary.
     */
    public function setPrimaryImage(Blog $blog, BlogLocation $location, Image $image): JsonResponse
    {
        $this->authorize('update', $blog);

        if ($location->blog_id !== $blog->id) {
            abort(404);
        }

        if ($image->imageable_id !== $location->id || $image->imageable_type !== BlogLocation::class) {
            abort(404);
        }

        $image->setPrimary();

        return response()->json([
            'success' => true,
            'image' => $image->fresh(),
        ]);
    }
}
