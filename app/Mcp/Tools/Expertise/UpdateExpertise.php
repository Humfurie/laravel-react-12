<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateExpertise extends Tool
{
    public function description(): string
    {
        return 'Update an existing expertise/skill item by ID.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Expertise ID to update')->required(),
            'name' => $schema->string()->description('Expertise name'),
            'category_slug' => $schema->string()->description('Category: be, fe, td'),
            'image' => $schema->string()->description('Image path or URL'),
            'order' => $schema->integer()->description('Display order'),
            'is_active' => $schema->boolean()->description('Whether this item is active'),
        ];
    }

    public function handle(Request $request): Response
    {
        $expertise = Expertise::find($request->get('id'));
        if (! $expertise) {
            return Response::error('Expertise not found.');
        }

        $data = collect($request->all())->except('id')->toArray();

        $validator = Validator::make($data, [
            'name' => ['sometimes', 'string', 'max:255'],
            'category_slug' => ['sometimes', Rule::in(['be', 'fe', 'td'])],
            'image' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $expertise->update($validator->validated());

        return Response::json([
            'message' => "Expertise '{$expertise->name}' updated successfully.",
            'id' => $expertise->id,
        ]);
    }
}
