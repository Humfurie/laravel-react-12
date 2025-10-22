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
    // Public read endpoints - higher rate limit (60 requests per minute)
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('properties', [PropertyController::class, 'index'])->name('properties.index');
        Route::get('properties/{property}', [PropertyController::class, 'show'])->name('properties.show');
        Route::get('properties-featured', [PropertyController::class, 'featured'])->name('properties.featured');
        Route::post('properties-search', [PropertyController::class, 'search'])->name('properties.search');
        Route::get('properties/{property}/images', [PropertyController::class, 'getImages'])->name('properties.images.index');
    });

    // Inquiry creation - moderate rate limit (10 requests per minute)
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('properties/{property}/inquiries', [PropertyController::class, 'createInquiry'])->name('properties.inquiries.create');
    });

    // Authenticated write operations - standard rate limit (30 requests per minute)
    Route::middleware(['auth:sanctum', 'throttle:30,1'])->group(function () {
        // Property resource endpoints (create, update, delete)
        Route::post('properties', [PropertyController::class, 'store'])->name('properties.store');
        Route::put('properties/{property}', [PropertyController::class, 'update'])->name('properties.update');
        Route::patch('properties/{property}', [PropertyController::class, 'update']);
        Route::delete('properties/{property}', [PropertyController::class, 'destroy'])->name('properties.destroy');

        // Soft delete management
        Route::post('properties/{id}/restore', [PropertyController::class, 'restore'])->name('properties.restore');
        Route::delete('properties/{id}/force', [PropertyController::class, 'forceDelete'])->name('properties.force-delete');

        // Image management endpoints
        Route::post('properties/{property}/images', [PropertyController::class, 'uploadImage'])->name('properties.images.upload');
        Route::post('properties/{property}/images/reorder', [PropertyController::class, 'reorderImages'])->name('properties.images.reorder');
        Route::post('properties/{property}/images/{image}/primary', [PropertyController::class, 'setPrimaryImage'])->name('properties.images.set-primary');
        Route::delete('properties/{property}/images/{image}', [PropertyController::class, 'deleteImage'])->name('properties.images.destroy');

        // Inquiry management endpoints
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
});
