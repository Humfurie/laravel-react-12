<?php

namespace App\Mcp\Tools\Deployment;

use App\Models\Deployment;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class GetDeployment extends Tool
{
    public function description(): string
    {
        return 'Get a single deployment by ID or slug, including full description and challenges solved.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Deployment ID')
            ->string('slug')->description('Deployment slug (alternative to ID)');
    }

    public function handle(array $arguments): ToolResult
    {
        $deployment = isset($arguments['id'])
            ? Deployment::with('primaryImage')->find($arguments['id'])
            : Deployment::with('primaryImage')->where('slug', $arguments['slug'] ?? '')->first();

        if (! $deployment) {
            return ToolResult::error('Deployment not found.');
        }

        return ToolResult::json([
            'id' => $deployment->id,
            'title' => $deployment->title,
            'slug' => $deployment->slug,
            'description' => $deployment->description,
            'client_name' => $deployment->client_name,
            'client_type' => $deployment->client_type,
            'industry' => $deployment->industry,
            'tech_stack' => $deployment->tech_stack,
            'challenges_solved' => $deployment->challenges_solved,
            'live_url' => $deployment->live_url,
            'demo_url' => $deployment->demo_url,
            'project_id' => $deployment->project_id,
            'is_featured' => $deployment->is_featured,
            'is_public' => $deployment->is_public,
            'deployed_at' => $deployment->deployed_at?->toDateString(),
            'status' => $deployment->status,
            'sort_order' => $deployment->sort_order,
            'thumbnail_url' => $deployment->thumbnail_url,
            'created_at' => $deployment->created_at->toIso8601String(),
            'updated_at' => $deployment->updated_at->toIso8601String(),
        ]);
    }
}
