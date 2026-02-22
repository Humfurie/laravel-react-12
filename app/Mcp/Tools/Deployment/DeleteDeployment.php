<?php

namespace App\Mcp\Tools\Deployment;

use App\Models\Deployment;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class DeleteDeployment extends Tool
{
    public function description(): string
    {
        return 'Soft-delete a deployment by ID. The deployment can be restored later.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Deployment ID to delete')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $deployment = Deployment::find($request->get('id'));
        if (! $deployment) {
            return Response::error('Deployment not found.');
        }

        $title = $deployment->title;
        $deployment->delete();

        return Response::json([
            'message' => "Deployment '{$title}' soft-deleted successfully.",
            'id' => $request->get('id'),
        ]);
    }
}
