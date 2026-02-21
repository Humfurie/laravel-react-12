<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListExpertises extends Tool
{
    public function description(): string
    {
        return 'List expertise/skill items. Optionally filter by category (be=Backend, fe=Frontend, td=Tools & DevOps).';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'category' => $schema->string()->description('Filter by category slug: be, fe, td'),
            'active_only' => $schema->boolean()->description('Only show active items (default: true)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $query = Expertise::query()->ordered();

        if ($request->get('active_only', true) !== false) {
            $query->active();
        }

        if ($request->has('category')) {
            $query->byCategory($request->get('category'));
        }

        $expertises = $query->get();

        return Response::json([
            'data' => $expertises->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'category_slug' => $e->category_slug,
                'category_name' => $e->category_name,
                'image' => $e->image,
                'image_url' => $e->image_url,
                'order' => $e->order,
                'is_active' => $e->is_active,
            ])->toArray(),
            'total' => $expertises->count(),
        ]);
    }
}
