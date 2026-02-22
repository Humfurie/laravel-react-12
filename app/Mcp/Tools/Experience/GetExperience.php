<?php

namespace App\Mcp\Tools\Experience;

use App\Models\Experience;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class GetExperience extends Tool
{
    public function description(): string
    {
        return 'Get a single work experience by ID, including full description.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Experience ID')->required();
    }

    public function handle(array $arguments): ToolResult
    {
        $experience = Experience::with('image')
            ->where('user_id', config('app.admin_user_id'))
            ->find($arguments['id']);

        if (! $experience) {
            return ToolResult::error('Experience not found.');
        }

        return ToolResult::json([
            'id' => $experience->id,
            'position' => $experience->position,
            'company' => $experience->company,
            'location' => $experience->location,
            'description' => $experience->description,
            'start_month' => $experience->start_month,
            'start_year' => $experience->start_year,
            'end_month' => $experience->end_month,
            'end_year' => $experience->end_year,
            'is_current_position' => $experience->is_current_position,
            'display_order' => $experience->display_order,
            'image_url' => $experience->image_url,
            'created_at' => $experience->created_at->toIso8601String(),
            'updated_at' => $experience->updated_at->toIso8601String(),
        ]);
    }
}
