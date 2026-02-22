<?php

namespace App\Mcp\Concerns;

use Illuminate\Support\Facades\Validator;
use Laravel\Mcp\Response;

trait FormRequestValidator
{
    /**
     * Validate arguments using rules from a Form Request class.
     *
     * @param  array<string, mixed>  $arguments
     * @param  class-string  $formRequestClass
     * @param  array<int, string>  $excludeRules  Rules to exclude (e.g. file upload fields)
     * @return array{0: array<string, mixed>, 1: null}|array{0: null, 1: Response}
     */
    protected function validateWith(array $arguments, string $formRequestClass, array $excludeRules = []): array
    {
        $formRequest = new $formRequestClass;
        $rules = $formRequest->rules();

        foreach ($excludeRules as $field) {
            unset($rules[$field]);
        }

        $validator = Validator::make($arguments, $rules);

        if ($validator->fails()) {
            return [null, Response::error('Validation failed: '.json_encode($validator->errors()->toArray()))];
        }

        return [$validator->validated(), null];
    }
}
