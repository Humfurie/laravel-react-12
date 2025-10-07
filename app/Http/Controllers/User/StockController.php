<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function __construct(
        private readonly StockService $stockService
    )
    {
    }

    /**
     * Display stock market page
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // Get query parameters for pagination and sorting
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        // Fetch stock data
        $stocks = $this->stockService->getPopularStocks();

        // Get market indices
        $indices = $this->stockService->getMarketIndices();

        // Get gainers and losers
        $gainersLosers = $this->stockService->getGainersLosers();

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

        return Inertia::render('stocks', [
            'stockData' => $transformedStocks,
            'indices' => $transformedIndices,
            'gainers' => $transformedGainers,
            'losers' => $transformedLosers,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => count($transformedStocks),
            ],
        ]);
    }

    /**
     * Get specific stock details
     *
     * @param string $symbol
     * @return JsonResponse
     */
    public function show(string $symbol)
    {
        $stock = $this->stockService->getStockQuote($symbol);

        if (!$stock) {
            return response()->json([
                'error' => 'Stock not found'
            ], 404);
        }

        return response()->json($stock);
    }

    /**
     * Search stocks
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

        $results = $this->stockService->searchStocks($query);

        return response()->json($results);
    }
}
