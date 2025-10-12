<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExperienceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'position' => ['sometimes', 'required', 'string', 'max:255'],
            'company' => ['sometimes', 'required', 'string', 'max:255'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'array', 'min:1'],
            'description.*' => ['required', 'string'],
            'start_month' => ['sometimes', 'required', 'integer', 'min:0', 'max:11'],
            'start_year' => ['sometimes', 'required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'end_month' => ['nullable', 'integer', 'min:0', 'max:11'],
            'end_year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'is_current_position' => ['sometimes', 'boolean'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:2048'],
        ];
    }

    /**
     * Get custom attribute names.
     */
    public function attributes(): array
    {
        return [
            'description.*' => 'description point',
        ];
    }
}
