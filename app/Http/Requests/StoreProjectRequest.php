<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:projects,slug'],
            'description' => ['required', 'string'],
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
            'status' => ['required', Rule::in(array_keys(Project::getStatuses()))],
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
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'ownership_type' => ['nullable', Rule::in(array_keys(\App\Models\Project::getOwnershipTypes()))],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The project title is required.',
            'description.required' => 'The project description is required.',
            'category.required' => 'Please select a project category.',
            'category.in' => 'The selected category is invalid.',
            'status.required' => 'Please select a project status.',
            'status.in' => 'The selected status is invalid.',
            'slug.unique' => 'This slug is already taken. Please choose a different one.',
            'completed_at.after_or_equal' => 'Completion date must be after or equal to start date.',
            'links.demo_url.url' => 'The demo URL must be a valid URL.',
            'links.repo_url.url' => 'The repository URL must be a valid URL.',
            'links.docs_url.url' => 'The documentation URL must be a valid URL.',
            'github_repo.regex' => 'GitHub repo must be in format "owner/repo" (e.g., laravel/laravel).',
        ];
    }
}
