<?php

namespace App\Mcp\Tools\Project;

use App\Models\Project;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class GetProject extends Tool
{
    public function description(): string
    {
        return 'Get a single project by ID or slug, including full description and case study.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Project ID')
            ->string('slug')->description('Project slug (alternative to ID)');
    }

    public function handle(array $arguments): ToolResult
    {
        if (! isset($arguments['id']) && ! isset($arguments['slug'])) {
            return ToolResult::error('Either id or slug is required.');
        }

        $project = isset($arguments['id'])
            ? Project::with(['primaryImage', 'projectCategory'])->find($arguments['id'])
            : Project::with(['primaryImage', 'projectCategory'])->where('slug', $arguments['slug'])->first();

        if (! $project) {
            return ToolResult::error('Project not found.');
        }

        return ToolResult::json([
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'description' => $project->description,
            'short_description' => $project->getRawOriginal('short_description'),
            'category' => $project->projectCategory?->name ?? $project->category,
            'project_category_id' => $project->project_category_id,
            'tech_stack' => $project->tech_stack,
            'links' => $project->links,
            'github_repo' => $project->github_repo,
            'status' => $project->status,
            'is_featured' => $project->is_featured,
            'is_public' => $project->is_public,
            'metrics' => $project->metrics,
            'case_study' => $project->case_study,
            'testimonials' => $project->testimonials,
            'started_at' => $project->started_at?->toDateString(),
            'completed_at' => $project->completed_at?->toDateString(),
            'ownership_type' => $project->ownership_type,
            'sort_order' => $project->sort_order,
            'view_count' => $project->view_count,
            'thumbnail_url' => $project->thumbnail_url,
            'created_at' => $project->created_at->toIso8601String(),
            'updated_at' => $project->updated_at->toIso8601String(),
        ]);
    }
}
