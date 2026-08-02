<?php

use App\Jobs\SyncExternalProjects;
use Illuminate\Support\Facades\Bus;

test('dispatches the sync external projects job', function () {
    Bus::fake();

    $this->artisan('projects:sync-external')->assertSuccessful();

    Bus::assertDispatched(SyncExternalProjects::class);
});
