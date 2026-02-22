<?php

namespace App\Mcp\Tools\Deployment;

use App\Models\Deployment;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListDeployments extends Tool
{
    public function description(): string
    {
        return 'List deployments with optional filtering by status, client type, and visibility.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()->description('Filter by status: active, maintenance, archived'),
            'client_type' => $schema->string()->description('Filter by client type: family, friend, business, personal'),
            'is_public' => $schema->boolean()->description('Filter by visibility'),
            'page' => $schema->integer()->description('Page number (default: 1)'),
            'per_page' => $schema->integer()->description('Items per page (default: 15, max: 50)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $query = Deployment::query()->with('primaryImage');

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('client_type')) {
            $query->where('client_type', $request->get('client_type'));
        }

        if ($request->has('is_public')) {
            $query->where('is_public', $request->get('is_public'));
        }

        $perPage = min($request->get('per_page', 15), 50);
        $deployments = $query->ordered()->paginate($perPage, ['*'], 'page', $request->get('page', 1));

        return Response::json([
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
