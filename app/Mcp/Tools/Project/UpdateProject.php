<?php

namespace App\Mcp\Tools\Project;

use App\Models\Project;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateProject extends Tool
{
    public function description(): string
    {
        return 'Update an existing project by ID. Only provided fields will be updated.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Project ID to update')->required(),
            'title' => $schema->string()->description('Project title'),
            'description' => $schema->string()->description('Full project description'),
            'status' => $schema->string()->description('Status: live, archived, maintenance, development'),
            'slug' => $schema->string()->description('URL slug'),
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
        $project = Project::find($request->get('id'));
        if (! $project) {
            return Response::error('Project not found.');
        }

        $data = collect($request->all())->except('id')->toArray();

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
            return Response::error('Validation failed: '.json_encode($validator->errors()->toArray()));
        }

        $project->update($validator->validated());

        return Response::json([
            'message' => "Project '{$project->title}' updated successfully.",
            'id' => $project->id,
            'slug' => $project->slug,
        ]);
    }
}
