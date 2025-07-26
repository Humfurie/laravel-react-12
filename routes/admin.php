<?php

use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;

Route::prefix('roles')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->name('roles.index');
    Route::post('/', [RoleController::class, 'store'])->name('roles.store');
    Route::put('/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    Route::patch('/{role}/restore', [RoleController::class, 'restore'])->name('roles.restore')->withTrashed();
    Route::delete('/{role}/force', [RoleController::class, 'forceDestroy'])->name('roles.forceDestroy');
});

Route::prefix('permissions')->group(function () {
    Route::get('/', [PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/', [PermissionController::class, 'store'])->name('permissions.store');
    Route::put('/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
    Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');
    Route::patch('/{permission}/restore', [PermissionController::class, 'restore'])->name('permissions.restore')->withTrashed();
    Route::delete('/{permission}/force', [PermissionController::class, 'forceDestroy'])->name('permissions.force');
});

Route::prefix('/admin/about')->group(function () {
    Route::get('/', [AboutController::class, 'index'])->name('about.index');
    Route::post('/', [AboutController::class, 'store'])->name('about.store');
    Route::get('/history', [AboutController::class, 'listHistory'])->name('about.history.list');
    Route::get('/history/{about}', [AboutController::class, 'showHistory'])->name('about.history.show');
    Route::delete('/history/{about}', [AboutController::class, 'destroy'])->name('about.history.destroy');
    Route::delete('/history/{about}/force', [AboutController::class, 'forceDestroy'])->name('about.history.force-destroy');
    Route::patch('/history/{about}', [AboutController::class, 'restore'])->name('about.history.restore')->withTrashed();
    Route::patch('/{about}', [AboutController::class, 'setPrimary'])->name('about.set.primary');
});
