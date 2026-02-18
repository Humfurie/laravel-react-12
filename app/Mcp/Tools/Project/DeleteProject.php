<?php

namespace App\Mcp\Tools\Project;

use App\Models\Project;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class DeleteProject extends Tool
{
    public function description(): string
    {
        return 'Soft-delete a project by ID. The project can be restored later.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Project ID to delete')->required();
    }

    public function handle(array $arguments): ToolResult
    {
        $project = Project::find($arguments['id']);
        if (! $project) {
            return ToolResult::error('Project not found.');
        }

        $title = $project->title;
        $project->delete();

        return ToolResult::json([
            'message' => "Project '{$title}' soft-deleted successfully.",
            'id' => $arguments['id'],
        ]);
    }
}
