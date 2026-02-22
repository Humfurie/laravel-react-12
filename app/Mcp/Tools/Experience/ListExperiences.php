<?php

namespace App\Mcp\Tools\Experience;

use App\Models\Experience;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ListExperiences extends Tool
{
    public function description(): string
    {
        return 'List work experiences ordered by display order. Optionally filter by current positions only.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'current_only' => $schema->boolean()->description('Only show current positions'),
        ];
    }

    public function handle(Request $request): Response
    {
        $query = Experience::with('image')
            ->where('user_id', config('app.admin_user_id'))
            ->ordered();

        if (! empty($request->get('current_only'))) {
            $query->current();
        }

        $experiences = $query->get();

        return Response::json([
            'data' => $experiences->map(fn ($exp) => [
                'id' => $exp->id,
                'position' => $exp->position,
                'company' => $exp->company,
                'location' => $exp->location,
                'description' => $exp->description,
                'start_month' => $exp->start_month,
                'start_year' => $exp->start_year,
                'end_month' => $exp->end_month,
                'end_year' => $exp->end_year,
                'is_current_position' => $exp->is_current_position,
                'display_order' => $exp->display_order,
                'image_url' => $exp->image_url,
            ])->toArray(),
            'total' => $experiences->count(),
        ]);
    }
}
