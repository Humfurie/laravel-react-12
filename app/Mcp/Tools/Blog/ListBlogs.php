<?php

namespace App\Mcp\Tools\Blog;

use App\Models\Blog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListBlogs extends Tool
{
    public function description(): string
    {
        return 'List blog posts with optional filtering by status, tag, and pagination.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()->description('Filter by status: draft, published, private'),
            'tag' => $schema->string()->description('Filter by tag name'),
            'search' => $schema->string()->description('Search in title and content'),
            'page' => $schema->integer()->description('Page number (default: 1)'),
            'per_page' => $schema->integer()->description('Items per page (default: 15, max: 50)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $query = Blog::query()->with('image');

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('tag')) {
            $query->whereJsonContains('tags', $request->get('tag'));
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(fn ($q) => $q->where('title', 'ilike', "%{$search}%")
                ->orWhere('content', 'ilike', "%{$search}%"));
        }

        $perPage = min($request->get('per_page', 15), 50);
        $blogs = $query->orderByDesc('published_at')->paginate($perPage, ['*'], 'page', $request->get('page', 1));

        return Response::json([
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
