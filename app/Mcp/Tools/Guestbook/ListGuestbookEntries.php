<?php

namespace App\Mcp\Tools\Guestbook;

use App\Models\GuestbookEntry;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListGuestbookEntries extends Tool
{
    public function description(): string
    {
        return 'List guestbook entries with optional filtering by approval status.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'approved_only' => $schema->boolean()->description('Only show approved entries'),
            'pending_only' => $schema->boolean()->description('Only show pending (unapproved) entries'),
            'page' => $schema->integer()->description('Page number (default: 1)'),
            'per_page' => $schema->integer()->description('Items per page (default: 15, max: 50)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $query = GuestbookEntry::with('user')->latestFirst();

        if (! empty($request->get('approved_only'))) {
            $query->approved();
        } elseif (! empty($request->get('pending_only'))) {
            $query->where('is_approved', false);
        }

        $perPage = min($request->get('per_page', 15), 50);
        $entries = $query->paginate($perPage, ['*'], 'page', $request->get('page', 1));

        return Response::json([
            'data' => $entries->map(fn ($entry) => [
                'id' => $entry->id,
                'message' => $entry->message,
                'is_approved' => $entry->is_approved,
                'user' => $entry->user ? [
                    'id' => $entry->user->id,
                    'name' => $entry->user->name,
                    'username' => $entry->user->username,
                ] : null,
                'created_at' => $entry->created_at->toIso8601String(),
            ])->toArray(),
            'meta' => [
                'current_page' => $entries->currentPage(),
                'last_page' => $entries->lastPage(),
                'total' => $entries->total(),
                'per_page' => $entries->perPage(),
            ],
        ]);
    }
}
