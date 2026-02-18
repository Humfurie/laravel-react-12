<?php

namespace App\Mcp\Tools\Guestbook;

use App\Models\GuestbookEntry;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class ListGuestbookEntries extends Tool
{
    public function description(): string
    {
        return 'List guestbook entries with optional filtering by approval status.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->boolean('approved_only')->description('Only show approved entries')
            ->boolean('pending_only')->description('Only show pending (unapproved) entries')
            ->integer('page')->description('Page number (default: 1)')
            ->integer('per_page')->description('Items per page (default: 15, max: 50)');
    }

    public function handle(array $arguments): ToolResult
    {
        $query = GuestbookEntry::with('user')->latestFirst();

        if (! empty($arguments['approved_only'])) {
            $query->approved();
        } elseif (! empty($arguments['pending_only'])) {
            $query->where('is_approved', false);
        }

        $perPage = min($arguments['per_page'] ?? 15, 50);
        $entries = $query->paginate($perPage, ['*'], 'page', $arguments['page'] ?? 1);

        return ToolResult::json([
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
