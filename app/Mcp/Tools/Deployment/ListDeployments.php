<?php

namespace App\Mcp\Tools\Deployment;

use App\Models\Deployment;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class ListDeployments extends Tool
{
    public function description(): string
    {
        return 'List deployments with optional filtering by status, client type, and visibility.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('status')->description('Filter by status: active, maintenance, archived')
            ->string('client_type')->description('Filter by client type: family, friend, business, personal')
            ->boolean('is_public')->description('Filter by visibility')
            ->integer('page')->description('Page number (default: 1)')
            ->integer('per_page')->description('Items per page (default: 15, max: 50)');
    }

    public function handle(array $arguments): ToolResult
    {
        $query = Deployment::query()->with('primaryImage');

        if (isset($arguments['status'])) {
            $query->where('status', $arguments['status']);
        }

        if (isset($arguments['client_type'])) {
            $query->where('client_type', $arguments['client_type']);
        }

        if (isset($arguments['is_public'])) {
            $query->where('is_public', $arguments['is_public']);
        }

        $perPage = min($arguments['per_page'] ?? 15, 50);
        $deployments = $query->ordered()->paginate($perPage, ['*'], 'page', $arguments['page'] ?? 1);

        return ToolResult::json([
            'data' => $deployments->map(fn ($d) => [
                'id' => $d->id,
                'title' => $d->title,
                'slug' => $d->slug,
                'client_name' => $d->client_name,
                'client_type' => $d->client_type,
                'status' => $d->status,
                'tech_stack' => $d->tech_stack,
                'live_url' => $d->live_url,
                'is_featured' => $d->is_featured,
                'is_public' => $d->is_public,
                'deployed_at' => $d->deployed_at?->toDateString(),
                'thumbnail_url' => $d->thumbnail_url,
            ])->toArray(),
            'meta' => [
                'current_page' => $deployments->currentPage(),
                'last_page' => $deployments->lastPage(),
                'total' => $deployments->total(),
                'per_page' => $deployments->perPage(),
            ],
        ]);
    }
}
