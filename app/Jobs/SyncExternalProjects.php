<?php

namespace App\Jobs;

use App\Models\Project;
use App\Services\HumfurieProjectsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncExternalProjects implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function handle(HumfurieProjectsService $humfurie): void
    {
        foreach ($humfurie->fetchAll() as $data) {
            try {
                Project::updateOrCreate(
                    ['external_id' => $data['id']],
                    [
                        'title' => $data['title'],
                        'slug' => $data['slug'] ?? null,
                        'description' => $data['description'] ?? null,
                        'short_description' => $data['short_description'] ?? null,
                        'category' => $data['category'] ?? null,
                        'status' => $data['status'] ?? null,
                        'tech_stack' => $data['tech_stack'] ?? [],
                        'links' => $data['links'] ?? null,
                        'is_featured' => $data['is_featured'] ?? false,
                        'is_public' => $data['is_public'] ?? true,
                        'sort_order' => $data['sort_order'] ?? 0,
                        'view_count' => $data['view_count'] ?? 0,
                        'external_synced_at' => now(),
                    ]
                );
            } catch (\Exception $e) {
                Log::error('SyncExternalProjects: failed to sync project', [
                    'external_id' => $data['id'] ?? null,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
