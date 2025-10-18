<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadImageRequest extends FormRequest
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
            'images' => ['required', 'array', 'max:20'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'], // 5MB max
            'is_primary' => ['boolean'],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'images.required' => 'Please select at least one image to upload.',
            'images.array' => 'Images must be provided as an array.',
            'images.max' => 'You can upload a maximum of 20 images at once.',
            'images.*.required' => 'Each image is required.',
            'images.*.image' => 'All files must be valid images.',
            'images.*.mimes' => 'Images must be of type: jpg, jpeg, png, or webp.',
            'images.*.max' => 'Each image must not exceed 5MB in size.',
        ];
    }
}
