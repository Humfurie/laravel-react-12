<?php

use App\Http\Controllers\User\BlogController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home page with featured content
Route::get('/', function () {
    $blogController = new BlogController();
    $blogs = $blogController->getPrimaryAndLatest();

    return Inertia::render('user/home', $blogs);
})->name('home');

// Blog listing page
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{blog}', [BlogController::class, 'show'])->name('blog.show');

// Contact page
Route::get('/contact', function () {
    $blogController = new BlogController();
    $blogs = $blogController->getPrimaryAndLatest();

    return Inertia::render('user/contact', $blogs);
})->name('contact');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    require __DIR__ . '/admin.php';
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/user.php';
