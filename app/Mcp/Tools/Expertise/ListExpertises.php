<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class ListExpertises extends Tool
{
    public function description(): string
    {
        return 'List expertise/skill items. Optionally filter by category (be=Backend, fe=Frontend, td=Tools & DevOps).';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('category')->description('Filter by category slug: be, fe, td')
            ->boolean('active_only')->description('Only show active items (default: true)');
    }

    public function handle(array $arguments): ToolResult
    {
        $query = Expertise::query()->ordered();

        if (($arguments['active_only'] ?? true) !== false) {
            $query->active();
        }

        if (isset($arguments['category'])) {
            $query->byCategory($arguments['category']);
        }

        $expertises = $query->get();

        return ToolResult::json([
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
