<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS URLs when behind proxy
        if (env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');
        }

        // Set the correct root URL
        if (env('APP_URL')) {
            URL::forceRootUrl(env('APP_URL'));
        }
    }
}
