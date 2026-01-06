<?php

namespace App\Jobs;

use App\Services\StockService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Throwable;

class FetchStockData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string  $method,
        public array   $params = [],
        public ?string $cacheKey = null
    )
    {
    }

    /**
     * Execute the job.
     */
    public function handle(StockService $stockService): void
    {
        try {
            $result = match ($this->method) {
                'getStockList' => $stockService->getStockList(),
                'getStockQuote' => $stockService->getStockQuote($this->params['symbol']),
                'getStockProfile' => $stockService->getStockProfile($this->params['symbol']),
                'getMarketNews' => $stockService->getMarketNews(),
                'getStockChart' => $stockService->getStockChart(
                    $this->params['symbol'],
                    $this->params['range'] ?? '1D'
                ),
                default => throw new InvalidArgumentException("Invalid method: {$this->method}")
            };

            // If a cache key is provided, store the result
            if ($this->cacheKey) {
                Cache::put($this->cacheKey, $result, StockService::CACHE_DURATION);
            }

            Log::info("Stock data fetched successfully", [
                'method' => $this->method,
                'params' => $this->params,
            ]);
        } catch (Exception $e) {
            Log::error("Failed to fetch stock data", [
                'method' => $this->method,
                'params' => $this->params,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::error("Stock data fetch job failed permanently", [
            'method' => $this->method,
            'params' => $this->params,
            'error' => $exception->getMessage(),
        ]);
    }
}
