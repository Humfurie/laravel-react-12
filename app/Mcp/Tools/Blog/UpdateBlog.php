<?php

namespace App\Mcp\Tools\Blog;

use App\Models\Blog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateBlog extends Tool
{
    public function description(): string
    {
        return 'Update an existing blog post by ID. Only provided fields will be updated.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Blog ID to update')->required(),
            'title' => $schema->string()->description('Blog title'),
            'content' => $schema->string()->description('Blog content (HTML)'),
            'status' => $schema->string()->description('Status: draft, published, private'),
            'slug' => $schema->string()->description('URL slug'),
            'excerpt' => $schema->string()->description('Short excerpt (max 500 chars)'),
            'featured_image' => $schema->string()->description('Featured image URL'),
            'meta_data' => $schema->object()->description('SEO metadata'),
            'tags' => $schema->array()->description('Array of tag strings'),
            'isPrimary' => $schema->boolean()->description('Whether this is a featured/primary post'),
            'featured_until' => $schema->string()->description('Featured until date (ISO 8601)'),
            'sort_order' => $schema->integer()->description('Sort order'),
            'published_at' => $schema->string()->description('Publish date (ISO 8601)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $blog = Blog::find($request->get('id'));
        if (! $blog) {
            return Response::error('Blog not found.');
        }

        $data = collect($request->all())->except('id')->toArray();

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
            return Response::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $blog->update($validator->validated());

        return Response::json([
            'message' => "Blog '{$blog->title}' updated successfully.",
            'id' => $blog->id,
            'slug' => $blog->slug,
        ]);
    }
}
