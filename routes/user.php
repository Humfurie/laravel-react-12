<?php

use App\Http\Controllers\CryptoController;
use App\Http\Controllers\StockController;

// Crypto routes - accessible to everyone (guests and authenticated users)
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
