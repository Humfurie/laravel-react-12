<?php

namespace App\Mcp\Tools\Comment;

use App\Models\Comment;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class ListComments extends Tool
{
    public function description(): string
    {
        return 'List comments with optional filtering by status and commentable type.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('status')->description('Filter by status: approved, pending, rejected')
            ->string('commentable_type')->description('Filter by type: blog (App\\Models\\Blog)')
            ->integer('commentable_id')->description('Filter by commentable ID (requires commentable_type)')
            ->boolean('root_only')->description('Only show root comments (no replies)')
            ->integer('page')->description('Page number (default: 1)')
            ->integer('per_page')->description('Items per page (default: 15, max: 50)');
    }

    public function handle(array $arguments): ToolResult
    {
        $query = Comment::with('user');

        if (isset($arguments['status'])) {
            $query->where('status', $arguments['status']);
        }

        if (isset($arguments['commentable_type'])) {
            $allowedTypes = [
                'blog' => 'App\\Models\\Blog',
            ];
            $type = $allowedTypes[$arguments['commentable_type']] ?? null;

            if (! $type) {
                return ToolResult::error("Invalid commentable_type '{$arguments['commentable_type']}'. Allowed: ".implode(', ', array_keys($allowedTypes)));
            }

            $query->where('commentable_type', $type);

            if (isset($arguments['commentable_id'])) {
                $query->where('commentable_id', $arguments['commentable_id']);
            }
        }

        if (! empty($arguments['root_only'])) {
            $query->rootComments();
        }

        $perPage = min($arguments['per_page'] ?? 15, 50);
        $comments = $query->orderByDesc('created_at')->paginate($perPage, ['*'], 'page', $arguments['page'] ?? 1);

        return ToolResult::json([
            'data' => $comments->map(fn ($c) => [
                'id' => $c->id,
                'content' => $c->content,
                'status' => $c->status,
                'commentable_type' => class_basename($c->commentable_type),
                'commentable_id' => $c->commentable_id,
                'parent_id' => $c->parent_id,
                'is_edited' => $c->is_edited,
                'user' => $c->user ? [
                    'id' => $c->user->id,
                    'name' => $c->user->name,
                    'username' => $c->user->username,
                ] : null,
                'created_at' => $c->created_at->toIso8601String(),
            ])->toArray(),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'total' => $comments->total(),
                'per_page' => $comments->perPage(),
            ],
        ]);
    }
}
