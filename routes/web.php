<?php

use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\User\BlogController;
use App\Models\Experience;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home page - Profile and Portfolio
Route::get('/', function () {
    $blogController = new BlogController;
    $blogs = $blogController->getPrimaryAndLatest();

    $experiences = Experience::with('image')
        ->ordered()
        ->get();

    return Inertia::render('user/home', array_merge($blogs, [
        'experiences' => $experiences,
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
