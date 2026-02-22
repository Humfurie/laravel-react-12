<?php

namespace App\Mcp\Tools\Deployment;

use App\Models\Deployment;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateDeployment extends Tool
{
    public function description(): string
    {
        return 'Update an existing deployment by ID. Only provided fields will be updated.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Deployment ID to update')->required(),
            'title' => $schema->string()->description('Deployment title'),
            'slug' => $schema->string()->description('URL slug'),
            'description' => $schema->string()->description('Full description'),
            'client_name' => $schema->string()->description('Client name'),
            'client_type' => $schema->string()->description('Client type: family, friend, business, personal'),
            'industry' => $schema->string()->description('Client industry'),
            'tech_stack' => $schema->array()->description('Array of technology names'),
            'challenges_solved' => $schema->array()->description('Array of challenges solved'),
            'live_url' => $schema->string()->description('Live URL'),
            'demo_url' => $schema->string()->description('Demo URL'),
            'project_id' => $schema->integer()->description('Associated project ID'),
            'is_featured' => $schema->boolean()->description('Whether deployment is featured'),
            'is_public' => $schema->boolean()->description('Whether deployment is publicly visible'),
            'deployed_at' => $schema->string()->description('Deployment date (YYYY-MM-DD)'),
            'status' => $schema->string()->description('Status: active, maintenance, archived'),
            'sort_order' => $schema->integer()->description('Sort order'),
        ];
    }

    public function handle(Request $request): Response
    {
        $deployment = Deployment::find($request->get('id'));
        if (! $deployment) {
            return Response::error('Deployment not found.');
        }

        $data = collect($request->all())->except('id')->toArray();

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
            return Response::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $deployment->update($validator->validated());

        return Response::json([
            'message' => "Deployment '{$deployment->title}' updated successfully.",
            'id' => $deployment->id,
            'slug' => $deployment->slug,
        ]);
    }
}
