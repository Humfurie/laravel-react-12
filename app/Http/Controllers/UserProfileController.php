<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Services\GitHubService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    public function __construct(
        protected GitHubService $githubService
    )
    {
    }

    /**
     * Display a user's public profile.
     */
    public function show(string $username): Response
    {
        $user = User::where('username', $username)->firstOrFail();

        // Get projects where user is a contributor
        $contributedProjects = $this->getContributedProjects($user);

        return Inertia::render('user/profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'bio' => $user->bio,
                'avatar_url' => $user->avatar_url,
                'github_username' => $user->github_username,
                'github_contributions' => $user->github_contributions,
                'github_synced_at' => $user->github_synced_at?->toISOString(),
                'created_at' => $user->created_at->toISOString(),
            ],
            'contributedProjects' => $contributedProjects,
        ]);
    }

    /**
     * Refresh GitHub contributions for the authenticated user.
     */
    public function refreshContributions(Request $request)
    {
        $user = $request->user();

        if (!$user->github_username) {
            return back()->withErrors(['github' => 'No GitHub account linked.']);
        }

        $this->githubService->clearUserContributionsCache($user->github_username);
        $contributions = $this->githubService->getUserContributions($user->github_username);

        if ($contributions) {
            $user->update([
                'github_contributions' => $contributions,
                'github_synced_at' => now(),
            ]);

            return back()->with('status', 'GitHub contributions updated.');
        }

        return back()->withErrors(['github' => 'Failed to fetch GitHub contributions.']);
    }

    /**
     * Get projects where the user is listed as a contributor.
     */
    protected function getContributedProjects(User $user): array
    {
        if (!$user->github_username) {
            return [];
        }

        // Find all public projects with metrics that include this user as a contributor
        $projects = Project::public()
            ->whereNotNull('metrics')
            ->get()
            ->filter(function ($project) use ($user) {
                $contributors = $project->metrics['contributors'] ?? [];
                return collect($contributors)->contains('login', $user->github_username);
            })
            ->map(function ($project) use ($user) {
                $contributors = $project->metrics['contributors'] ?? [];
                $userContribution = collect($contributors)->firstWhere('login', $user->github_username);

                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'slug' => $project->slug,
                    'short_description' => $project->short_description,
                    'thumbnail_url' => $project->thumbnail_url,
                    'contributions' => $userContribution['contributions'] ?? 0,
                ];
            })
            ->sortByDesc('contributions')
            ->values()
            ->toArray();

        return $projects;
    }
}
