<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service to interact with CoinGecko API (Free tier)
 * Free API limits: 10-50 calls/minute
 * Documentation: https://www.coingecko.com/en/api/documentation
 */
class CryptoService
{
    private const BASE_URL = 'https://api.coingecko.com/api/v3';
    private const CACHE_DURATION = 300; // 5 minutes cache

    /**
     * Get list of cryptocurrencies with market data
     *
     * @param array $params Query parameters
     * @return array
     */
    public function getCryptoList(array $params = []): array
    {
        $cacheKey = 'crypto_list_' . md5(json_encode($params));

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($params) {
            try {
                $defaultParams = [
                    'vs_currency' => 'usd',
                    'order' => 'market_cap_desc',
                    'per_page' => 100,
                    'page' => 1,
                    'sparkline' => false,
                    'price_change_percentage' => '24h',
                ];

                $queryParams = array_merge($defaultParams, $params);

                $response = Http::timeout(10)
                    ->get(self::BASE_URL . '/coins/markets', $queryParams);

                if ($response->successful()) {
                    return $response->json();
                }

                Log::warning('CoinGecko API failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return [];
            } catch (Exception $e) {
                Log::error('Error fetching crypto data', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                return [];
            }
        });
    }

    /**
     * Get specific cryptocurrency data by ID
     *
     * @param string $coinId CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
     * @return array|null
     */
    public function getCryptoById(string $coinId): ?array
    {
        $cacheKey = "crypto_detail_{$coinId}";

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($coinId) {
            try {
                $response = Http::timeout(10)
                    ->get(self::BASE_URL . "/coins/{$coinId}", [
                        'localization' => false,
                        'tickers' => false,
                        'market_data' => true,
                        'community_data' => false,
                        'developer_data' => false,
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return null;
            } catch (Exception $e) {
                Log::error('Error fetching crypto detail', [
                    'coin_id' => $coinId,
                    'message' => $e->getMessage()
                ]);

                return null;
            }
        });
    }

    /**
     * Get simple price for multiple cryptocurrencies
     *
     * @param array $coinIds Array of coin IDs
     * @param string $vsCurrency Currency to compare against (default: usd)
     * @return array
     */
    public function getSimplePrice(array $coinIds, string $vsCurrency = 'usd'): array
    {
        $cacheKey = 'crypto_simple_price_' . md5(implode(',', $coinIds) . $vsCurrency);

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($coinIds, $vsCurrency) {
            try {
                $response = Http::timeout(10)
                    ->get(self::BASE_URL . '/simple/price', [
                        'ids' => implode(',', $coinIds),
                        'vs_currencies' => $vsCurrency,
                        'include_24hr_change' => true,
                        'include_market_cap' => true,
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return [];
            } catch (Exception $e) {
                Log::error('Error fetching simple prices', [
                    'message' => $e->getMessage()
                ]);

                return [];
            }
        });
    }

    /**
     * Search for cryptocurrencies
     *
     * @param string $query Search query
     * @return array
     */
    public function searchCrypto(string $query): array
    {
        try {
            $response = Http::timeout(10)
                ->get(self::BASE_URL . '/search', [
                    'query' => $query
                ]);

            if ($response->successful()) {
                return $response->json()['coins'] ?? [];
            }

            return [];
        } catch (Exception $e) {
            Log::error('Error searching crypto', [
                'query' => $query,
                'message' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Get trending cryptocurrencies
     *
     * @return array
     */
    public function getTrending(): array
    {
        $cacheKey = 'crypto_trending';

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () {
            try {
                $response = Http::timeout(10)
                    ->get(self::BASE_URL . '/search/trending');

                if ($response->successful()) {
                    return $response->json()['coins'] ?? [];
                }

                return [];
            } catch (Exception $e) {
                Log::error('Error fetching trending crypto', [
                    'message' => $e->getMessage()
                ]);

                return [];
            }
        });
    }

    /**
     * Get historical market data (price chart)
     *
     * @param string $coinId CoinGecko coin ID
     * @param int $days Number of days (1, 7, 14, 30, 90, 180, 365, max)
     * @return array
     */
    public function getMarketChart(string $coinId, int $days = 7): array
    {
        $cacheKey = "crypto_chart_{$coinId}_{$days}";

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($coinId, $days) {
            try {
                $response = Http::timeout(15)
                    ->get(self::BASE_URL . "/coins/{$coinId}/market_chart", [
                        'vs_currency' => 'usd',
                        'days' => $days,
                        'interval' => $days <= 1 ? 'hourly' : 'daily',
                    ]);

                if ($response->successful()) {
                    $data = $response->json();

                    // Transform data for chart
                    $prices = collect($data['prices'] ?? [])->map(function ($item) {
                        return [
                            'timestamp' => $item[0],
                            'date' => date('Y-m-d H:i', $item[0] / 1000),
                            'price' => $item[1],
                        ];
                    })->toArray();

                    return $prices;
                }

                return [];
            } catch (Exception $e) {
                Log::error('Error fetching market chart', [
                    'coin_id' => $coinId,
                    'days' => $days,
                    'message' => $e->getMessage()
                ]);

                return [];
            }
        });
    }

    /**
     * Clear all crypto-related cache
     *
     * @return void
     */
    public function clearCache(): void
    {
        Cache::flush(); // In production, use more specific cache tags
    }
}
