<?php

namespace App\Mcp\Tools\Project;

use App\Http\Requests\StoreProjectRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Project;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class CreateProject extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Create a new project. Required: title, description, status.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('title')->description('Project title')->required()
            ->string('description')->description('Full project description')->required()
            ->string('status')->description('Status: live, archived, maintenance, development')->required()
            ->string('slug')->description('URL slug (auto-generated if not provided)')
            ->string('short_description')->description('Short description (max 300 chars)')
            ->string('category')->description('Category slug')
            ->integer('project_category_id')->description('Project category ID')
            ->raw('tech_stack', ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Array of technology names'])
            ->raw('links', ['type' => 'object', 'description' => 'Links: demo_url, repo_url, docs_url'])
            ->string('github_repo')->description('GitHub repo (owner/repo format)')
            ->boolean('is_featured')->description('Whether project is featured')
            ->boolean('is_public')->description('Whether project is publicly visible')
            ->raw('metrics', ['type' => 'object', 'description' => 'Metrics: users, stars, downloads'])
            ->string('case_study')->description('Case study content')
            ->raw('testimonials', ['type' => 'array', 'description' => 'Array of {name, role, company, content}'])
            ->string('started_at')->description('Start date (YYYY-MM-DD)')
            ->string('completed_at')->description('Completion date (YYYY-MM-DD)')
            ->integer('sort_order')->description('Sort order')
            ->string('ownership_type')->description('Ownership: owner, contributor');
    }

    public function handle(array $arguments): ToolResult
    {
        [$validated, $error] = $this->validateWith($arguments, StoreProjectRequest::class, ['thumbnail']);
        if ($error) {
            return $error;
        }

        $project = Project::create($validated);

        return ToolResult::json([
            'message' => "Project '{$project->title}' created successfully.",
            'id' => $project->id,
            'slug' => $project->slug,
        ]);
    }
}
