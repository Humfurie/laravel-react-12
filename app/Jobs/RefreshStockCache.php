<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RefreshStockCache implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    /**
     * Execute the job - Refresh all stock data in the background.
     */
    public function handle(): void
    {
        Log::info("Starting stock cache refresh");

        // Dispatch jobs to fetch fresh stock data
        FetchStockData::dispatch('getStockList', []);
        FetchStockData::dispatch('getMarketNews', []);

        // Fetch popular stock quotes
        $popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'];

        foreach ($popularStocks as $symbol) {
            FetchStockData::dispatch('getStockQuote', ['symbol' => $symbol]);
            FetchStockData::dispatch('getStockProfile', ['symbol' => $symbol]);
        }

        Log::info("Stock cache refresh jobs dispatched");
    }
}
