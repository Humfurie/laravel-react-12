<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class IncrementViewCount implements ShouldQueue
{
    use Queueable;

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
        $modelClass = "App\\Models\\{$this->model}";

        if (class_exists($modelClass)) {
            $modelClass::find($this->id)?->increment('view_count');
        }
    }
}
