<?php

namespace App\Mcp\Tools\Guestbook;

use App\Models\GuestbookEntry;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ModerateGuestbookEntry extends Tool
{
    public function description(): string
    {
        return 'Approve or reject a guestbook entry, or soft-delete it entirely.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Guestbook entry ID')->required(),
            'action' => $schema->string()->description('Action: approve, reject, delete')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $entry = GuestbookEntry::find($request->get('id'));
        if (! $entry) {
            return Response::error('Guestbook entry not found.');
        }

        return match ($request->get('action')) {
            'approve' => $this->approve($entry),
            'reject' => $this->reject($entry),
            'delete' => $this->softDelete($entry),
            default => Response::error("Invalid action '{$request->get('action')}'. Use: approve, reject, delete."),
        };
    }

    private function approve(GuestbookEntry $entry): Response
    {
        $entry->update(['is_approved' => true]);

        return Response::json([
            'message' => 'Guestbook entry approved.',
            'id' => $entry->id,
        ]);
    }

    private function reject(GuestbookEntry $entry): Response
    {
        $entry->update(['is_approved' => false]);

        return Response::json([
            'message' => 'Guestbook entry rejected.',
            'id' => $entry->id,
        ]);
    }

    private function softDelete(GuestbookEntry $entry): Response
    {
        $entry->delete();

        return Response::json([
            'message' => 'Guestbook entry soft-deleted.',
            'id' => $entry->id,
        ]);
    }
}
