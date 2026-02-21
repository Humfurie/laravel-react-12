<?php

namespace App\Mcp\Tools\Guestbook;

use App\Models\GuestbookEntry;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class ModerateGuestbookEntry extends Tool
{
    public function description(): string
    {
        return 'Approve or reject a guestbook entry, or soft-delete it entirely.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Guestbook entry ID')->required()
            ->string('action')->description('Action: approve, reject, delete')->required();
    }

    public function handle(array $arguments): ToolResult
    {
        $entry = GuestbookEntry::find($arguments['id']);
        if (! $entry) {
            return ToolResult::error('Guestbook entry not found.');
        }

        return match ($arguments['action']) {
            'approve' => $this->approve($entry),
            'reject' => $this->reject($entry),
            'delete' => $this->softDelete($entry),
            default => ToolResult::error("Invalid action '{$arguments['action']}'. Use: approve, reject, delete."),
        };
    }

    private function approve(GuestbookEntry $entry): ToolResult
    {
        $entry->update(['is_approved' => true]);

        return ToolResult::json([
            'message' => 'Guestbook entry approved.',
            'id' => $entry->id,
        ]);
    }

    private function reject(GuestbookEntry $entry): ToolResult
    {
        $entry->update(['is_approved' => false]);

        return ToolResult::json([
            'message' => 'Guestbook entry rejected.',
            'id' => $entry->id,
        ]);
    }

    private function softDelete(GuestbookEntry $entry): ToolResult
    {
        $entry->delete();

        return ToolResult::json([
            'message' => 'Guestbook entry soft-deleted.',
            'id' => $entry->id,
        ]);
    }
}
