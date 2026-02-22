<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetExpertise extends Tool
{
    public function description(): string
    {
        return 'Get a single expertise/skill item by ID.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Expertise ID')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $expertise = Expertise::find($request->get('id'));

        if (! $expertise) {
            return Response::error('Expertise not found.');
        }

        return Response::json([
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
