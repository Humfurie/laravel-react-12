<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SitemapController;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\Project;
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

    return Inertia::render('user/home', array_merge($blogs, [
        'experiences' => $experiences,
        'expertises' => $expertises,
        'projects' => $projectsData['featured'],
        'projectStats' => $projectsData['stats'],
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

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/user.php';
