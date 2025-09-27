<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $blogs = Blog::query()
            ->withTrashed()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/blog', [
            'blogs' => $blogs
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/blog/create');
    }

    /**
     * @throws \Throwable
     */
    public function store(StoreBlogRequest $request)
    {
        $validated = $request->validated();

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Auto-generate meta data if not provided
        if (!isset($validated['meta_data'])) {
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

        DB::transaction(function () use ($validated) {
            Blog::create($validated);
        });

        return redirect()->route('blogs.index')
            ->with('success', 'Blog created successfully.');
    }

    private function generateKeywords(string $title): string
    {
        return collect(explode(' ', strtolower($title)))
            ->filter(fn($word) => strlen($word) > 2)
            ->map(fn($word) => preg_replace('/[^a-z0-9]/', '', $word))
            ->filter()
            ->implode(', ');
    }


    public function edit(Blog $blog)
    {
        return Inertia::render('admin/blog/edit', [
            'blog' => $blog
        ]);
    }

    /**
     * @throws \Throwable
     */
    public function update(UpdateBlogRequest $request, Blog $blog)
    {
        $validated = $request->validated();

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

        DB::transaction(function () use ($blog, $validated) {
            $blog->update($validated);
        });

        return redirect()->route('blogs.index')
            ->with('success', 'Blog updated successfully.');
    }

    public function destroy(Blog $blog)
    {
        $blog->delete();

        return redirect()->route('blogs.index')
            ->with('success', 'Blog deleted successfully.');
    }

    public function restore($slug)
    {
        $blog = Blog::withTrashed()->where('slug', $slug)->firstOrFail();
        $blog->restore();

        return redirect()->route('blogs.index')
            ->with('success', 'Blog restored successfully.');
    }

    public function forceDestroy($slug)
    {
        $blog = Blog::withTrashed()->where('slug', $slug)->firstOrFail();
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

            // Create unique filename
            $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();

            // Store in public/blog-images directory
            $path = $image->storeAs('blog-images', $filename, 'public');

            // Return the full URL
            $url = Storage::url($path);

            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image file provided'
        ], 400);
    }
}
