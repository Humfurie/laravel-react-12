<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\GuestbookController;
use App\Http\Controllers\OgImageController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\RssFeedController;
use App\Http\Controllers\SitemapController;
use App\Models\Experience;
use App\Services\HomepageCacheService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home page - Profile and Portfolio
Route::get('/', function (HomepageCacheService $homepageService) {
    // Get cached data using HomepageCacheService
    $blogs = $homepageService->getCachedBlogsData();
    $experiences = $homepageService->getCachedExperiencesData();
    $expertises = $homepageService->getCachedExpertisesData();
    $projectsData = $homepageService->getCachedProjectsData();
    $primaryUser = $homepageService->getCachedUserProfileData();
    $githubStats = $homepageService->getCachedGitHubStats();

    return Inertia::render('user/home', array_merge($blogs, [
        'experiences' => $experiences,
        'expertises' => $expertises,
        'projects' => $projectsData['featured'],
        'projectStats' => $projectsData['stats'],
        'githubStats' => $githubStats,
        'profileUser' => [
            'name' => $primaryUser->name,
            'headline' => $primaryUser->headline,
            'bio' => $primaryUser->bio,
            'about' => $primaryUser->about,
            'profile_stats' => $primaryUser->profile_stats ?? [],
            'about_image_path' => $primaryUser->about_image_path,
            'github_username' => $primaryUser->github_username,
        ],
    ]));
})->name('home');

// Sitemap routes
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap.index');
Route::get('/sitemap-pages.xml', [SitemapController::class, 'pages'])->name('sitemap.pages');
Route::get('/sitemap-blogs.xml', [SitemapController::class, 'blogs'])->name('sitemap.blogs');
Route::get('/sitemap-projects.xml', [SitemapController::class, 'projects'])->name('sitemap.projects');

// RSS Feed
Route::get('/feed.xml', [RssFeedController::class, 'rss'])->name('feed.rss');

// OG Image routes
Route::get('/og-image/blog/{slug}', [OgImageController::class, 'blog'])->name('og-image.blog');
Route::get('/og-image/project/{slug}', [OgImageController::class, 'project'])->name('og-image.project');
Route::get('/og-image/page/{name}', [OgImageController::class, 'page'])->name('og-image.page');

// Blog listing page
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{blog}', [BlogController::class, 'show'])->name('blog.show');

// Property listing pages (disabled - using separate Next.js frontend)
// Route::get('/properties', [App\Http\Controllers\PropertyListingController::class, 'index'])->name('properties.list');
// Route::get('/properties/{property}', [App\Http\Controllers\PropertyListingController::class, 'show'])->name('properties.detail');

// Giveaway pages (disabled - using separate Next.js frontend)
// Route::get('/giveaways', [App\Http\Controllers\GiveawayController::class, 'index'])->name('giveaways.index');
// Route::get('/giveaways/winners', [App\Http\Controllers\GiveawayController::class, 'winners'])->name('giveaways.winners');
// Route::get('/giveaways/{giveaway:slug}', [App\Http\Controllers\GiveawayController::class, 'show'])->name('giveaways.show');
// Route::get('/giveaways/{giveaway:slug}/entries', [App\Http\Controllers\GiveawayController::class, 'entries'])->name('giveaways.entries');
// Route::post('/giveaways/{giveaway:slug}/activate', [App\Http\Controllers\GiveawayController::class, 'activateGiveaway'])->name('giveaways.activate');
// Route::post('/giveaways/{giveaway:slug}/pick-winner', [App\Http\Controllers\GiveawayController::class, 'startGiveaway'])->name('giveaways.pick-winner');

// Projects showcase
Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
Route::get('/api/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');

// Deployments API for frontend
Route::get('/api/deployments', [App\Http\Controllers\DeploymentController::class, 'index'])->name('deployments.index');
Route::get('/api/deployments/{slug}', [App\Http\Controllers\DeploymentController::class, 'show'])->name('deployments.show');

// Public API for experiences
Route::get('/api/experiences', [ExperienceController::class, 'public'])->name('experiences.public');

// Guestbook
Route::get('/guestbook', [GuestbookController::class, 'index'])->name('guestbook.index');

// Resume
Route::get('/resume', [ResumeController::class, 'index'])->name('resume.index');

Route::middleware(['auth'])->group(function () {
    // Debug route to check experience data
    Route::get('/debug-experiences', function () {
        Gate::authorize('viewAny', Experience::class);

        $experiences = Experience::with('image')->ordered()->get();

        return Inertia::render('debug-experiences', [
            'experiences' => $experiences,
        ]);
    });
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('admin')->group(function () {
        require __DIR__.'/admin.php';
    });
});

// Guestbook routes (authenticated users only)
Route::middleware('auth')->group(function () {
    Route::post('/guestbook', [GuestbookController::class, 'store'])
        ->middleware('throttle:10,1') // 10 per minute
        ->name('guestbook.store');
    Route::delete('/guestbook/{guestbookEntry}', [GuestbookController::class, 'destroy'])
        ->middleware('throttle:20,1')
        ->name('guestbook.destroy');
});

// Comment routes (authenticated users only)
Route::middleware('auth')->group(function () {
    // Create comments (with rate limiting)
    Route::post('/blogs/{blog}/comments', [App\Http\Controllers\CommentController::class, 'store'])
        ->middleware('throttle:10,1'); // 10 per minute
    // Route::post('/giveaways/{giveaway}/comments', [App\Http\Controllers\CommentController::class, 'storeOnGiveaway'])
    //     ->middleware('throttle:10,1');

    // Update/delete own comments
    Route::put('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'destroy']);

    // Report comments
    Route::post('/comments/{comment}/report', [App\Http\Controllers\CommentController::class, 'report'])
        ->middleware('throttle:5,1'); // 5 reports per minute
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/user.php';
