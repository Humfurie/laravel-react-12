<?php

use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;

Route::prefix('roles')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->name('roles.index');
    Route::post('/', [RoleController::class, 'store'])->name('roles.store');
    Route::put('/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    Route::patch('/{role}/restore', [RoleController::class, 'restore'])->name('roles.restore')->withTrashed();
    Route::delete('/{role}/force', [RoleController::class, 'forceDestroy'])->name('roles.forceDestroy');
});

Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('users.index');
    Route::post('/', [UserController::class, 'store'])->name('users.store');
    Route::put('/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::patch('/{user}/restore', [UserController::class, 'restore'])->name('users.restore')->withTrashed();
    Route::delete('/{user}/force', [UserController::class, 'forceDestroy'])->name('users.forceDestroy');
});

Route::prefix('permissions')->group(function () {
    Route::get('/', [PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/', [PermissionController::class, 'store'])->name('permissions.store');
    Route::put('/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
    Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');
    Route::patch('/{permission}/restore', [PermissionController::class, 'restore'])->name('permissions.restore')->withTrashed();
    Route::delete('/{permission}/force', [PermissionController::class, 'forceDestroy'])->name('permissions.force');
});

Route::prefix('about')->group(function () {
    Route::get('/', [AboutController::class, 'index'])->name('about.index');
    Route::post('/', [AboutController::class, 'store'])->name('about.store');
    Route::get('/history', [AboutController::class, 'listHistory'])->name('about.history.list');
    Route::get('/history/{about}', [AboutController::class, 'showHistory'])->name('about.history.show');
    Route::delete('/history/{about}', [AboutController::class, 'destroy'])->name('about.history.destroy');
    Route::delete('/history/{about}/force', [AboutController::class, 'forceDestroy'])->name('about.history.force-destroy');
    Route::patch('/history/{about}', [AboutController::class, 'restore'])->name('about.history.restore')->withTrashed();
    Route::patch('/{about}', [AboutController::class, 'setPrimary'])->name('about.set.primary');
});

Route::prefix('blogs')->group(function () {
    Route::get('/', [BlogController::class, 'index'])->name('blogs.index');
    Route::get('/create', [BlogController::class, 'create'])->name('blogs.create');
    Route::post('/', [BlogController::class, 'store'])->name('blogs.store');
    Route::get('/{blog}', [BlogController::class, 'edit'])->name('blogs.edit');
    Route::put('/{blog}', [BlogController::class, 'update'])->name('blogs.update');
    Route::delete('/{blog}', [BlogController::class, 'destroy'])->name('blogs.destroy');
    Route::patch('/{blog}/restore', [BlogController::class, 'restore'])->name('blogs.restore')->withTrashed();
    Route::delete('/{blog}/force', [BlogController::class, 'forceDestroy'])->name('blogs.force-destroy');
    Route::post('/upload-image', [BlogController::class, 'uploadImage'])->name('blogs.upload-image');
});
