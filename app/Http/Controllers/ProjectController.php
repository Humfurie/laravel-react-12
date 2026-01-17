<?php

namespace App\Http\Controllers;

use App\Jobs\IncrementViewCount;
use App\Models\Project;
use App\Services\HomepageCacheService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        // Get featured projects for carousel (cached)
        $featured = Cache::remember(
            config('cache-ttl.keys.listing_projects_featured'),
            config('cache-ttl.listing.projects_featured'),
            function () {
                return Project::query()
                    ->public()
                    ->featured()
                    ->with(['images' => fn ($q) => $q->ordered()])
                    ->orderBy('featured_at', 'desc')
                    ->orderBy('sort_order')
                    ->take(6)
                    ->get();
            }
        );

        // Get all public projects for grid
        $projects = Project::query()
            ->public()
            ->with(['primaryImage'])
            ->ordered()
            ->get();

        // Get unique tech stack for filter options
        $allTechStack = Cache::remember(
            config('cache-ttl.keys.listing_projects_tech_stack'),
            config('cache-ttl.listing.projects_tech_stack'),
            function () {
                return Project::public()
                    ->whereNotNull('tech_stack')
                    ->pluck('tech_stack')
                    ->flatten()
                    ->unique()
                    ->sort()
                    ->values();
            }
        );

        return Inertia::render('user/projects', [
            'featured' => $featured,
            'projects' => $projects,
            'categories' => Project::getCategories(),
            'techStack' => $allTechStack,
        ]);
    }

    public function show(Project $project)
    {
        // Only show public projects
        if (! $project->is_public) {
            abort(404);
        }

        // Increment view count asynchronously (non-blocking)
        IncrementViewCount::dispatch('Project', $project->id);

        // Load images
        $project->load(['images' => fn ($q) => $q->ordered()]);

        return response()->json([
            'project' => $project,
        ]);
    }

    /**
     * Get featured and stats for homepage integration.
     */
    public function getFeaturedAndStats()
    {
        return app(HomepageCacheService::class)->getCachedProjectsData();
    }
}
