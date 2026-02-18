<?php

namespace App\Mcp\Tools\Blog;

use App\Models\Blog;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class UpdateBlog extends Tool
{
    public function description(): string
    {
        return 'Update an existing blog post by ID. Only provided fields will be updated.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Blog ID to update')->required()
            ->string('title')->description('Blog title')
            ->string('content')->description('Blog content (HTML)')
            ->string('status')->description('Status: draft, published, private')
            ->string('slug')->description('URL slug')
            ->string('excerpt')->description('Short excerpt (max 500 chars)')
            ->string('featured_image')->description('Featured image URL')
            ->raw('meta_data', ['type' => 'object', 'description' => 'SEO metadata'])
            ->raw('tags', ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Array of tag strings'])
            ->boolean('isPrimary')->description('Whether this is a featured/primary post')
            ->string('featured_until')->description('Featured until date (ISO 8601)')
            ->integer('sort_order')->description('Sort order')
            ->string('published_at')->description('Publish date (ISO 8601)');
    }

    public function handle(array $arguments): ToolResult
    {
        $blog = Blog::find($arguments['id']);
        if (! $blog) {
            return ToolResult::error('Blog not found.');
        }

        $data = collect($arguments)->except('id')->toArray();

        $rules = [
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('blogs', 'slug')->ignore($blog->id)],
            'content' => ['sometimes', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', Rule::in([Blog::STATUS_DRAFT, Blog::STATUS_PUBLISHED, Blog::STATUS_PRIVATE])],
            'featured_image' => ['nullable', 'string', 'max:255'],
            'meta_data' => ['nullable', 'array'],
            'meta_data.meta_title' => ['nullable', 'string', 'max:60'],
            'meta_data.meta_description' => ['nullable', 'string', 'max:160'],
            'meta_data.meta_keywords' => ['nullable', 'string', 'max:255'],
            'isPrimary' => ['boolean'],
            'featured_until' => ['nullable', 'date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'published_at' => ['nullable', 'date'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];

        $validator = Validator::make($data, $rules);
        if ($validator->fails()) {
            return ToolResult::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $blog->update($validator->validated());

        return ToolResult::json([
            'message' => "Blog '{$blog->title}' updated successfully.",
            'id' => $blog->id,
            'slug' => $blog->slug,
        ]);
    }
}
