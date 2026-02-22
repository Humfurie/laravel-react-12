<?php

namespace App\Mcp\Tools\Comment;

use App\Models\Comment;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListComments extends Tool
{
    public function description(): string
    {
        return 'List comments with optional filtering by status and commentable type.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()->description('Filter by status: approved, pending, rejected'),
            'commentable_type' => $schema->string()->description('Filter by type: blog (App\\Models\\Blog)'),
            'commentable_id' => $schema->integer()->description('Filter by commentable ID (requires commentable_type)'),
            'root_only' => $schema->boolean()->description('Only show root comments (no replies)'),
            'page' => $schema->integer()->description('Page number (default: 1)'),
            'per_page' => $schema->integer()->description('Items per page (default: 15, max: 50)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $query = Comment::with('user');

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('commentable_type')) {
            $allowedTypes = [
                'blog' => 'App\\Models\\Blog',
            ];
            $type = $allowedTypes[$request->get('commentable_type')] ?? null;

            if (! $type) {
                return Response::error("Invalid commentable_type '{$request->get('commentable_type')}'. Allowed: ".implode(', ', array_keys($allowedTypes)));
            }

            $query->where('commentable_type', $type);

            if ($request->has('commentable_id')) {
                $query->where('commentable_id', $request->get('commentable_id'));
            }
        }

        if (! empty($request->get('root_only'))) {
            $query->rootComments();
        }

        $perPage = min($request->get('per_page', 15), 50);
        $comments = $query->orderByDesc('created_at')->paginate($perPage, ['*'], 'page', $request->get('page', 1));

        return Response::json([
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
