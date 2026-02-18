<?php

namespace App\Mcp\Tools\Project;

use App\Models\Project;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class ListProjects extends Tool
{
    public function description(): string
    {
        return 'List projects with optional filtering by status, visibility, and category.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('status')->description('Filter by status: live, archived, maintenance, development')
            ->boolean('is_public')->description('Filter by visibility')
            ->boolean('is_featured')->description('Filter by featured status')
            ->string('ownership_type')->description('Filter by ownership: owner, contributor')
            ->integer('page')->description('Page number (default: 1)')
            ->integer('per_page')->description('Items per page (default: 15, max: 50)');
    }

    public function handle(array $arguments): ToolResult
    {
        $query = Project::query()->with(['primaryImage', 'projectCategory']);

        if (isset($arguments['status'])) {
            $query->where('status', $arguments['status']);
        }

        if (isset($arguments['is_public'])) {
            $query->where('is_public', $arguments['is_public']);
        }

        if (isset($arguments['is_featured'])) {
            $query->where('is_featured', $arguments['is_featured']);
        }

        if (isset($arguments['ownership_type'])) {
            $query->where('ownership_type', $arguments['ownership_type']);
        }

        $perPage = min($arguments['per_page'] ?? 15, 50);
        $projects = $query->ordered()->paginate($perPage, ['*'], 'page', $arguments['page'] ?? 1);

        return ToolResult::json([
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
