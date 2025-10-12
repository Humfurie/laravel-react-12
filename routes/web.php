<?php

use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\User\BlogController;
use App\Models\Experience;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home page - Profile and Portfolio
Route::get('/', function () {
    $blogController = new BlogController();
    $blogs = $blogController->getPrimaryAndLatest();

    $experiences = Experience::with('image')
        ->ordered()
        ->get();

    return Inertia::render('user/home', array_merge($blogs, [
        'experiences' => $experiences,
    ]));
})->name('home');

// Blog listing page
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{blog}', [BlogController::class, 'show'])->name('blog.show');

// Public API for experiences
Route::get('/api/experiences', [ExperienceController::class, 'public'])->name('experiences.public');

// Debug route to check experience data
Route::get('/debug-experiences', function () {
    $experiences = Experience::with('image')->ordered()->get();
    return Inertia::render('debug-experiences', [
        'experiences' => $experiences,
    ]);
});


Route::middleware(['auth', 'verified'])->group(function () {
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
