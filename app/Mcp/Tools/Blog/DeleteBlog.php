<?php

namespace App\Mcp\Tools\Blog;

use App\Models\Blog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class DeleteBlog extends Tool
{
    public function description(): string
    {
        return 'Soft-delete a blog post by ID. The post can be restored later.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Blog ID to delete')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $blog = Blog::find($request->get('id'));
        if (! $blog) {
            return Response::error('Blog not found.');
        }

        $title = $blog->title;
        $blog->delete();

        return Response::json([
            'message' => "Blog '{$title}' soft-deleted successfully.",
            'id' => $request->get('id'),
        ]);
    }
}
