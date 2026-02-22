<?php

namespace App\Mcp\Tools\Project;

use App\Http\Requests\StoreProjectRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Project;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CreateProject extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Create a new project. Required: title, description, status.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('Project title')->required(),
            'description' => $schema->string()->description('Full project description')->required(),
            'status' => $schema->string()->description('Status: live, archived, maintenance, development')->required(),
            'slug' => $schema->string()->description('URL slug (auto-generated if not provided)'),
            'short_description' => $schema->string()->description('Short description (max 300 chars)'),
            'category' => $schema->string()->description('Category slug'),
            'project_category_id' => $schema->integer()->description('Project category ID'),
            'tech_stack' => $schema->array()->description('Array of technology names'),
            'links' => $schema->object()->description('Links: demo_url, repo_url, docs_url'),
            'github_repo' => $schema->string()->description('GitHub repo (owner/repo format)'),
            'is_featured' => $schema->boolean()->description('Whether project is featured'),
            'is_public' => $schema->boolean()->description('Whether project is publicly visible'),
            'metrics' => $schema->object()->description('Metrics: users, stars, downloads'),
            'case_study' => $schema->string()->description('Case study content'),
            'testimonials' => $schema->array()->description('Array of {name, role, company, content}'),
            'started_at' => $schema->string()->description('Start date (YYYY-MM-DD)'),
            'completed_at' => $schema->string()->description('Completion date (YYYY-MM-DD)'),
            'sort_order' => $schema->integer()->description('Sort order'),
            'ownership_type' => $schema->string()->description('Ownership: owner, contributor'),
        ];
    }

    public function handle(Request $request): Response
    {
        [$validated, $error] = $this->validateWith($request->all(), StoreProjectRequest::class, ['thumbnail']);
        if ($error) {
            return $error;
        }

        $project = Project::create($validated);

        return Response::json([
            'message' => "Project '{$project->title}' created successfully.",
            'id' => $project->id,
            'slug' => $project->slug,
        ]);
    }
}
