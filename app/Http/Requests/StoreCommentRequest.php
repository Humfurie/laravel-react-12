<?php

namespace App\Http\Requests;

use App\Models\Comment;
use Illuminate\Contracts\Validation\ValidationRule;
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:3', 'max:1000'],
            'parent_id' => [
                'nullable',
                'exists:comments,id',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $parent = Comment::find($value);

                        // Check if parent exists and is not deleted
                        if (!$parent || $parent->trashed()) {
                            $fail('The comment you are replying to no longer exists.');
                            return;
                        }

                        // Check nesting depth (max 3 levels: root -> reply -> reply)
                        $depth = 0;
                        $current = $parent;
                        while ($current && $depth < 10) { // Prevent infinite loop
                            if ($current->parent_id) {
                                $depth++;
                                $current = $current->parent;
                            } else {
                                break;
                            }
                        }

                        if ($depth >= 2) {
                            $fail('Comments cannot be nested more than 3 levels deep.');
                        }
                    }
                },
            ],
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
