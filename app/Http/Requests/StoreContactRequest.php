<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
            'website' => ['max:0'], // honeypot — must be empty
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please enter your name.',
            'email.required' => 'Please enter your email address.',
            'email.email' => 'Please enter a valid email address.',
            'message.required' => 'Please enter a message.',
            'message.min' => 'Your message must be at least 10 characters.',
            'message.max' => 'Your message must not exceed 2000 characters.',
            'website.max' => 'Spam detected.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('message')) {
            $this->merge([
                'message' => strip_tags($this->message),
            ]);
        }
    }
}
