<?php

namespace App\Mcp\Tools\Experience;

use App\Http\Requests\UpdateExperienceRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Experience;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class UpdateExperience extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Update an existing experience entry by ID. Only provided fields will be updated.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->integer('id')->description('Experience ID to update')->required()
            ->string('position')->description('Job position/title')
            ->string('company')->description('Company name')
            ->string('location')->description('Work location')
            ->raw('description', ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Array of description bullet points'])
            ->integer('start_month')->description('Start month (0=Jan, 11=Dec)')
            ->integer('start_year')->description('Start year')
            ->integer('end_month')->description('End month')
            ->integer('end_year')->description('End year')
            ->boolean('is_current_position')->description('Whether this is a current position')
            ->integer('display_order')->description('Display order');
    }

    public function handle(array $arguments): ToolResult
    {
        $experience = Experience::find($arguments['id']);
        if (! $experience) {
            return ToolResult::error('Experience not found.');
        }

        $data = collect($arguments)->except('id')->toArray();

        [$validated, $error] = $this->validateWith($data, UpdateExperienceRequest::class, ['image']);
        if ($error) {
            return $error;
        }

        $experience->update($validated);

        return ToolResult::json([
            'message' => "Experience '{$experience->position} at {$experience->company}' updated successfully.",
            'id' => $experience->id,
        ]);
    }
}
