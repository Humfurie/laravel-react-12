<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'username' => [
                'nullable',
                'string',
                'max:50',
                'regex:/^[a-z0-9_-]+$/',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],

            'bio' => ['nullable', 'string', 'max:500'],

            'headline' => ['nullable', 'string', 'max:255'],

            'about' => ['nullable', 'string', 'max:5000'],

            // Social links
            'social_links' => ['nullable', 'array'],
            'social_links.github' => ['nullable', 'url', 'max:255'],
            'social_links.linkedin' => ['nullable', 'url', 'max:255'],
            'social_links.facebook' => ['nullable', 'url', 'max:255'],
            'social_links.twitter' => ['nullable', 'url', 'max:255'],
            'social_links.website' => ['nullable', 'url', 'max:255'],

            // Profile stats (array of objects with label and value)
            'profile_stats' => ['nullable', 'array'],
            'profile_stats.*.label' => ['required_with:profile_stats', 'string', 'max:100'],
            'profile_stats.*.value' => ['required_with:profile_stats', 'string', 'max:100'],

            // Resume upload
            'resume' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'], // 5MB max
        ];
    }

    public function messages(): array
    {
        return [
            'username.regex' => 'Username can only contain lowercase letters, numbers, underscores, and hyphens.',
        ];
    }
}
