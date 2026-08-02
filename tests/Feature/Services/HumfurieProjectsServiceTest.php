<?php

use App\Services\HumfurieProjectsService;
use Illuminate\Support\Facades\Http;

test('fetches and flattens all pages of projects', function () {
    config(['services.humfurie.projects_url' => 'https://api.humfurie.org/api/projects']);

    Http::fake([
        'api.humfurie.org/api/projects?page=1&per_page=50' => Http::response([
            'data' => [
                ['id' => 'uuid-1', 'title' => 'Project One'],
            ],
            'meta' => ['page' => 1, 'per_page' => 50, 'total' => 2, 'total_pages' => 2],
        ]),
        'api.humfurie.org/api/projects?page=2&per_page=50' => Http::response([
            'data' => [
                ['id' => 'uuid-2', 'title' => 'Project Two'],
            ],
            'meta' => ['page' => 2, 'per_page' => 50, 'total' => 2, 'total_pages' => 2],
        ]),
    ]);

    $service = new HumfurieProjectsService;

    $projects = $service->fetchAll();

    expect($projects)->toHaveCount(2);
    expect($projects[0]['id'])->toBe('uuid-1');
    expect($projects[1]['id'])->toBe('uuid-2');
});

test('returns empty array when the api call fails', function () {
    config(['services.humfurie.projects_url' => 'https://api.humfurie.org/api/projects']);

    Http::fake([
        'api.humfurie.org/api/projects*' => Http::response(null, 500),
    ]);

    $service = new HumfurieProjectsService;

    expect($service->fetchAll())->toBe([]);
});
