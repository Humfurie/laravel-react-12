<?php

namespace App\Mcp\Tools\Experience;

use App\Models\Experience;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class DeleteExperience extends Tool
{
    public function description(): string
    {
        return 'Soft-delete an experience entry by ID.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Experience ID to delete')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $experience = Experience::find($request->get('id'));
        if (! $experience) {
            return Response::error('Experience not found.');
        }

        $label = "{$experience->position} at {$experience->company}";
        $experience->delete();

        return Response::json([
            'message' => "Experience '{$label}' soft-deleted successfully.",
            'id' => $request->get('id'),
        ]);
    }
}
