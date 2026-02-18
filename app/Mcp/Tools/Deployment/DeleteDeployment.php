<?php

namespace App\Mcp\Tools\Deployment;

use App\Models\Deployment;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class DeleteDeployment extends Tool
{
    public function description(): string
    {
        return 'Soft-delete a deployment by ID. The deployment can be restored later.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Deployment ID to delete')->required();
    }

    public function handle(array $arguments): ToolResult
    {
        $deployment = Deployment::find($arguments['id']);
        if (! $deployment) {
            return ToolResult::error('Deployment not found.');
        }

        $title = $deployment->title;
        $deployment->delete();

        return ToolResult::json([
            'message' => "Deployment '{$title}' soft-deleted successfully.",
            'id' => $arguments['id'],
        ]);
    }
}
