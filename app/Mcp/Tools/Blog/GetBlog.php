<?php

namespace App\Mcp\Tools\Blog;

use App\Models\Blog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetBlog extends Tool
{
    public function description(): string
    {
        return 'Get a single blog post by ID or slug, including full content.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Blog ID'),
            'slug' => $schema->string()->description('Blog slug (alternative to ID)'),
        ];
    }

    public function handle(Request $request): Response
    {
        if (! $request->has('id') && ! $request->has('slug')) {
            return Response::error('Either id or slug is required.');
        }

        $blog = $request->has('id')
            ? Blog::with('image')->find($request->get('id'))
            : Blog::with('image')->where('slug', $request->get('slug'))->first();

        if (! $blog) {
            return Response::error('Blog not found.');
        }

        return Response::json([
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'content' => $blog->content,
            'excerpt' => $blog->getRawOriginal('excerpt'),
            'status' => $blog->status,
            'featured_image' => $blog->featured_image,
            'image_url' => $blog->image_url,
            'meta_data' => $blog->meta_data,
            'tags' => $blog->tags,
            'isPrimary' => $blog->isPrimary,
            'featured_until' => $blog->featured_until?->toIso8601String(),
            'sort_order' => $blog->sort_order,
            'view_count' => $blog->view_count,
            'published_at' => $blog->published_at?->toIso8601String(),
            'created_at' => $blog->created_at->toIso8601String(),
            'updated_at' => $blog->updated_at->toIso8601String(),
        ]);
    }
}
