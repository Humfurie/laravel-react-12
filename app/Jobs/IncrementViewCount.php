<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class IncrementViewCount implements ShouldQueue
{
    use Queueable;

    /**
     * Allowlist of models that can have their view count incremented.
     * This prevents arbitrary model class resolution from job payloads.
     */
    private const ALLOWED_MODELS = [
        'Blog',
        'Project',
        'Property',
    ];

    /**
     * Create a new job instance.
     */
    public function __construct(
        private string $model,
        private int $id
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (! in_array($this->model, self::ALLOWED_MODELS, true)) {
            return;
        }

        $modelClass = "App\\Models\\{$this->model}";
        $modelClass::find($this->id)?->increment('view_count');
    }
}
