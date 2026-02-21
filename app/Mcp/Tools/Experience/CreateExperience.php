<?php

namespace App\Mcp\Tools\Experience;

use App\Http\Requests\StoreExperienceRequest;
use App\Mcp\Concerns\FormRequestValidator;
use App\Models\Experience;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CreateExperience extends Tool
{
    use FormRequestValidator;

    public function description(): string
    {
        return 'Create a new work experience entry. Required: position, company, location, description, start_month, start_year.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'position' => $schema->string()->description('Job position/title')->required(),
            'company' => $schema->string()->description('Company name')->required(),
            'location' => $schema->string()->description('Work location')->required(),
            'description' => $schema->array()->description('Array of description bullet points')->required(),
            'start_month' => $schema->integer()->description('Start month (0=Jan, 11=Dec)')->required(),
            'start_year' => $schema->integer()->description('Start year (e.g. 2024)')->required(),
            'end_month' => $schema->integer()->description('End month (0=Jan, 11=Dec)'),
            'end_year' => $schema->integer()->description('End year'),
            'is_current_position' => $schema->boolean()->description('Whether this is a current position'),
            'display_order' => $schema->integer()->description('Display order (lower = first)'),
        ];
    }

    public function handle(Request $request): Response
    {
        [$validated, $error] = $this->validateWith($request->all(), StoreExperienceRequest::class, ['image']);
        if ($error) {
            return $error;
        }

        $validated['user_id'] = config('app.admin_user_id');
        $experience = Experience::create($validated);

        return Response::json([
            'message' => "Experience '{$experience->position} at {$experience->company}' created successfully.",
            'id' => $experience->id,
        ]);
    }
}
