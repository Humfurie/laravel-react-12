<?php

namespace App\Mcp\Tools\Project;

use App\Models\Project;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class DeleteProject extends Tool
{
    public function description(): string
    {
        return 'Soft-delete a project by ID. The project can be restored later.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Project ID to delete')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $project = Project::find($request->get('id'));
        if (! $project) {
            return Response::error('Project not found.');
        }

        $title = $project->title;
        $project->delete();

        return Response::json([
            'message' => "Project '{$title}' soft-deleted successfully.",
            'id' => $request->get('id'),
        ]);
    }
}
