<?php

namespace App\Mcp\Tools\Deployment;

use App\Http\Requests\StoreDeploymentRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Deployment;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CreateDeployment extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Create a new deployment. Required: title, client_name, client_type, live_url, status.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('Deployment title')->required(),
            'client_name' => $schema->string()->description('Client name')->required(),
            'client_type' => $schema->string()->description('Client type: family, friend, business, personal')->required(),
            'live_url' => $schema->string()->description('Live URL')->required(),
            'status' => $schema->string()->description('Status: active, maintenance, archived')->required(),
            'slug' => $schema->string()->description('URL slug (auto-generated if not provided)'),
            'description' => $schema->string()->description('Full description'),
            'industry' => $schema->string()->description('Client industry'),
            'tech_stack' => $schema->array()->description('Array of technology names'),
            'challenges_solved' => $schema->array()->description('Array of challenges solved'),
            'demo_url' => $schema->string()->description('Demo URL'),
            'project_id' => $schema->integer()->description('Associated project ID'),
            'is_featured' => $schema->boolean()->description('Whether deployment is featured'),
            'is_public' => $schema->boolean()->description('Whether deployment is publicly visible'),
            'deployed_at' => $schema->string()->description('Deployment date (YYYY-MM-DD)'),
            'sort_order' => $schema->integer()->description('Sort order'),
        ];
    }

    public function handle(Request $request): Response
    {
        [$validated, $error] = $this->validateWith($request->all(), StoreDeploymentRequest::class, ['thumbnail']);
        if ($error) {
            return $error;
        }

        $deployment = Deployment::create($validated);

        return Response::json([
            'message' => "Deployment '{$deployment->title}' created successfully.",
            'id' => $deployment->id,
            'slug' => $deployment->slug,
        ]);
    }
}
