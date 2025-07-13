<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('user/home');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/user.php';


Route::get('skills', [\App\Http\Controllers\Admin\SkillsController::class, 'index'])->name('skills.index');
Route::post('skills', [\App\Http\Controllers\Admin\SkillsController::class, 'store'])->name('skills.store');
Route::get('skill/{skill}', [\App\Http\Controllers\Admin\SkillsController::class, 'edit'])->name('skills.edit');
Route::put('skills/{skill}', [\App\Http\Controllers\Admin\SkillsController::class, 'update'])->name('skills.update');
Route::delete('skills/{skill}', [\App\Http\Controllers\Admin\SkillsController::class, 'destroy'])->name('skills.destroy');
