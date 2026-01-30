<?php

namespace App\Http\Requests;

use App\Models\Deployment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDeploymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('deployments', 'slug')->ignore($this->route('deployment'))],
            'description' => ['nullable', 'string'],
            'client_name' => ['required', 'string', 'max:255'],
            'client_type' => ['required', Rule::in(array_keys(Deployment::getClientTypes()))],
            'industry' => ['nullable', 'string', 'max:100'],
            'tech_stack' => ['nullable', 'array'],
            'tech_stack.*' => ['string', 'max:50'],
            'challenges_solved' => ['nullable', 'array'],
            'challenges_solved.*' => ['string', 'max:500'],
            'live_url' => ['required', 'url', 'max:500'],
            'demo_url' => ['nullable', 'url', 'max:500'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'is_featured' => ['boolean'],
            'is_public' => ['boolean'],
            'deployed_at' => ['nullable', 'date'],
            'status' => ['required', Rule::in(array_keys(Deployment::getStatuses()))],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ];
    }
}
