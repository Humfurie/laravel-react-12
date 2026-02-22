<?php

use App\Mcp\Tools\Experience\GetExperience;
use App\Models\Experience;
use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

function getExperienceData(Response $result): array
{
    return json_decode((string) $result->content(), true);
}

it('gets an experience by ID', function () {
    $adminId = (int) config('app.admin_user_id');
    User::factory()->create(['id' => $adminId]);
    $experience = Experience::factory()->create([
        'user_id' => $adminId,
        'position' => 'Senior Developer',
    ]);

    $result = (new GetExperience)->handle(new Request(['id' => $experience->id]));
    $data = getExperienceData($result);

    expect($result->isError())->toBeFalse();
    expect($data['id'])->toBe($experience->id);
    expect($data['position'])->toBe('Senior Developer');
    expect($data)->toHaveKeys(['company', 'location', 'description', 'start_month', 'start_year']);
});

it('returns error when experience is not found', function () {
    $result = (new GetExperience)->handle(new Request(['id' => 99999]));

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('Experience not found');
});

it('does not return experiences belonging to other users', function () {
    $otherUser = User::factory()->create();
    $experience = Experience::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $result = (new GetExperience)->handle(new Request(['id' => $experience->id]));

    expect($result->isError())->toBeTrue();
    expect((string) $result->content())->toContain('Experience not found');
});
