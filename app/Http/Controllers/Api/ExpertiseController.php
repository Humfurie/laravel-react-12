<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expertise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ExpertiseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Expertise::query();

        // Filter by category if provided
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        } else {
            // By default, only return active items for public API
            $query->active();
        }

        $expertises = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $expertises,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
            'image_path' => 'nullable|string', // For manual path entry
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
        } elseif ($request->filled('image_path')) {
            // Use manually provided path
            $validated['image'] = $request->image_path;
        }

        $expertise = Expertise::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Expertise created successfully',
            'data' => $expertise,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Expertise $expertise): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $expertise,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expertise $expertise): JsonResponse
    {
        // Delete image file if it exists and is stored locally
        if ($expertise->image && !str_starts_with($expertise->image, 'http')) {
            $imagePath = str_replace('storage/', '', $expertise->image);
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
        }

        $expertise->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expertise deleted successfully',
        ]);
    }

    /**
     * Bulk update order of expertises
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:expertises,id',
            'items.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['items'] as $item) {
            Expertise::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Expertises reordered successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Expertise $expertise): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
            'image_path' => 'nullable|string',
            'category_slug' => ['sometimes', 'required', 'string', Rule::in(['be', 'fe', 'td'])],
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        // Handle image upload if file is provided
        if ($request->hasFile('image')) {
            // Delete old image if it exists and is stored locally
            if ($expertise->image && !str_starts_with($expertise->image, 'http')) {
                $oldPath = str_replace('storage/', '', $expertise->image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $file = $request->file('image');
            $filename = $file->getClientOriginalName();

            // Store in MinIO images/techstack directory
            $path = $file->storeAs('images/techstack', $filename, 'minio');
            $validated['image'] = Storage::disk('minio')->url($path);
        } elseif ($request->filled('image_path')) {
            $validated['image'] = $request->image_path;
        }

        $expertise->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Expertise updated successfully',
            'data' => $expertise->fresh(),
        ]);
    }

    /**
     * Get categories
     */
    public function categories(): JsonResponse
    {
        $categories = [
            ['name' => 'Backend', 'slug' => 'be'],
            ['name' => 'Frontend', 'slug' => 'fe'],
            ['name' => 'Tools & DevOps', 'slug' => 'td'],
        ];

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
