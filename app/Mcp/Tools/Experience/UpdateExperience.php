<?php

namespace App\Mcp\Tools\Experience;

use App\Http\Requests\UpdateExperienceRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Experience;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateExperience extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Update an existing experience entry by ID. Only provided fields will be updated.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('Experience ID to update')->required(),
            'position' => $schema->string()->description('Job position/title'),
            'company' => $schema->string()->description('Company name'),
            'location' => $schema->string()->description('Work location'),
            'description' => $schema->array()->description('Array of description bullet points'),
            'start_month' => $schema->integer()->description('Start month (0=Jan, 11=Dec)'),
            'start_year' => $schema->integer()->description('Start year'),
            'end_month' => $schema->integer()->description('End month'),
            'end_year' => $schema->integer()->description('End year'),
            'is_current_position' => $schema->boolean()->description('Whether this is a current position'),
            'display_order' => $schema->integer()->description('Display order'),
        ];
    }

    public function handle(Request $request): Response
    {
        $experience = Experience::find($request->get('id'));
        if (! $experience) {
            return Response::error('Experience not found.');
        }

        $data = collect($request->all())->except('id')->toArray();

        [$validated, $error] = $this->validateWith($data, UpdateExperienceRequest::class, ['image']);
        if ($error) {
            return $error;
        }

        $experience->update($validated);

        return Response::json([
            'message' => "Experience '{$experience->position} at {$experience->company}' updated successfully.",
            'id' => $experience->id,
        ]);
    }
}
