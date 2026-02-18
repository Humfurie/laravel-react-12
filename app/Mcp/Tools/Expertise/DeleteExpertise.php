<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class DeleteExpertise extends Tool
{
    public function description(): string
    {
        return 'Permanently delete an expertise/skill item by ID.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Expertise ID to delete')->required();
    }

    public function handle(array $arguments): ToolResult
    {
        $expertise = Expertise::find($arguments['id']);
        if (! $expertise) {
            return ToolResult::error('Expertise not found.');
        }

        $name = $expertise->name;
        $expertise->delete();

        return ToolResult::json([
            'message' => "Expertise '{$name}' deleted successfully.",
            'id' => $arguments['id'],
        ]);
    }
}
