<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReorderImagesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $property = $this->route('property');

        return auth()->check() && auth()->user()->can('update', $property);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'images' => ['required', 'array', 'min:1'],
            'images.*.id' => ['required', 'integer', 'exists:images,id'],
            'images.*.order' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'images.required' => 'Images array is required.',
            'images.array' => 'Images must be provided as an array.',
            'images.min' => 'At least one image must be provided.',
            'images.*.id.required' => 'Each image must have an ID.',
            'images.*.id.integer' => 'Image ID must be an integer.',
            'images.*.id.exists' => 'One or more images do not exist.',
            'images.*.order.required' => 'Each image must have an order value.',
            'images.*.order.integer' => 'Order must be an integer.',
            'images.*.order.min' => 'Order cannot be negative.',
        ];
    }
}
