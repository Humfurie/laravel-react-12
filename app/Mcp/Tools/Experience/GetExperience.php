<?php

namespace App\Mcp\Tools\Experience;

use App\Models\Experience;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetExperience extends Tool
{
    public function description(): string
    {
        return 'Get a single work experience by ID, including full description.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Experience ID')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $experience = Experience::with('image')
            ->where('user_id', config('app.admin_user_id'))
            ->find($request->get('id'));

        if (! $experience) {
            return Response::error('Experience not found.');
        }

        return Response::json([
            'id' => $experience->id,
            'position' => $experience->position,
            'company' => $experience->company,
            'location' => $experience->location,
            'description' => $experience->description,
            'start_month' => $experience->start_month,
            'start_year' => $experience->start_year,
            'end_month' => $experience->end_month,
            'end_year' => $experience->end_year,
            'is_current_position' => $experience->is_current_position,
            'display_order' => $experience->display_order,
            'image_url' => $experience->image_url,
            'created_at' => $experience->created_at->toIso8601String(),
            'updated_at' => $experience->updated_at->toIso8601String(),
        ]);
    }
}
