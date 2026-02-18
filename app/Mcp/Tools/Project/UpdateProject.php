<?php

namespace App\Mcp\Tools\Project;

use App\Models\Project;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class UpdateProject extends Tool
{
    public function description(): string
    {
        return 'Update an existing project by ID. Only provided fields will be updated.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Project ID to update')->required()
            ->string('title')->description('Project title')
            ->string('description')->description('Full project description')
            ->string('status')->description('Status: live, archived, maintenance, development')
            ->string('slug')->description('URL slug')
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
        $project = Project::find($arguments['id']);
        if (! $project) {
            return ToolResult::error('Project not found.');
        }

        $data = collect($arguments)->except('id')->toArray();

        $rules = [
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('projects', 'slug')->ignore($project->id)],
            'description' => ['sometimes', 'string'],
            'short_description' => ['nullable', 'string', 'max:300'],
            'category' => ['nullable', 'string', 'max:50'],
            'project_category_id' => ['nullable', 'integer', 'exists:project_categories,id'],
            'tech_stack' => ['nullable', 'array'],
            'tech_stack.*' => ['string', 'max:50'],
            'links' => ['nullable', 'array'],
            'links.demo_url' => ['nullable', 'url'],
            'links.repo_url' => ['nullable', 'url'],
            'links.docs_url' => ['nullable', 'url'],
            'github_repo' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/'],
            'status' => ['sometimes', Rule::in(array_keys(Project::getStatuses()))],
            'is_featured' => ['boolean'],
            'is_public' => ['boolean'],
            'metrics' => ['nullable', 'array'],
            'metrics.users' => ['nullable', 'integer', 'min:0'],
            'metrics.stars' => ['nullable', 'integer', 'min:0'],
            'metrics.downloads' => ['nullable', 'integer', 'min:0'],
            'case_study' => ['nullable', 'string'],
            'testimonials' => ['nullable', 'array'],
            'testimonials.*.name' => ['required_with:testimonials', 'string', 'max:100'],
            'testimonials.*.role' => ['nullable', 'string', 'max:100'],
            'testimonials.*.company' => ['nullable', 'string', 'max:100'],
            'testimonials.*.content' => ['required_with:testimonials', 'string', 'max:500'],
            'started_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'ownership_type' => ['nullable', Rule::in(array_keys(Project::getOwnershipTypes()))],
        ];

        $validator = Validator::make($data, $rules);
        if ($validator->fails()) {
            return ToolResult::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $project->update($validator->validated());

        return ToolResult::json([
            'message' => "Project '{$project->title}' updated successfully.",
            'id' => $project->id,
            'slug' => $project->slug,
        ]);
    }
}
