<?php

namespace App\Providers;

use App\Models\Blog;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\Project;
use App\Models\User;
use App\Observers\BlogObserver;
use App\Observers\ExperienceObserver;
use App\Observers\ExpertiseObserver;
use App\Observers\ProjectObserver;
use App\Observers\UserObserver;
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
        Experience::observe(ExperienceObserver::class);
        Expertise::observe(ExpertiseObserver::class);
        Project::observe(ProjectObserver::class);
        User::observe(UserObserver::class);
    }
}
