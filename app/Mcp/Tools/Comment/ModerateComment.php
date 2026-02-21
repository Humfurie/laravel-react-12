<?php

namespace App\Mcp\Tools\Comment;

use App\Models\Comment;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ModerateComment extends Tool
{
    public function description(): string
    {
        return 'Moderate a comment: approve, hide (reject), or soft-delete it.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Comment ID')->required(),
            'action' => $schema->string()->description('Action: approve, hide, delete')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $comment = Comment::find($request->get('id'));
        if (! $comment) {
            return Response::error('Comment not found.');
        }

        return match ($request->get('action')) {
            'approve' => $this->setStatus($comment, 'approved'),
            'hide' => $this->setStatus($comment, 'hidden'),
            'delete' => $this->softDelete($comment),
            default => Response::error("Invalid action '{$request->get('action')}'. Use: approve, hide, delete."),
        };
    }

    private function setStatus(Comment $comment, string $status): Response
    {
        $comment->update(['status' => $status]);

        return Response::json([
            'message' => "Comment {$status}.",
            'id' => $comment->id,
            'status' => $status,
        ]);
    }

    private function softDelete(Comment $comment): Response
    {
        $comment->delete();

        return Response::json([
            'message' => 'Comment soft-deleted.',
            'id' => $comment->id,
        ]);
    }
}
