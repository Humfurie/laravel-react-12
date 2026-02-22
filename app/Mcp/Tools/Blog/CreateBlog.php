<?php

namespace App\Mcp\Tools\Blog;

use App\Http\Requests\StoreBlogRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Blog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CreateBlog extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Create a new blog post. Required: title, content, status. Auto-generates slug if not provided.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('Blog title')->required(),
            'content' => $schema->string()->description('Blog content (HTML)')->required(),
            'status' => $schema->string()->description('Status: draft, published, private')->required(),
            'slug' => $schema->string()->description('URL slug (auto-generated from title if not provided)'),
            'excerpt' => $schema->string()->description('Short excerpt (max 500 chars)'),
            'featured_image' => $schema->string()->description('Featured image URL'),
            'meta_data' => $schema->object()->description('SEO metadata: meta_title, meta_description, meta_keywords'),
            'tags' => $schema->array()->description('Array of tag strings'),
            'isPrimary' => $schema->boolean()->description('Whether this is a featured/primary post'),
            'featured_until' => $schema->string()->description('Featured until date (ISO 8601)'),
            'sort_order' => $schema->integer()->description('Sort order (lower = first)'),
            'published_at' => $schema->string()->description('Publish date (ISO 8601, defaults to now for published status)'),
        ];
    }

    public function handle(Request $request): Response
    {
        [$validated, $error] = $this->validateWith($request->all(), StoreBlogRequest::class, ['featured_image_file']);
        if ($error) {
            return $error;
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $blog = Blog::create($validated);

        return Response::json([
            'message' => "Blog '{$blog->title}' created successfully.",
            'id' => $blog->id,
            'slug' => $blog->slug,
        ]);
    }
}
