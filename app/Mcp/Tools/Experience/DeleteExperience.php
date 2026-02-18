<?php

namespace App\Mcp\Tools\Experience;

use App\Models\Experience;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class DeleteExperience extends Tool
{
    public function description(): string
    {
        return 'Soft-delete an experience entry by ID.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Experience ID to delete')->required();
    }

    public function handle(array $arguments): ToolResult
    {
        $experience = Experience::find($arguments['id']);
        if (! $experience) {
            return ToolResult::error('Experience not found.');
        }

        $label = "{$experience->position} at {$experience->company}";
        $experience->delete();

        return ToolResult::json([
            'message' => "Experience '{$label}' soft-deleted successfully.",
            'id' => $arguments['id'],
        ]);
    }
}
