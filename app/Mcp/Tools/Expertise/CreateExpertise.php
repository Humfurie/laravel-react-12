<?php

namespace App\Mcp\Tools\Expertise;

use App\Models\Expertise;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class CreateExpertise extends Tool
{
    public function description(): string
    {
        return 'Create a new expertise/skill item. Required: name, category_slug.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('name')->description('Expertise name (e.g. "Laravel", "React")')->required()
            ->string('category_slug')->description('Category: be (Backend), fe (Frontend), td (Tools & DevOps)')->required()
            ->string('image')->description('Image path or URL')
            ->integer('order')->description('Display order (lower = first)')
            ->boolean('is_active')->description('Whether this item is active (default: true)');
    }

    public function handle(array $arguments): ToolResult
    {
        $validator = Validator::make($arguments, [
            'name' => ['required', 'string', 'max:255'],
            'category_slug' => ['required', Rule::in(['be', 'fe', 'td'])],
            'image' => ['nullable', 'string', 'max:500'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return ToolResult::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $data = $validator->validated();
        if (! isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $expertise = Expertise::create($data);

        return ToolResult::json([
            'message' => "Expertise '{$expertise->name}' created successfully.",
            'id' => $expertise->id,
        ]);
    }
}
