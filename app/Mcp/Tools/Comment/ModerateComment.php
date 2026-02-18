<?php

namespace App\Mcp\Tools\Comment;

use App\Models\Comment;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class ModerateComment extends Tool
{
    public function description(): string
    {
        return 'Moderate a comment: approve, reject, or soft-delete it.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Comment ID')->required()
            ->string('action')->description('Action: approve, reject, delete')->required();
    }

    public function handle(array $arguments): ToolResult
    {
        $comment = Comment::find($arguments['id']);
        if (! $comment) {
            return ToolResult::error('Comment not found.');
        }

        return match ($arguments['action']) {
            'approve' => $this->setStatus($comment, 'approved'),
            'reject' => $this->setStatus($comment, 'rejected'),
            'delete' => $this->softDelete($comment),
            default => ToolResult::error("Invalid action '{$arguments['action']}'. Use: approve, reject, delete."),
        };
    }

    private function setStatus(Comment $comment, string $status): ToolResult
    {
        $comment->update(['status' => $status]);

        return ToolResult::json([
            'message' => "Comment {$status}.",
            'id' => $comment->id,
            'status' => $status,
        ]);
    }

    private function softDelete(Comment $comment): ToolResult
    {
        $comment->delete();

        return ToolResult::json([
            'message' => 'Comment soft-deleted.',
            'id' => $comment->id,
        ]);
    }
}
