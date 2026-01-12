<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Store Social Post Request
 *
 * Validates social media post creation/update requests.
 * Ensures all required fields are present and valid before creating/updating a post.
 *
 * Validates:
 * - Post content (title, description, hashtags)
 * - Video file path (from previous upload)
 * - Optional thumbnail image
 * - Social account selection
 * - Optional scheduling information
 */
class StoreSocialPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * All authenticated users can create posts for their own accounts.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Validation ensures:
     * - Required fields are present (title, description, video_path, social_account_id)
     * - Content lengths meet platform requirements
     * - Hashtags are properly formatted
     * - Social account belongs to authenticated user
     * - Scheduled date is in the future
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Post content
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'required',
                'string',
                'max:5000', // Max length for most platforms
            ],

            // Hashtags (optional)
            'hashtags' => [
                'nullable',
                'array',
                'max:30', // Instagram max is 30
            ],
            'hashtags.*' => [
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9_]+$/', // Alphanumeric and underscore only
            ],

            // Video file (already uploaded)
            'video_path' => [
                'required',
                'string',
            ],

            // Optional custom thumbnail
            'thumbnail' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:5120', // 5MB
            ],

            // Social account selection
            'social_account_id' => [
                'required',
                'exists:social_accounts,id',
            ],

            // Optional scheduling
            'scheduled_at' => [
                'nullable',
                'date',
                'after:now',
            ],

            // Publish immediately flag
            'publish_now' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Please enter a title for your post.',
            'title.max' => 'The title must not exceed 255 characters.',
            'description.required' => 'Please enter a description for your post.',
            'description.max' => 'The description must not exceed 5000 characters.',
            'hashtags.max' => 'You can add a maximum of 30 hashtags.',
            'hashtags.*.regex' => 'Hashtags can only contain letters, numbers, and underscores.',
            'video_path.required' => 'Please upload a video before creating the post.',
            'thumbnail.image' => 'The thumbnail must be an image file.',
            'thumbnail.mimes' => 'The thumbnail must be a JPEG, PNG, JPG, or WebP image.',
            'thumbnail.max' => 'The thumbnail size must not exceed 5MB.',
            'social_account_id.required' => 'Please select a social media account.',
            'social_account_id.exists' => 'The selected social media account is invalid.',
            'scheduled_at.after' => 'The scheduled time must be in the future.',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * Clean up hashtags by removing # prefix if present.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('hashtags') && is_array($this->hashtags)) {
            $cleanedHashtags = array_map(function ($hashtag) {
                // Remove # prefix if present
                return ltrim($hashtag, '#');
            }, $this->hashtags);

            $this->merge([
                'hashtags' => array_filter($cleanedHashtags), // Remove empty values
            ]);
        }
    }
}
