<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service to interact with Financial Modeling Prep API (Free tier)
 * Free tier: 250 API calls per day
 * Documentation: https://site.financialmodelingprep.com/developer/docs
 */
class StockService
{
    public const CACHE_DURATION = 300; // 5 minutes cache

    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.fmp.api_key');
        $this->baseUrl = config('services.fmp.base_url');
    }

    /**
     * Get major stock market indices (S&P 500, NASDAQ, DOW JONES)
     *
     * @return array
     */
    public function getMarketIndices(): array
    {
        $cacheKey = 'stock_market_indices';

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () {
            try {
                $indices = ['^GSPC', '^IXIC', '^DJI']; // S&P 500, NASDAQ, DOW
                $results = [];

                foreach ($indices as $index) {
                    $response = Http::timeout(10)
                        ->get($this->baseUrl . "/quote", [
                            'symbol' => $index,
                            'apikey' => $this->apiKey,
                        ]);

                    if ($response->successful()) {
                        $data = $response->json();
                        if (!empty($data)) {
                            $results[] = is_array($data) ? $data[0] : $data;
                        }
                    }
                }

                return $results;
            } catch (Exception $e) {
                Log::error('Error fetching market indices', [
                    'message' => $e->getMessage()
                ]);

                return [];
            }
        });
    }

    /**
     * Get list of popular stocks
     *
     * @return array
     */
    public function getPopularStocks(): array
    {
        $cacheKey = 'popular_stocks';

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () {
            try {
                // Get quotes for popular stocks (free tier requires individual calls)
                $symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'NFLX', 'DIS'];
                $results = [];

                foreach ($symbols as $symbol) {
                    $response = Http::timeout(10)
                        ->get($this->baseUrl . "/quote", [
                            'symbol' => $symbol,
                            'apikey' => $this->apiKey,
                        ]);

                    if ($response->successful()) {
                        $data = $response->json();
                        if (!empty($data)) {
                            $results[] = is_array($data) ? $data[0] : $data;
                        }
                    }
                }

                return $results;
            } catch (Exception $e) {
                Log::error('Error fetching popular stocks', [
                    'message' => $e->getMessage()
                ]);

                return [];
            }
        });
    }

    /**
     * Get stock quote by symbol
     *
     * @param string $symbol Stock symbol (e.g., 'AAPL', 'TSLA')
     * @return array|null
     */
    public function getStockQuote(string $symbol): ?array
    {
        $cacheKey = "stock_quote_{$symbol}";

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($symbol) {
            try {
                $response = Http::timeout(10)
                    ->get($this->baseUrl . "/quote", [
                        'symbol' => $symbol,
                        'apikey' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return is_array($data) ? ($data[0] ?? null) : $data;
                }

                return null;
            } catch (Exception $e) {
                Log::error('Error fetching stock quote', [
                    'symbol' => $symbol,
                    'message' => $e->getMessage()
                ]);

                return null;
            }
        });
    }

    /**
     * Search for stocks
     *
     * @param string $query Search query
     * @return array
     */
    public function searchStocks(string $query): array
    {
        try {
            $response = Http::timeout(10)
                ->get($this->baseUrl . "/search-symbol", [
                    'query' => $query,
                    'limit' => 10,
                    'apikey' => $this->apiKey,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (Exception $e) {
            Log::error('Error searching stocks', [
                'query' => $query,
                'message' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Get gainers and losers
     *
     * @return array
     */
    public function getGainersLosers(): array
    {
        $cacheKey = 'stock_gainers_losers';

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () {
            try {
                $gainers = Http::timeout(10)
                    ->get($this->baseUrl . '/gainers', [
                        'apikey' => $this->apiKey,
                    ])
                    ->json();

                $losers = Http::timeout(10)
                    ->get($this->baseUrl . '/losers', [
                        'apikey' => $this->apiKey,
                    ])
                    ->json();

                return [
                    'gainers' => array_slice($gainers ?? [], 0, 5),
                    'losers' => array_slice($losers ?? [], 0, 5),
                ];
            } catch (Exception $e) {
                Log::error('Error fetching gainers/losers', [
                    'message' => $e->getMessage()
                ]);

                return ['gainers' => [], 'losers' => []];
            }
        });
    }

    /**
     * Get historical stock data (alternative: using Yahoo Finance via RapidAPI)
     * Note: For production, consider using Alpha Vantage or other paid APIs
     *
     * @param string $symbol Stock symbol
     * @param string $range Time range (1d, 5d, 1mo, 3mo, 6mo, 1y, 5y)
     * @return array
     */
    public function getStockChart(string $symbol, string $range = '1mo'): array
    {
        $cacheKey = "stock_chart_{$symbol}_{$range}";

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($symbol, $range) {
            try {
                // Using Financial Modeling Prep historical prices
                $response = Http::timeout(15)
                    ->get($this->baseUrl . "/historical-chart", [
                        'symbol' => $symbol,
                        'serietype' => 'line',
                        'apikey' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $historical = $data['historical'] ?? [];

                    // Limit data based on range
                    $daysMap = [
                        '1d' => 1,
                        '5d' => 5,
                        '1mo' => 30,
                        '3mo' => 90,
                        '6mo' => 180,
                        '1y' => 365,
                        '5y' => 1825,
                    ];

                    $days = $daysMap[$range] ?? 30;
                    $limitedData = array_slice($historical, 0, $days);

                    // Transform and reverse (oldest first)
                    return array_reverse(array_map(function ($item) {
                        return [
                            'date' => $item['date'] ?? '',
                            'price' => $item['close'] ?? 0,
                            'open' => $item['open'] ?? 0,
                            'high' => $item['high'] ?? 0,
                            'low' => $item['low'] ?? 0,
                            'volume' => $item['volume'] ?? 0,
                        ];
                    }, $limitedData));
                }

                return [];
            } catch (Exception $e) {
                Log::error('Error fetching stock chart', [
                    'symbol' => $symbol,
                    'range' => $range,
                    'message' => $e->getMessage()
                ]);

                return [];
            }
        });
    }

    /**
     * Get stock list (alias for getPopularStocks)
     *
     * @return array
     */
    public function getStockList(): array
    {
        return $this->getPopularStocks();
    }

    /**
     * Get company profile for a stock
     *
     * @param string $symbol Stock symbol
     * @return array|null
     */
    public function getStockProfile(string $symbol): ?array
    {
        $cacheKey = "stock_profile_{$symbol}";

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($symbol) {
            try {
                $response = Http::timeout(10)
                    ->get($this->baseUrl . "/profile/{$symbol}", [
                        'apikey' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return is_array($data) ? ($data[0] ?? null) : $data;
                }

                return null;
            } catch (Exception $e) {
                Log::error('Error fetching stock profile', [
                    'symbol' => $symbol,
                    'message' => $e->getMessage()
                ]);

                return null;
            }
        });
    }

    /**
     * Get market news
     *
     * @return array
     */
    public function getMarketNews(): array
    {
        $cacheKey = 'market_news';

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () {
            try {
                $response = Http::timeout(10)
                    ->get($this->baseUrl . "/stock_news", [
                        'tickers' => 'AAPL,MSFT,GOOGL,AMZN,TSLA',
                        'limit' => 10,
                        'apikey' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return [];
            } catch (Exception $e) {
                Log::error('Error fetching market news', [
                    'message' => $e->getMessage()
                ]);

                return [];
            }
        });
    }

    /**
     * Clear all stock-related cache
     *
     * @return void
     */
    public function clearCache(): void
    {
        Cache::flush();
    }
}
