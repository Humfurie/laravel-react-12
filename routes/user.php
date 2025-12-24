<?php

use App\Http\Controllers\CryptoController;
use App\Http\Controllers\MarketsController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserProfileController;

// Public user profile
Route::get('/u/{username}', [UserProfileController::class, 'show'])->name('user.profile');

// Refresh GitHub contributions (authenticated only)
Route::post('/profile/refresh-github', [UserProfileController::class, 'refreshContributions'])
    ->middleware('auth')
    ->name('user.refresh-github');

// Markets route - combined crypto and stocks
Route::get('/markets', [MarketsController::class, 'index'])->name('markets.index');

// Crypto routes - accessible to everyone (guests and authenticated users)
// Note: These routes are kept for API compatibility and chart endpoints
Route::get('/crypto', [CryptoController::class, 'index'])->name('crypto.index');
Route::get('/crypto/{coinId}', [CryptoController::class, 'show'])->name('crypto.show');
Route::get('/crypto-search', [CryptoController::class, 'search'])->name('crypto.search');
Route::get('/crypto-trending', [CryptoController::class, 'trending'])->name('crypto.trending');
Route::get('/crypto-chart/{coinId}', [CryptoController::class, 'getChart'])->name('crypto.chart');
Route::get('/stock-chart/{symbol}', [CryptoController::class, 'getStockChart'])->name('stock.chart');
Route::post('/crypto/clear-cache', [CryptoController::class, 'clearCache'])->name('crypto.clearCache');

// Stock routes - accessible to everyone (guests and authenticated users)
Route::get('/stocks', [StockController::class, 'index'])->name('stocks.index');
Route::get('/stocks/{symbol}', [StockController::class, 'show'])->name('stocks.show');
Route::get('/stocks-search', [StockController::class, 'search'])->name('stocks.search');
