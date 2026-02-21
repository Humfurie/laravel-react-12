<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CreateExpertise extends Tool
{
    public function description(): string
    {
        return 'Create a new expertise/skill item. Required: name, category_slug.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('Expertise name (e.g. "Laravel", "React")')->required(),
            'category_slug' => $schema->string()->description('Category: be (Backend), fe (Frontend), td (Tools & DevOps)')->required(),
            'image' => $schema->string()->description('Image path or URL'),
            'order' => $schema->integer()->description('Display order (lower = first)'),
            'is_active' => $schema->boolean()->description('Whether this item is active (default: true)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $arguments = $request->all();

        $validator = Validator::make($arguments, [
            'name' => ['required', 'string', 'max:255'],
            'category_slug' => ['required', Rule::in(['be', 'fe', 'td'])],
            'image' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $data = $validator->validated();
        if (! isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $expertise = Expertise::create($data);

        return Response::json([
            'message' => "Expertise '{$expertise->name}' created successfully.",
            'id' => $expertise->id,
        ]);
    }
}
