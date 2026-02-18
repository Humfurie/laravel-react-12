<?php

namespace App\Mcp\Tools\Blog;

use App\Models\Blog;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class ListBlogs extends Tool
{
    public function description(): string
    {
        return 'List blog posts with optional filtering by status, tag, and pagination.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('status')->description('Filter by status: draft, published, private')
            ->string('tag')->description('Filter by tag name')
            ->string('search')->description('Search in title and content')
            ->integer('page')->description('Page number (default: 1)')
            ->integer('per_page')->description('Items per page (default: 15, max: 50)');
    }

    public function handle(array $arguments): ToolResult
    {
        $query = Blog::query()->with('image');

        if (isset($arguments['status'])) {
            $query->where('status', $arguments['status']);
        }

        if (isset($arguments['tag'])) {
            $query->whereJsonContains('tags', $arguments['tag']);
        }

        if (isset($arguments['search'])) {
            $search = $arguments['search'];
            $query->where(fn ($q) => $q->where('title', 'ilike', "%{$search}%")
                ->orWhere('content', 'ilike', "%{$search}%"));
        }

        $perPage = min($arguments['per_page'] ?? 15, 50);
        $blogs = $query->orderByDesc('published_at')->paginate($perPage, ['*'], 'page', $arguments['page'] ?? 1);

        return ToolResult::json([
            'data' => $blogs->map(fn ($blog) => [
                'id' => $blog->id,
                'title' => $blog->title,
                'slug' => $blog->slug,
                'status' => $blog->status,
                'excerpt' => $blog->getRawOriginal('excerpt') ?: str($blog->content)->limit(160)->toString(),
                'tags' => $blog->tags,
                'view_count' => $blog->view_count,
                'published_at' => $blog->published_at?->toIso8601String(),
                'image_url' => $blog->image_url,
            ])->toArray(),
            'meta' => [
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
                'total' => $blogs->total(),
                'per_page' => $blogs->perPage(),
            ],
        ]);
    }
}
