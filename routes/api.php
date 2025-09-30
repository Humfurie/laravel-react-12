<?php

use App\Http\Controllers\Api\PropertyController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Property endpoints
    Route::apiResource('properties', PropertyController::class);

    // Additional property endpoints
    Route::get('properties-featured', [PropertyController::class, 'featured']);
    Route::post('properties-search', [PropertyController::class, 'search']);

    // Image management endpoints
    Route::post('properties-upload-image', [PropertyController::class, 'uploadImage']);
    Route::get('properties/{property}/images', [PropertyController::class, 'getImages']);
    Route::delete('properties/{property}/images/{image}', [PropertyController::class, 'deleteImage']);
});