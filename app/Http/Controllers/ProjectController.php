<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        // Get featured projects for carousel (cached)
        $featured = Cache::remember('projects.featured', 1800, function () {
            return Project::query()
                ->public()
                ->featured()
                ->with(['images' => fn($q) => $q->ordered()])
                ->orderBy('featured_at', 'desc')
                ->orderBy('sort_order')
                ->take(6)
                ->get();
        });

        // Get all public projects for grid
        $projects = Project::query()
            ->public()
            ->with(['primaryImage'])
            ->ordered()
            ->get();

        // Get unique tech stack for filter options (cached for 30 minutes)
        $allTechStack = Cache::remember('projects.tech_stack', 1800, function () {
            return Project::public()
                ->whereNotNull('tech_stack')
                ->pluck('tech_stack')
                ->flatten()
                ->unique()
                ->sort()
                ->values();
        });

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
        if (!$project->is_public) {
            abort(404);
        }

        // Increment view count
        $project->incrementViewCount();

        // Load images
        $project->load(['images' => fn($q) => $q->ordered()]);

        return response()->json([
            'project' => $project->fresh(),
        ]);
    }

    /**
     * Get featured and stats for homepage integration.
     */
    public function getFeaturedAndStats()
    {
        return Cache::remember('homepage.projects', 600, function () {
            $featured = Project::query()
                ->public()
                ->featured()
                ->with(['primaryImage'])
                ->orderBy('featured_at', 'desc')
                ->take(4)
                ->get();

            $stats = [
                'total_projects' => Project::public()->count(),
                'live_projects' => Project::public()->live()->count(),
            ];

            return [
                'featured' => $featured,
                'stats' => $stats,
            ];
        });
    }
}
