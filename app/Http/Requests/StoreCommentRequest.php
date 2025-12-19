<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Any authenticated user can create comments
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:3', 'max:1000'],
            'parent_id' => ['nullable', 'exists:comments,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Please enter a comment.',
            'content.min' => 'Your comment must be at least 3 characters long.',
            'content.max' => 'Your comment cannot exceed 1000 characters.',
            'parent_id.exists' => 'The comment you are replying to does not exist.',
        ];
    }
}
