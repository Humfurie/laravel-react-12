<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InquiryController;
use App\Http\Controllers\Api\PropertyController;
use Illuminate\Support\Facades\Route;

// Authentication routes (public)
Route::prefix('v1/auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    // Protected routes
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::prefix('v1')->group(function () {
    // Property resource endpoints
    Route::apiResource('properties', PropertyController::class);

    // Soft delete management
    Route::post('properties/{id}/restore', [PropertyController::class, 'restore'])->name('properties.restore');
    Route::delete('properties/{id}/force', [PropertyController::class, 'forceDelete'])->name('properties.force-delete');

    // Additional property endpoints
    Route::get('properties-featured', [PropertyController::class, 'featured'])->name('properties.featured');
    Route::post('properties-search', [PropertyController::class, 'search'])->name('properties.search');

    // Image management endpoints
    Route::post('properties/{property}/images', [PropertyController::class, 'uploadImage'])->name('properties.images.upload');
    Route::get('properties/{property}/images', [PropertyController::class, 'getImages'])->name('properties.images.index');
    Route::post('properties/{property}/images/reorder', [PropertyController::class, 'reorderImages'])->name('properties.images.reorder');
    Route::post('properties/{property}/images/{image}/primary', [PropertyController::class, 'setPrimaryImage'])->name('properties.images.set-primary');
    Route::delete('properties/{property}/images/{image}', [PropertyController::class, 'deleteImage'])->name('properties.images.destroy');

    // Legacy inquiry endpoints (for backward compatibility)
    Route::post('properties/{property}/inquiries', [PropertyController::class, 'createInquiry'])->name('properties.inquiries.create');
    Route::get('properties/{property}/inquiries', [PropertyController::class, 'getInquiries'])->name('properties.inquiries.index');
    Route::patch('properties/{property}/inquiries/{inquiry}', [PropertyController::class, 'updateInquiryStatus'])->name('properties.inquiries.update-status');

    // Inquiry resource endpoints
    Route::apiResource('inquiries', InquiryController::class)->except(['store']);

    // Additional inquiry endpoints
    Route::get('inquiries-statistics', [InquiryController::class, 'statistics'])->name('inquiries.statistics');
    Route::post('inquiries-bulk-update', [InquiryController::class, 'bulkUpdate'])->name('inquiries.bulk-update');
    Route::post('inquiries/{inquiry}/mark-in-progress', [InquiryController::class, 'markInProgress'])->name('inquiries.mark-in-progress');
    Route::post('inquiries/{inquiry}/mark-responded', [InquiryController::class, 'markResponded'])->name('inquiries.mark-responded');
});
