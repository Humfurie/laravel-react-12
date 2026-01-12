<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Upload Video Request
 *
 * Validates video file uploads for social media posts.
 * Ensures uploaded files meet platform requirements for:
 * - File type (video formats only)
 * - File size (configurable maximum)
 * - MIME type verification
 */
class UploadVideoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * All authenticated users can upload videos for their own posts.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Validation rules ensure:
     * - Video file is required
     * - File is a valid video type
     * - File size doesn't exceed configured maximum (default 2GB)
     * - MIME type matches allowed video formats
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'video' => [
                'required',
                'file',
                'mimes:mp4,mov,avi,wmv,webm,mkv,flv',
                'max:' . config('social-media.video.max_size', 2097152), // 2GB default (in KB)
            ],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * Provides user-friendly error messages for validation failures.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $maxSizeMB = config('social-media.video.max_size', 2097152) / 1024; // Convert KB to MB

        return [
            'video.required' => 'Please select a video file to upload.',
            'video.file' => 'The uploaded file must be a valid video file.',
            'video.mimes' => 'The video must be one of the following formats: MP4, MOV, AVI, WMV, WebM, MKV, FLV.',
            'video.max' => "The video file size must not exceed {$maxSizeMB}MB.",
        ];
    }
}
