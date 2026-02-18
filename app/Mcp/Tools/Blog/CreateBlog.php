<?php

namespace App\Mcp\Tools\Blog;

use App\Http\Requests\StoreBlogRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Blog;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class CreateBlog extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Create a new blog post. Required: title, content, status. Auto-generates slug if not provided.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('title')->description('Blog title')->required()
            ->string('content')->description('Blog content (HTML)')->required()
            ->string('status')->description('Status: draft, published, private')->required()
            ->string('slug')->description('URL slug (auto-generated from title if not provided)')
            ->string('excerpt')->description('Short excerpt (max 500 chars)')
            ->string('featured_image')->description('Featured image URL')
            ->raw('meta_data', ['type' => 'object', 'description' => 'SEO metadata: meta_title, meta_description, meta_keywords'])
            ->raw('tags', ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Array of tag strings'])
            ->boolean('isPrimary')->description('Whether this is a featured/primary post')
            ->string('featured_until')->description('Featured until date (ISO 8601)')
            ->integer('sort_order')->description('Sort order (lower = first)')
            ->string('published_at')->description('Publish date (ISO 8601, defaults to now for published status)');
    }

    public function handle(array $arguments): ToolResult
    {
        [$validated, $error] = $this->validateWith($arguments, StoreBlogRequest::class, ['featured_image_file']);
        if ($error) {
            return $error;
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $blog = Blog::create($validated);

        return ToolResult::json([
            'message' => "Blog '{$blog->title}' created successfully.",
            'id' => $blog->id,
            'slug' => $blog->slug,
        ]);
    }
}
