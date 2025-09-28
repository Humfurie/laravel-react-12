<?php

namespace App\Http\Requests;

use App\Models\Blog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBlogRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Assuming admin authentication is handled elsewhere
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:blogs,slug'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'status' => ['required', Rule::in([Blog::STATUS_DRAFT, Blog::STATUS_PUBLISHED, Blog::STATUS_PRIVATE])],
            'featured_image' => ['nullable', 'string', 'max:255'],
            'meta_data' => ['nullable', 'array'],
            'meta_data.meta_title' => ['nullable', 'string', 'max:60'],
            'meta_data.meta_description' => ['nullable', 'string', 'max:160'],
            'meta_data.meta_keywords' => ['nullable', 'string', 'max:255'],
            'isPrimary' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'published_at' => ['nullable', 'date'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The blog title is required.',
            'content.required' => 'The blog content is required.',
            'slug.unique' => 'This slug is already taken. Please choose a different one.',
            'status.in' => 'The status must be either draft, published, or private.',
            'meta_data.meta_title.max' => 'Meta title should not exceed 60 characters.',
            'meta_data.meta_description.max' => 'Meta description should not exceed 160 characters.',
        ];
    }
}
