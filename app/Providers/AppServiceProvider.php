<?php

namespace App\Providers;

use App\Models\Blog;
use App\Observers\BlogObserver;
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
        // Force HTTPS URLs when behind proxy in production
        if (app()->environment('production') && request()->hasHeader('X-Forwarded-Proto')) {
            URL::forceScheme('https');
        }

        // Register observers
        Blog::observe(BlogObserver::class);
    }
}
