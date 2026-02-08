<?php

namespace App\Http\Controllers;

use App\Services\HomepageCacheService;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ResumeController extends Controller
{
    /**
     * Display the interactive resume page.
     */
    public function index(HomepageCacheService $homepageService): InertiaResponse
    {
        $experiences = $homepageService->getCachedExperiencesData();
        $expertises = $homepageService->getCachedExpertisesData();
        $primaryUser = $homepageService->getCachedUserProfileData();

        return Inertia::render('user/resume', [
            'experiences' => $experiences,
            'expertises' => $expertises,
            'profileUser' => [
                'name' => $primaryUser->name,
                'headline' => $primaryUser->headline,
                'bio' => $primaryUser->bio,
                'about' => $primaryUser->about,
                'email' => $primaryUser->email,
                'social_links' => $primaryUser->social_links,
                'resume_path' => $primaryUser->resume_path,
                'education' => $primaryUser->education ?? [],
                'profile_stats' => $primaryUser->profile_stats ?? [],
                'github_username' => $primaryUser->github_username,
            ],
        ]);
    }
}
