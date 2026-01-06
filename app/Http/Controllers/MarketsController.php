<?php

namespace App\Http\Controllers;

use App\Services\CryptoService;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Concurrency;
use Inertia\Inertia;
use Inertia\Response;

class MarketsController extends Controller
{
    public function __construct(
        private readonly CryptoService $cryptoService,
        private readonly StockService  $stockService
    )
    {
    }

    /**
     * Display markets page with both crypto and stocks data
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // Get query parameters for pagination and sorting
        $perPage = (int)$request->input('per_page', 10);
        $page = (int)$request->input('page', 1);
        $sortBy = $request->input('sort_by', 'market_cap');
        $sortOrder = $request->input('sort_order', 'desc');

        // Validate perPage
        $allowedPerPage = [10, 100, 250, 1000];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }

        // Determine which stock fetcher to use
        $stockFetcher = $perPage >= 1000
            ? fn() => $this->stockService->getLargeStockList($perPage)
            : fn() => $this->stockService->getPopularStocks($perPage);

        // Fetch all data in parallel
        [$cryptoData, $stocks, $indices, $gainersLosers] = Concurrency::run([
            fn() => $this->cryptoService->getCryptoList([
                'vs_currency' => 'usd',
                'order' => "{$sortBy}_{$sortOrder}",
                'per_page' => min($perPage, 250), // CoinGecko max per_page is 250
                'page' => $page,
            ]),
            $stockFetcher,
            fn() => $this->stockService->getMarketIndices(),
            fn() => $this->stockService->getGainersLosers(),
        ]);

        // Transform crypto data for frontend
        $transformedCrypto = collect($cryptoData)->map(function ($crypto) {
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

        // Transform stock data for frontend
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
                'open' => $stock['open'] ?? 0,
                'previousClose' => $stock['previousClose'] ?? 0,
                'eps' => $stock['eps'] ?? null,
                'pe' => $stock['pe'] ?? null,
                'sharesOutstanding' => $stock['sharesOutstanding'] ?? 0,
            ];
        })->toArray();

        // Transform indices data
        $transformedIndices = collect($indices)->map(function ($index) {
            return [
                'symbol' => $index['symbol'] ?? '',
                'name' => $index['name'] ?? '',
                'price' => $index['price'] ?? 0,
                'change' => $index['change'] ?? 0,
                'changesPercentage' => $index['changesPercentage'] ?? 0,
            ];
        })->toArray();

        // Transform gainers
        $transformedGainers = collect($gainersLosers['gainers'] ?? [])->map(function ($stock) {
            return [
                'symbol' => $stock['symbol'] ?? '',
                'name' => $stock['name'] ?? '',
                'price' => $stock['price'] ?? 0,
                'changesPercentage' => $stock['changesPercentage'] ?? 0,
            ];
        })->toArray();

        // Transform losers
        $transformedLosers = collect($gainersLosers['losers'] ?? [])->map(function ($stock) {
            return [
                'symbol' => $stock['symbol'] ?? '',
                'name' => $stock['name'] ?? '',
                'price' => $stock['price'] ?? 0,
                'changesPercentage' => $stock['changesPercentage'] ?? 0,
            ];
        })->toArray();

        return Inertia::render('markets', [
            'cryptoData' => $transformedCrypto,
            'stockData' => $transformedStocks,
            'indices' => $transformedIndices,
            'gainers' => $transformedGainers,
            'losers' => $transformedLosers,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => max(count($transformedCrypto), count($transformedStocks)),
            ],
        ]);
    }
}
