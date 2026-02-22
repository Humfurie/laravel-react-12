<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class DeleteExpertise extends Tool
{
    public function description(): string
    {
        return 'Permanently delete an expertise/skill item by ID.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Expertise ID to delete')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $expertise = Expertise::find($request->get('id'));
        if (! $expertise) {
            return Response::error('Expertise not found.');
        }

        $name = $expertise->name;
        $expertise->delete();

        return Response::json([
            'message' => "Expertise '{$name}' deleted successfully.",
            'id' => $request->get('id'),
        ]);
    }
}
