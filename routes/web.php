<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SitemapController;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home page - Profile and Portfolio
Route::get('/', function () {
    $blogController = new BlogController;
    $blogs = $blogController->getPrimaryAndLatest();

    // Cache experiences for 30 minutes (only admin's experiences)
    $experiences = Cache::remember('homepage.experiences', 1800, function () {
        return Experience::with('image')
            ->where('user_id', 1)
            ->ordered()
            ->get();
    });

    // Cache expertises for 30 minutes
    $expertises = Cache::remember('homepage.expertises', 1800, function () {
        return Expertise::active()
            ->ordered()
            ->get();
    });

    // Cache featured projects for 10 minutes
    $projectsData = Cache::remember('homepage.projects', 600, function () {
        $featured = Project::query()
            ->public()
            ->with(['primaryImage'])
            ->orderByDesc('is_featured')
            ->orderBy('featured_at', 'desc')
            ->orderBy('sort_order')
            ->take(6)
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

    // Get primary user profile data for homepage
    $primaryUser = Cache::remember('homepage.user_profile', 1800, function () {
        return User::where('email', 'humfurie@gmail.com')->first()
            ?? User::first();
    });

    return Inertia::render('user/home', array_merge($blogs, [
        'experiences' => $experiences,
        'expertises' => $expertises,
        'projects' => $projectsData['featured'],
        'projectStats' => $projectsData['stats'],
        'profileUser' => $primaryUser ? [
            'name' => $primaryUser->name,
            'headline' => $primaryUser->headline,
            'bio' => $primaryUser->bio,
            'about' => $primaryUser->about,
            'profile_stats' => $primaryUser->profile_stats ?? [],
        ] : null,
    ]));
})->name('home');

// Sitemap routes
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap.index');
Route::get('/sitemap-blogs.xml', [SitemapController::class, 'blogs'])->name('sitemap.blogs');

// Blog listing page
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{blog}', [BlogController::class, 'show'])->name('blog.show');

// Property listing pages
Route::get('/properties', [App\Http\Controllers\PropertyListingController::class, 'index'])->name('properties.list');
Route::get('/properties/{property}', [App\Http\Controllers\PropertyListingController::class, 'show'])->name('properties.detail');

// Giveaway pages
Route::get('/giveaways', [App\Http\Controllers\GiveawayController::class, 'index'])->name('giveaways.index');
Route::get('/giveaways/winners', [App\Http\Controllers\GiveawayController::class, 'winners'])->name('giveaways.winners');
Route::get('/giveaways/{giveaway:slug}', [App\Http\Controllers\GiveawayController::class, 'show'])->name('giveaways.show');
Route::get('/giveaways/{giveaway:slug}/entries', [App\Http\Controllers\GiveawayController::class, 'entries'])->name('giveaways.entries');
Route::post('/giveaways/{giveaway:slug}/activate', [App\Http\Controllers\GiveawayController::class, 'activateGiveaway'])->name('giveaways.activate');
Route::post('/giveaways/{giveaway:slug}/pick-winner', [App\Http\Controllers\GiveawayController::class, 'startGiveaway'])->name('giveaways.pick-winner');

// Projects showcase
Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
Route::get('/api/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');

// Public API for experiences
Route::get('/api/experiences', [ExperienceController::class, 'public'])->name('experiences.public');

Route::middleware(['auth', 'verified'])->group(function () {
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
        require __DIR__ . '/admin.php';
    });
});

// Comment routes (authenticated users only)
Route::middleware('auth')->group(function () {
    // Create comments (with rate limiting)
    Route::post('/blogs/{blog}/comments', [App\Http\Controllers\CommentController::class, 'store'])
        ->middleware('throttle:10,1'); // 10 per minute
    Route::post('/giveaways/{giveaway}/comments', [App\Http\Controllers\CommentController::class, 'storeOnGiveaway'])
        ->middleware('throttle:10,1');

    // Update/delete own comments
    Route::put('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'destroy']);

    // Report comments
    Route::post('/comments/{comment}/report', [App\Http\Controllers\CommentController::class, 'report'])
        ->middleware('throttle:5,1'); // 5 reports per minute
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/user.php';
