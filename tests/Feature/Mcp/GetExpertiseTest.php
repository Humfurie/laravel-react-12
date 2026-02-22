<?php

use App\Mcp\Tools\Expertise\GetExpertise;
use App\Models\Expertise;
use Laravel\Mcp\Server\Tools\ToolResult;

function getExpertiseData(ToolResult $result): array
{
    return json_decode($result->content[0]->text, true);
}

it('gets an expertise by ID', function () {
    $expertise = Expertise::factory()->create(['name' => 'Laravel']);

    $result = (new GetExpertise)->handle(['id' => $expertise->id]);
    $data = getExpertiseData($result);

    expect($result->isError)->toBeFalse();
    expect($data['id'])->toBe($expertise->id);
    expect($data['name'])->toBe('Laravel');
    expect($data)->toHaveKeys(['category_slug', 'category_name', 'image', 'image_url', 'order', 'is_active']);
});

it('returns error when expertise is not found', function () {
    $result = (new GetExpertise)->handle(['id' => 99999]);

    expect($result->isError)->toBeTrue();
    expect($result->content[0]->text)->toContain('Expertise not found');
});
