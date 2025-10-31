<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\CryptoService;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CryptoController extends Controller
{
    public function __construct(
        private readonly CryptoService $cryptoService,
        private readonly StockService  $stockService
    )
    {
    }

    /**
     * Display crypto portfolio page
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // Get query parameters for pagination and sorting
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $sortBy = $request->input('sort_by', 'market_cap');
        $sortOrder = $request->input('sort_order', 'desc');

        // Fetch crypto data from CoinGecko
        $cryptoData = $this->cryptoService->getCryptoList([
            'vs_currency' => 'usd',
            'order' => "{$sortBy}_{$sortOrder}",
            'per_page' => min($perPage, 250), // CoinGecko max per_page is 250
            'page' => $page,
        ]);

        // Transform data for frontend
        $transformedData = collect($cryptoData)->map(function ($crypto) {
            return [
                'id' => $crypto['id'],
                'symbol' => strtoupper($crypto['symbol']),
                'name' => $crypto['name'],
                'price' => $crypto['current_price'] ?? 0,
                'image' => $crypto['image'] ?? null,
                'market_cap' => $crypto['market_cap'] ?? 0,
                'market_cap_rank' => $crypto['market_cap_rank'] ?? null,
                'total_volume' => $crypto['total_volume'] ?? 0,
                'change_24h' => $crypto['price_change_percentage_24h'] ?? 0,
                'high_24h' => $crypto['high_24h'] ?? 0,
                'low_24h' => $crypto['low_24h'] ?? 0,
                'circulating_supply' => $crypto['circulating_supply'] ?? 0,
                'total_supply' => $crypto['total_supply'] ?? null,
                'max_supply' => $crypto['max_supply'] ?? null,
                'ath' => $crypto['ath'] ?? 0,
                'ath_change_percentage' => $crypto['ath_change_percentage'] ?? 0,
                'ath_date' => $crypto['ath_date'] ?? null,
                'atl' => $crypto['atl'] ?? 0,
                'atl_change_percentage' => $crypto['atl_change_percentage'] ?? 0,
                'atl_date' => $crypto['atl_date'] ?? null,
                'last_updated' => $crypto['last_updated'] ?? null,
            ];
        })->toArray();

        // Fetch stock market data
        $stocks = $this->stockService->getPopularStocks();
        $transformedStocks = collect($stocks)->map(function ($stock) {
            return [
                'symbol' => $stock['symbol'] ?? '',
                'name' => $stock['name'] ?? '',
                'price' => $stock['price'] ?? 0,
                'change' => $stock['change'] ?? 0,
                'changesPercentage' => $stock['changesPercentage'] ?? 0,
                'dayHigh' => $stock['dayHigh'] ?? 0,
                'dayLow' => $stock['dayLow'] ?? 0,
                'yearHigh' => $stock['yearHigh'] ?? 0,
                'yearLow' => $stock['yearLow'] ?? 0,
                'marketCap' => $stock['marketCap'] ?? 0,
                'volume' => $stock['volume'] ?? 0,
                'avgVolume' => $stock['avgVolume'] ?? 0,
                'exchange' => $stock['exchange'] ?? 'NASDAQ',
            ];
        })->toArray();

        return Inertia::render('crypto', [
            'cryptoData' => $transformedData,
            'stockData' => $transformedStocks,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => count($transformedData),
            ],
            'filters' => [
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ]
        ]);
    }

    /**
     * Get specific crypto details
     *
     * @param string $coinId
     * @return JsonResponse
     */
    public function show(string $coinId)
    {
        $crypto = $this->cryptoService->getCryptoById($coinId);

        if (!$crypto) {
            return response()->json([
                'error' => 'Cryptocurrency not found'
            ], 404);
        }

        return response()->json($crypto);
    }

    /**
     * Search cryptocurrencies
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');

        if (empty($query)) {
            return response()->json([]);
        }

        $results = $this->cryptoService->searchCrypto($query);

        return response()->json($results);
    }

    /**
     * Get trending cryptocurrencies
     *
     * @return JsonResponse
     */
    public function trending()
    {
        $trending = $this->cryptoService->getTrending();

        return response()->json($trending);
    }

    /**
     * Get crypto chart data
     *
     * @param string $coinId
     * @param Request $request
     * @return JsonResponse
     */
    public function getChart(string $coinId, Request $request)
    {
        $days = $request->input('days', 7);
        $chartData = $this->cryptoService->getMarketChart($coinId, $days);

        return response()->json($chartData);
    }

    /**
     * Get stock chart data
     *
     * @param string $symbol
     * @param Request $request
     * @return JsonResponse
     */
    public function getStockChart(string $symbol, Request $request)
    {
        $range = $request->input('range', '1mo');
        $chartData = $this->stockService->getStockChart($symbol, $range);

        return response()->json($chartData);
    }

    /**
     * Clear crypto cache (admin only - add auth middleware)
     *
     * @return RedirectResponse
     */
    public function clearCache()
    {
        $this->cryptoService->clearCache();

        return redirect()->back()->with('success', 'Crypto cache cleared successfully');
    }
}
