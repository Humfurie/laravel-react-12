<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HumfurieProjectsService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.humfurie.projects_url');
    }

    /**
     * Fetch all public projects from humfurie.org, across every page.
     *
     * @return array<int, array<string, mixed>>
     */
    public function fetchAll(): array
    {
        $projects = [];
        $page = 1;
        $perPage = 50;
        $totalPages = 1;

        do {
            try {
                $response = Http::get($this->baseUrl, [
                    'page' => $page,
                    'per_page' => $perPage,
                ]);
            } catch (Exception $e) {
                Log::error('HumfurieProjectsService: request failed', [
                    'page' => $page,
                    'error' => $e->getMessage(),
                ]);

                return $projects;
            }

            if (! $response->successful()) {
                Log::warning('HumfurieProjectsService: unsuccessful response', [
                    'page' => $page,
                    'status' => $response->status(),
                ]);

                return $projects;
            }

            $body = $response->json();
            $projects = array_merge($projects, $body['data'] ?? []);
            $totalPages = $body['meta']['total_pages'] ?? 1;
            $page++;
        } while ($page <= $totalPages);

        return $projects;
    }
}
