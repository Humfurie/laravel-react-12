<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\SitemapController;
use App\Models\Experience;
use App\Models\Expertise;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home page - Profile and Portfolio
Route::get('/', function () {
    $blogController = new BlogController;
    $blogs = $blogController->getPrimaryAndLatest();

    // Cache experiences for 30 minutes
    $experiences = Cache::remember('homepage.experiences', 1800, function () {
        return Experience::with('image')
            ->ordered()
            ->get();
    });

    // Cache expertises for 30 minutes
    $expertises = Cache::remember('homepage.expertises', 1800, function () {
        return Expertise::active()
            ->ordered()
            ->get();
    });

    return Inertia::render('user/home', array_merge($blogs, [
        'experiences' => $experiences,
        'expertises' => $expertises,
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

// Raffle pages
Route::get('/raffles', [App\Http\Controllers\RaffleController::class, 'index'])->name('raffles.index');
Route::get('/raffles/winners', [App\Http\Controllers\RaffleController::class, 'winners'])->name('raffles.winners');
Route::get('/raffles/{raffle:slug}', [App\Http\Controllers\RaffleController::class, 'show'])->name('raffles.show');
Route::get('/raffles/{raffle:slug}/entries', [App\Http\Controllers\RaffleController::class, 'entries'])->name('raffles.entries');
Route::post('/raffles/{raffle:slug}/activate', [App\Http\Controllers\RaffleController::class, 'activateRaffle'])->name('raffles.activate');
Route::post('/raffles/{raffle:slug}/pick-winner', [App\Http\Controllers\RaffleController::class, 'startRaffle'])->name('raffles.pick-winner');

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
    Route::get('dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');

    Route::prefix('admin')->group(function () {
        require __DIR__ . '/admin.php';
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/user.php';
