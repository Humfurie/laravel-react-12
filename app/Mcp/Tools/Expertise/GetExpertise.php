<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class GetExpertise extends Tool
{
    public function description(): string
    {
        return 'Get a single expertise/skill item by ID.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Expertise ID')->required();
    }

    public function handle(array $arguments): ToolResult
    {
        $expertise = Expertise::find($arguments['id']);

        if (! $expertise) {
            return ToolResult::error('Expertise not found.');
        }

        return ToolResult::json([
            'id' => $expertise->id,
            'name' => $expertise->name,
            'category_slug' => $expertise->category_slug,
            'category_name' => $expertise->category_name,
            'image' => $expertise->image,
            'image_url' => $expertise->image_url,
            'order' => $expertise->order,
            'is_active' => $expertise->is_active,
            'created_at' => $expertise->created_at->toIso8601String(),
            'updated_at' => $expertise->updated_at->toIso8601String(),
        ]);
    }
}
