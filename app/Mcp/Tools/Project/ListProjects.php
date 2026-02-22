<?php

namespace App\Mcp\Tools\Project;

use App\Models\Project;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListProjects extends Tool
{
    public function description(): string
    {
        return 'List projects with optional filtering by status, visibility, and category.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()->description('Filter by status: live, archived, maintenance, development'),
            'is_public' => $schema->boolean()->description('Filter by visibility'),
            'is_featured' => $schema->boolean()->description('Filter by featured status'),
            'ownership_type' => $schema->string()->description('Filter by ownership: owner, contributor'),
            'page' => $schema->integer()->description('Page number (default: 1)'),
            'per_page' => $schema->integer()->description('Items per page (default: 15, max: 50)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $query = Project::query()->with(['primaryImage', 'projectCategory']);

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('is_public')) {
            $query->where('is_public', $request->get('is_public'));
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->get('is_featured'));
        }

        if ($request->has('ownership_type')) {
            $query->where('ownership_type', $request->get('ownership_type'));
        }

        $perPage = min($request->get('per_page', 15), 50);
        $projects = $query->ordered()->paginate($perPage, ['*'], 'page', $request->get('page', 1));

        return Response::json([
            'data' => $projects->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'short_description' => $p->getRawOriginal('short_description') ?: str($p->description ?? '')->limit(150)->toString(),
                'status' => $p->status,
                'category' => $p->projectCategory?->name ?? $p->category,
                'tech_stack' => $p->tech_stack,
                'is_featured' => $p->is_featured,
                'is_public' => $p->is_public,
                'ownership_type' => $p->ownership_type,
                'github_repo' => $p->github_repo,
                'thumbnail_url' => $p->thumbnail_url,
            ])->toArray(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'total' => $projects->total(),
                'per_page' => $projects->perPage(),
            ],
        ]);
    }
}
