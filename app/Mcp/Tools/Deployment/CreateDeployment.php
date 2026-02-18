<?php

namespace App\Mcp\Tools\Deployment;

use App\Http\Requests\StoreDeploymentRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Deployment;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class CreateDeployment extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Create a new deployment. Required: title, client_name, client_type, live_url, status.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('title')->description('Deployment title')->required()
            ->string('client_name')->description('Client name')->required()
            ->string('client_type')->description('Client type: family, friend, business, personal')->required()
            ->string('live_url')->description('Live URL')->required()
            ->string('status')->description('Status: active, maintenance, archived')->required()
            ->string('slug')->description('URL slug (auto-generated if not provided)')
            ->string('description')->description('Full description')
            ->string('industry')->description('Client industry')
            ->raw('tech_stack', ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Array of technology names'])
            ->raw('challenges_solved', ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Array of challenges solved'])
            ->string('demo_url')->description('Demo URL')
            ->integer('project_id')->description('Associated project ID')
            ->boolean('is_featured')->description('Whether deployment is featured')
            ->boolean('is_public')->description('Whether deployment is publicly visible')
            ->string('deployed_at')->description('Deployment date (YYYY-MM-DD)')
            ->integer('sort_order')->description('Sort order');
    }

    public function handle(array $arguments): ToolResult
    {
        [$validated, $error] = $this->validateWith($arguments, StoreDeploymentRequest::class, ['thumbnail']);
        if ($error) {
            return $error;
        }

        $deployment = Deployment::create($validated);

        return ToolResult::json([
            'message' => "Deployment '{$deployment->title}' created successfully.",
            'id' => $deployment->id,
            'slug' => $deployment->slug,
        ]);
    }
}
