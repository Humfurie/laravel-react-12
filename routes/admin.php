<?php

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
