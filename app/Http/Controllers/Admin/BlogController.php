<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;

class BlogController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Blog::class);

        $blogs = Blog::query()
            ->withTrashed()
            ->orderBy('updated_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/blog', [
            'blogs' => $blogs,
            'can' => [
                'create' => auth()->user()->can('create', Blog::class),
                'update' => true, // Will be checked per blog item
                'delete' => true, // Will be checked per blog item
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Blog::class);

        return Inertia::render('admin/blog/create');
    }

    /**
     * @throws Throwable
     */
    public function store(StoreBlogRequest $request)
    {
        $this->authorize('create', Blog::class);

        $validated = $request->validated();

        // Handle file upload if present
        if ($request->hasFile('featured_image_file')) {
            $image = $request->file('featured_image_file');
            $filename = $this->generateUniqueFilename($image);
            $path = $image->storeAs('blog-images', $filename, 'minio');

            if ($path === false) {
                return back()->withErrors(['featured_image_file' => 'Failed to upload image. Please try again.']);
            }

            $validated['featured_image'] = '/storage/'.$path;
        }

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Auto-generate meta data if not provided
        if (! isset($validated['meta_data'])) {
            $validated['meta_data'] = [];
        }
        if (empty($validated['meta_data']['meta_title'])) {
            $validated['meta_data']['meta_title'] = $validated['title'];
        }
        if (empty($validated['meta_data']['meta_keywords'])) {
            $validated['meta_data']['meta_keywords'] = $this->generateKeywords($validated['title']);
        }

        // Set published_at if status is published and no date is provided
        if ($validated['status'] === Blog::STATUS_PUBLISHED && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Clear featured_until if not marking as primary
        if (empty($validated['isPrimary'])) {
            $validated['featured_until'] = null;
        }

        $blog = DB::transaction(function () use ($validated) {
            return Blog::create($validated);
        });

        // Note: Cache is cleared automatically by BlogObserver

        return redirect()->route('blogs.index')
            ->with('success', 'Blog created successfully.');
    }

    private function generateKeywords(string $title): string
    {
        return collect(explode(' ', strtolower($title)))
            ->filter(fn ($word) => strlen($word) > 2)
            ->map(fn ($word) => preg_replace('/[^a-z0-9]/', '', $word))
            ->filter()
            ->implode(', ');
    }

    /**
     * Generate a unique filename for uploaded images.
     */
    private function generateUniqueFilename(\Illuminate\Http\UploadedFile $file): string
    {
        return time().'_'.Str::random(10).'.'.$file->getClientOriginalExtension();
    }

    /**
     * Delete old image from MinIO storage (handles both URL formats).
     */
    private function deleteOldImage(string $imageUrl): void
    {
        // Handle /storage/ proxy path format
        if (str_starts_with($imageUrl, '/storage/blog-images/')) {
            $path = str_replace('/storage/', '', $imageUrl);

            // Prevent path traversal attacks
            if (str_contains($path, '..') || ! str_starts_with($path, 'blog-images/')) {
                Log::warning('Potential path traversal attempt blocked', ['url' => $imageUrl]);

                return;
            }

            Storage::disk('minio')->delete($path);

            return;
        }

        // Handle direct MinIO URL format (legacy)
        if (preg_match('#^https?://[^/]+/laravel-uploads/(.+)$#', $imageUrl, $matches)) {
            $extractedPath = $matches[1];

            // Prevent path traversal attacks
            if (str_contains($extractedPath, '..')) {
                Log::warning('Potential path traversal attempt blocked', ['url' => $imageUrl]);

                return;
            }

            Storage::disk('minio')->delete($extractedPath);

            return;
        }

        // Log unrecognized format for debugging
        Log::warning('Unrecognized blog image URL format, could not delete', ['url' => $imageUrl]);
    }

    public function edit(Blog $blog)
    {
        $this->authorize('update', $blog);

        return Inertia::render('admin/blog/edit', [
            'blog' => $blog,
        ]);
    }

    /**
     * @throws Throwable
     */
    public function update(UpdateBlogRequest $request, Blog $blog)
    {
        $this->authorize('update', $blog);

        $validated = $request->validated();
        $oldImage = null;

        // Handle file upload if present - upload FIRST, delete old image AFTER transaction
        if ($request->hasFile('featured_image_file')) {
            $image = $request->file('featured_image_file');
            $filename = $this->generateUniqueFilename($image);
            $path = $image->storeAs('blog-images', $filename, 'minio');

            if ($path === false) {
                return back()->withErrors(['featured_image_file' => 'Failed to upload image. Please try again.']);
            }

            // Store old image path to delete after successful transaction
            $oldImage = $blog->featured_image;
            $validated['featured_image'] = '/storage/'.$path;
        }

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Set published_at if changing to published status and no date is provided
        if ($validated['status'] === Blog::STATUS_PUBLISHED &&
            $blog->status !== Blog::STATUS_PUBLISHED &&
            empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Clear featured_until if not marking as primary
        if (empty($validated['isPrimary'])) {
            $validated['featured_until'] = null;
        }

        DB::transaction(function () use ($blog, $validated) {
            $blog->update($validated);
        });

        // Delete old image only after successful transaction
        if ($oldImage) {
            $this->deleteOldImage($oldImage);
        }

        // Note: Cache is cleared automatically by BlogObserver

        return redirect()->route('blogs.index')
            ->with('success', 'Blog updated successfully.');
    }

    public function destroy(Blog $blog)
    {
        $this->authorize('delete', $blog);

        $blog->delete();

        return redirect()->route('blogs.index')
            ->with('success', 'Blog deleted successfully.');
    }

    public function restore($slug)
    {
        $blog = Blog::withTrashed()->where('slug', $slug)->firstOrFail();
        $this->authorize('restore', $blog);

        $blog->restore();

        return redirect()->route('blogs.index')
            ->with('success', 'Blog restored successfully.');
    }

    public function forceDestroy($slug)
    {
        $blog = Blog::withTrashed()->where('slug', $slug)->firstOrFail();
        $this->authorize('forceDelete', $blog);

        $blog->forceDelete();

        return redirect()->route('blogs.index')
            ->with('success', 'Blog permanently deleted successfully.');
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = $this->generateUniqueFilename($image);
            $path = $image->storeAs('blog-images', $filename, 'minio');

            if ($path === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to upload image to storage.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'url' => '/storage/'.$path,
                'path' => $path,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image file provided',
        ], 400);
    }
}
