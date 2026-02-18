<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class UpdateExpertise extends Tool
{
    public function description(): string
    {
        return 'Update an existing expertise/skill item by ID.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Expertise ID to update')->required()
            ->string('name')->description('Expertise name')
            ->string('category_slug')->description('Category: be, fe, td')
            ->string('image')->description('Image path or URL')
            ->integer('order')->description('Display order')
            ->boolean('is_active')->description('Whether this item is active');
    }

    public function handle(array $arguments): ToolResult
    {
        $expertise = Expertise::find($arguments['id']);
        if (! $expertise) {
            return ToolResult::error('Expertise not found.');
        }

        $data = collect($arguments)->except('id')->toArray();

        $validator = Validator::make($data, [
            'name' => ['sometimes', 'string', 'max:255'],
            'category_slug' => ['sometimes', Rule::in(['be', 'fe', 'td'])],
            'image' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return ToolResult::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $expertise->update($validator->validated());

        return ToolResult::json([
            'message' => "Expertise '{$expertise->name}' updated successfully.",
            'id' => $expertise->id,
        ]);
    }
}
