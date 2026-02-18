<?php

namespace App\Mcp\Tools\Blog;

use App\Models\Blog;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class DeleteBlog extends Tool
{
    public function description(): string
    {
        return 'Soft-delete a blog post by ID. The post can be restored later.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Blog ID to delete')->required();
    }

    public function handle(array $arguments): ToolResult
    {
        $blog = Blog::find($arguments['id']);
        if (! $blog) {
            return ToolResult::error('Blog not found.');
        }

        $title = $blog->title;
        $blog->delete();

        return ToolResult::json([
            'message' => "Blog '{$title}' soft-deleted successfully.",
            'id' => $arguments['id'],
        ]);
    }
}
