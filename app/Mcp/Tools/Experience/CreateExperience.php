<?php

namespace App\Mcp\Tools\Experience;

use App\Http\Requests\StoreExperienceRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Experience;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class CreateExperience extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Create a new work experience entry. Required: position, company, location, description, start_month, start_year.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('position')->description('Job position/title')->required()
            ->string('company')->description('Company name')->required()
            ->string('location')->description('Work location')->required()
            ->raw('description', ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Array of description bullet points'])->required()
            ->integer('start_month')->description('Start month (0=Jan, 11=Dec)')->required()
            ->integer('start_year')->description('Start year (e.g. 2024)')->required()
            ->integer('end_month')->description('End month (0=Jan, 11=Dec)')
            ->integer('end_year')->description('End year')
            ->boolean('is_current_position')->description('Whether this is a current position')
            ->integer('display_order')->description('Display order (lower = first)');
    }

    public function handle(array $arguments): ToolResult
    {
        [$validated, $error] = $this->validateWith($arguments, StoreExperienceRequest::class, ['image']);
        if ($error) {
            return $error;
        }

        $validated['user_id'] = config('app.admin_user_id');
        $experience = Experience::create($validated);

        return ToolResult::json([
            'message' => "Experience '{$experience->position} at {$experience->company}' created successfully.",
            'id' => $experience->id,
        ]);
    }
}
