<?php

namespace App\Providers;

use App\Models\Blog;
use App\Models\Deployment;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\User;
use App\Observers\BlogObserver;
use App\Observers\DeploymentObserver;
use App\Observers\ExperienceObserver;
use App\Observers\ExpertiseObserver;
use App\Observers\ProjectCategoryObserver;
use App\Observers\ProjectObserver;
use App\Observers\UserObserver;
use Illuminate\Support\Facades\Log;
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

        $this->validateConfiguration();
        $this->registerObservers();
    }

    /**
     * Validate critical configuration values.
     */
    private function validateConfiguration(): void
    {
        $adminUserId = config('app.admin_user_id');

        if ($adminUserId === null || $adminUserId === '') {
            Log::warning('ADMIN_USER_ID is not configured. Homepage features may not work correctly.');

            return;
        }

        if (! is_numeric($adminUserId) || (int) $adminUserId < 1) {
            Log::warning('ADMIN_USER_ID must be a positive integer. Current value: '.var_export($adminUserId, true));
        }
    }

    /**
     * Register model observers.
     */
    private function registerObservers(): void
    {
        Blog::observe(BlogObserver::class);
        Deployment::observe(DeploymentObserver::class);
        Experience::observe(ExperienceObserver::class);
        Expertise::observe(ExpertiseObserver::class);
        Project::observe(ProjectObserver::class);
        ProjectCategory::observe(ProjectCategoryObserver::class);
        User::observe(UserObserver::class);
    }
}
