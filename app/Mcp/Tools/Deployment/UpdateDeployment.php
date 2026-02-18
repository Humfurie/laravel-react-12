<?php

namespace App\Mcp\Tools\Deployment;

use App\Models\Deployment;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class UpdateDeployment extends Tool
{
    public function description(): string
    {
        return 'Update an existing deployment by ID. Only provided fields will be updated.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Deployment ID to update')->required()
            ->string('title')->description('Deployment title')
            ->string('slug')->description('URL slug')
            ->string('description')->description('Full description')
            ->string('client_name')->description('Client name')
            ->string('client_type')->description('Client type: family, friend, business, personal')
            ->string('industry')->description('Client industry')
            ->raw('tech_stack', ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Array of technology names'])
            ->raw('challenges_solved', ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Array of challenges solved'])
            ->string('live_url')->description('Live URL')
            ->string('demo_url')->description('Demo URL')
            ->integer('project_id')->description('Associated project ID')
            ->boolean('is_featured')->description('Whether deployment is featured')
            ->boolean('is_public')->description('Whether deployment is publicly visible')
            ->string('deployed_at')->description('Deployment date (YYYY-MM-DD)')
            ->string('status')->description('Status: active, maintenance, archived')
            ->integer('sort_order')->description('Sort order');
    }

    public function handle(array $arguments): ToolResult
    {
        $deployment = Deployment::find($arguments['id']);
        if (! $deployment) {
            return ToolResult::error('Deployment not found.');
        }

        $data = collect($arguments)->except('id')->toArray();

        $rules = [
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('deployments', 'slug')->ignore($deployment->id)],
            'description' => ['nullable', 'string'],
            'client_name' => ['sometimes', 'string', 'max:255'],
            'client_type' => ['sometimes', Rule::in(array_keys(Deployment::getClientTypes()))],
            'industry' => ['nullable', 'string', 'max:100'],
            'tech_stack' => ['nullable', 'array', 'max:20'],
            'tech_stack.*' => ['string', 'max:50'],
            'challenges_solved' => ['nullable', 'array', 'max:10'],
            'challenges_solved.*' => ['string', 'max:500'],
            'live_url' => ['sometimes', 'url', 'max:500'],
            'demo_url' => ['nullable', 'url', 'max:500'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'is_featured' => ['boolean'],
            'is_public' => ['boolean'],
            'deployed_at' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::in(array_keys(Deployment::getStatuses()))],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];

        $validator = Validator::make($data, $rules);
        if ($validator->fails()) {
            return ToolResult::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $deployment->update($validator->validated());

        return ToolResult::json([
            'message' => "Deployment '{$deployment->title}' updated successfully.",
            'id' => $deployment->id,
            'slug' => $deployment->slug,
        ]);
    }
}
