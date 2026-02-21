<?php

namespace App\Mcp\Tools\Blog;

use App\Models\Blog;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class GetBlog extends Tool
{
    public function description(): string
    {
        return 'Get a single blog post by ID or slug, including full content.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Blog ID')
            ->string('slug')->description('Blog slug (alternative to ID)');
    }

    public function handle(array $arguments): ToolResult
    {
        if (! isset($arguments['id']) && ! isset($arguments['slug'])) {
            return ToolResult::error('Either id or slug is required.');
        }

        $blog = isset($arguments['id'])
            ? Blog::with('image')->find($arguments['id'])
            : Blog::with('image')->where('slug', $arguments['slug'])->first();

        if (! $blog) {
            return ToolResult::error('Blog not found.');
        }

        return ToolResult::json([
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
