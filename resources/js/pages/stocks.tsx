import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import PriceChart from '@/components/price-chart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

type SortField = 'name' | 'symbol' | 'price' | 'marketCap' | 'changesPercentage' | 'volume';
type SortOrder = 'asc' | 'desc';

interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changesPercentage: number;
    dayHigh: number;
    dayLow: number;
    yearHigh: number;
    yearLow: number;
    marketCap: number;
    volume: number;
    avgVolume: number;
    exchange: string;
    open: number;
    previousClose: number;
    eps?: number | null;
    pe?: number | null;
    sharesOutstanding: number;
}

interface IndexData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changesPercentage: number;
}

interface StockCardData {
    symbol: string;
    name: string;
    price: number;
    changesPercentage: number;
}

interface StocksProps {
    stockData: StockData[];
    indices: IndexData[];
    gainers: StockCardData[];
    losers: StockCardData[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
    };
}

export default function Stocks({ stockData, indices, gainers, losers, pagination }: StocksProps) {
    const [sortField, setSortField] = useState<SortField>('marketCap');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [perPage, setPerPage] = useState<number>(pagination.per_page || 10);
    const [currentPage, setCurrentPage] = useState<number>(pagination.current_page || 1);
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null);

    // Memoized sorted data
    const sortedData = useMemo(() => {
        return [...stockData].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        });
    }, [stockData, sortField, sortOrder]);

    // Memoized pagination
    const { totalPages, startIndex, paginatedData } = useMemo(() => {
        const pages = Math.ceil(sortedData.length / perPage);
        const start = (currentPage - 1) * perPage;
        const paginated = sortedData.slice(start, start + perPage);

        return {
            totalPages: pages,
            startIndex: start,
            paginatedData: paginated,
        };
    }, [sortedData, perPage, currentPage]);

    // Memoized market statistics
    const { totalMarketCap, totalVolume, avgChange } = useMemo(() => {
        const marketCap = stockData.reduce((sum, item) => sum + item.marketCap, 0);
        const volume = stockData.reduce((sum, item) => sum + item.volume, 0);
        const average = stockData.length > 0 ? stockData.reduce((sum, item) => sum + item.changesPercentage, 0) / stockData.length : 0;

        return {
            totalMarketCap: marketCap,
            totalVolume: volume,
            avgChange: average,
        };
    }, [stockData]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />;
        return sortOrder === 'asc' ? (
            <ArrowUp className="text-brand-orange ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="text-brand-orange ml-2 h-4 w-4" />
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatPercent = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    const formatLargeNumber = (value: number) => {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        return formatCurrency(value);
    };

    return (
        <>
            <Head title="Stock Market" />
            <FloatingNav currentPage="stocks" />

            <div className="from-brand-black to-muted-black min-h-screen bg-gradient-to-b pt-16 sm:pt-20 lg:pt-24">
                <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
                    <div className="mb-6 text-center sm:mb-8">
                        <h1 className="text-brand-white mb-2 text-xl font-bold sm:text-2xl lg:text-4xl">Stock Market</h1>
                        <p className="text-muted-white text-xs sm:text-sm lg:text-base">Real-time stock prices and market data</p>
                    </div>
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {/* Market Indices */}
                        {indices && indices.length > 0 && (
                            <div>
                                <h2 className="text-brand-white mb-3 text-base font-bold sm:text-lg lg:mb-4 lg:text-xl">Market Indices</h2>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {indices.map((index) => (
                                        <Card
                                            key={index.symbol}
                                            className="border-brand-orange/20 from-brand-black to-muted-black bg-gradient-to-br p-3 sm:p-4 lg:p-6"
                                        >
                                            <div className="space-y-1 sm:space-y-2">
                                                <p className="text-muted-white text-[10px] sm:text-xs lg:text-sm">{index.name}</p>
                                                <p className="text-brand-white text-base font-bold sm:text-lg lg:text-2xl">
                                                    {formatCurrency(index.price)}
                                                </p>
                                                <div
                                                    className={`flex items-center gap-0.5 sm:gap-1 ${index.changesPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                                >
                                                    {index.changesPercentage >= 0 ? (
                                                        <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                                                    )}
                                                    <span className="text-xs font-semibold sm:text-sm lg:text-base">
                                                        {formatPercent(index.changesPercentage)}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gainers and Losers */}
                        {(gainers.length > 0 || losers.length > 0) && (
                            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-6">
                                {/* Top Gainers */}
                                {gainers.length > 0 && (
                                    <div>
                                        <h2 className="mb-2 text-base font-bold text-green-400 sm:mb-3 sm:text-lg lg:mb-4 lg:text-xl">Top Gainers</h2>
                                        <div className="space-y-2">
                                            {gainers.map((stock) => (
                                                <Card
                                                    key={stock.symbol}
                                                    className="border-green-500/20 bg-gradient-to-r from-green-900/20 to-transparent p-2.5 sm:p-3 lg:p-4"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-brand-orange font-mono text-xs font-bold sm:text-sm lg:text-base">
                                                                {stock.symbol}
                                                            </p>
                                                            <p className="text-muted-white truncate text-[10px] sm:text-xs lg:text-sm">
                                                                {stock.name}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-brand-white text-xs font-bold sm:text-sm lg:text-base">
                                                                {formatCurrency(stock.price)}
                                                            </p>
                                                            <p className="text-[10px] font-semibold text-green-400 sm:text-xs lg:text-sm">
                                                                {formatPercent(stock.changesPercentage)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Top Losers */}
                                {losers.length > 0 && (
                                    <div>
                                        <h2 className="mb-2 text-base font-bold text-red-400 sm:mb-3 sm:text-lg lg:mb-4 lg:text-xl">Top Losers</h2>
                                        <div className="space-y-2">
                                            {losers.map((stock) => (
                                                <Card
                                                    key={stock.symbol}
                                                    className="border-red-500/20 bg-gradient-to-r from-red-900/20 to-transparent p-2.5 sm:p-3 lg:p-4"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-brand-orange font-mono text-xs font-bold sm:text-sm lg:text-base">
                                                                {stock.symbol}
                                                            </p>
                                                            <p className="text-muted-white truncate text-[10px] sm:text-xs lg:text-sm">
                                                                {stock.name}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-brand-white text-xs font-bold sm:text-sm lg:text-base">
                                                                {formatCurrency(stock.price)}
                                                            </p>
                                                            <p className="text-[10px] font-semibold text-red-400 sm:text-xs lg:text-sm">
                                                                {formatPercent(stock.changesPercentage)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="border-brand-orange/20 from-brand-black to-muted-black bg-gradient-to-br p-3 sm:p-4 lg:p-6">
                                <div className="space-y-1 sm:space-y-2">
                                    <p className="text-muted-white text-[10px] sm:text-xs lg:text-sm">Total Market Cap</p>
                                    <p className="text-brand-white text-base font-bold sm:text-lg lg:text-3xl">{formatLargeNumber(totalMarketCap)}</p>
                                </div>
                            </Card>
                            <Card
                                className={`border p-3 sm:p-4 lg:p-6 ${
                                    avgChange >= 0
                                        ? 'border-green-500/20 bg-gradient-to-br from-green-900/20 to-green-950/20'
                                        : 'border-red-500/20 bg-gradient-to-br from-red-900/20 to-red-950/20'
                                }`}
                            >
                                <div className="space-y-1 sm:space-y-2">
                                    <p className="text-muted-white text-[10px] sm:text-xs lg:text-sm">Avg Change</p>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <p
                                            className={`text-base font-bold sm:text-lg lg:text-3xl ${avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                        >
                                            {formatPercent(avgChange)}
                                        </p>
                                        {avgChange >= 0 ? (
                                            <TrendingUp className="h-4 w-4 text-green-400 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-400 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        )}
                                    </div>
                                </div>
                            </Card>
                            <Card className="border-brand-orange/20 from-brand-black to-muted-black bg-gradient-to-br p-3 sm:col-span-2 sm:p-4 lg:col-span-1 lg:p-6">
                                <div className="space-y-1 sm:space-y-2">
                                    <p className="text-muted-white text-[10px] sm:text-xs lg:text-sm">Total Volume</p>
                                    <p className="text-brand-white text-base font-bold sm:text-lg lg:text-3xl">{formatLargeNumber(totalVolume)}</p>
                                </div>
                            </Card>
                        </div>

                        {/* Stock Table Title */}
                        <h2 className="text-brand-white mt-3 text-base font-bold sm:mt-4 sm:text-lg lg:mt-6 lg:text-2xl">Popular Stocks</h2>

                        {/* Table Controls */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-muted-white text-[10px] sm:text-xs lg:text-sm">Show</span>
                                <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
                                    <SelectTrigger className="border-brand-orange/20 bg-brand-black text-brand-white h-8 w-[70px] text-xs sm:h-9 sm:w-[80px] sm:text-sm lg:w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                        <SelectItem value="1000">1000</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-muted-white text-[10px] sm:text-xs lg:text-sm">entries</span>
                            </div>

                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="border-brand-orange/20 bg-brand-black text-brand-white hover:bg-brand-orange/10 h-8 px-2 text-[10px] sm:h-9 sm:px-3 sm:text-xs lg:text-sm"
                                >
                                    Prev
                                </Button>
                                <span className="text-muted-white text-[10px] sm:text-xs lg:text-sm">
                                    {currentPage}/{totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="border-brand-orange/20 bg-brand-black text-brand-white hover:bg-brand-orange/10 h-8 px-2 text-[10px] sm:h-9 sm:px-3 sm:text-xs lg:text-sm"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>

                        {/* Stock Table */}
                        <Card className="border-brand-orange/20 bg-brand-black -mx-3 overflow-x-auto sm:mx-0">
                            <div className="min-w-[650px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-brand-orange/20 hover:bg-brand-orange/5">
                                            <TableHead
                                                className="text-brand-orange hover:text-brand-orange/80 cursor-pointer text-[10px] sm:text-xs lg:text-sm"
                                                onClick={() => handleSort('symbol')}
                                            >
                                                <div className="flex items-center">
                                                    Symbol
                                                    <SortIcon field="symbol" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-brand-orange hover:text-brand-orange/80 cursor-pointer text-[10px] sm:text-xs lg:text-sm"
                                                onClick={() => handleSort('name')}
                                            >
                                                <div className="flex items-center">
                                                    Name
                                                    <SortIcon field="name" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-brand-orange hover:text-brand-orange/80 cursor-pointer text-[10px] sm:text-xs lg:text-sm"
                                                onClick={() => handleSort('price')}
                                            >
                                                <div className="flex items-center">
                                                    Price
                                                    <SortIcon field="price" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-brand-orange hover:text-brand-orange/80 cursor-pointer text-[10px] sm:text-xs lg:text-sm"
                                                onClick={() => handleSort('changesPercentage')}
                                            >
                                                <div className="flex items-center">
                                                    Change
                                                    <SortIcon field="changesPercentage" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-brand-orange hover:text-brand-orange/80 cursor-pointer text-[10px] sm:text-xs lg:text-sm"
                                                onClick={() => handleSort('marketCap')}
                                            >
                                                <div className="flex items-center">
                                                    <span className="hidden lg:inline">Market Cap</span>
                                                    <span className="lg:hidden">Mkt Cap</span>
                                                    <SortIcon field="marketCap" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-brand-orange hover:text-brand-orange/80 cursor-pointer text-[10px] sm:text-xs lg:text-sm"
                                                onClick={() => handleSort('volume')}
                                            >
                                                <div className="flex items-center">
                                                    <span className="hidden lg:inline">Volume</span>
                                                    <span className="lg:hidden">Vol</span>
                                                    <SortIcon field="volume" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-brand-orange text-[10px] sm:text-xs lg:text-sm">Exchange</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.map((stock) => (
                                            <TableRow
                                                key={stock.symbol}
                                                className="border-brand-orange/10 hover:bg-brand-orange/5 cursor-pointer transition-colors"
                                                onClick={() => setSelectedStock(stock)}
                                            >
                                                <TableCell className="text-brand-orange font-mono text-[10px] font-bold uppercase sm:text-xs lg:text-sm">
                                                    {stock.symbol}
                                                </TableCell>
                                                <TableCell className="text-brand-white max-w-[100px] truncate text-[10px] sm:max-w-none sm:text-xs lg:text-sm">
                                                    {stock.name}
                                                </TableCell>
                                                <TableCell className="text-brand-white text-[10px] sm:text-xs lg:text-sm">
                                                    {formatCurrency(stock.price)}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`text-[10px] sm:text-xs lg:text-sm ${stock.changesPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                                    >
                                                        {formatPercent(stock.changesPercentage)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-brand-white text-[10px] font-semibold sm:text-xs lg:text-sm">
                                                    {formatLargeNumber(stock.marketCap)}
                                                </TableCell>
                                                <TableCell className="text-brand-white text-[10px] sm:text-xs lg:text-sm">
                                                    {stock.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </TableCell>
                                                <TableCell className="text-muted-white text-[10px] sm:text-xs lg:text-sm">{stock.exchange}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        {/* Table Info */}
                        <div className="text-muted-white text-[10px] sm:text-xs lg:text-sm">
                            Showing {startIndex + 1} to {Math.min(startIndex + perPage, sortedData.length)} of {sortedData.length} entries
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Detail Dialog with Chart */}
            <Dialog open={selectedStock !== null} onOpenChange={() => setSelectedStock(null)}>
                <DialogContent className="bg-brand-black border-brand-orange/20 text-brand-white max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            <span>{selectedStock?.name}</span>
                            <span className="text-brand-orange font-mono uppercase">({selectedStock?.symbol})</span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedStock && (
                        <div className="space-y-6">
                            {/* Price Info */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-muted-white mb-1 text-sm">Current Price</p>
                                    <p className="text-2xl font-bold">{formatCurrency(selectedStock.price)}</p>
                                </div>
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-muted-white mb-1 text-sm">Change</p>
                                    <p className={`text-2xl font-bold ${selectedStock.changesPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatPercent(selectedStock.changesPercentage)}
                                    </p>
                                </div>
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-muted-white mb-1 text-sm">Market Cap</p>
                                    <p className="text-xl font-bold">{formatLargeNumber(selectedStock.marketCap)}</p>
                                </div>
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-muted-white mb-1 text-sm">Volume</p>
                                    <p className="text-xl font-bold">
                                        {selectedStock.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-muted-white">Day High</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.dayHigh)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-muted-white">Day Low</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.dayLow)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-muted-white">Open</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.open)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-muted-white">Previous Close</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.previousClose)}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-muted-white">52 Week High</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.yearHigh)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-muted-white">52 Week Low</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.yearLow)}</span>
                                    </div>
                                    {selectedStock.pe && (
                                        <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                            <span className="text-muted-white">P/E Ratio</span>
                                            <span className="font-semibold">{selectedStock.pe.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {selectedStock.eps && (
                                        <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                            <span className="text-muted-white">EPS</span>
                                            <span className="font-semibold">{formatCurrency(selectedStock.eps)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Live Chart */}
                            <div className="from-brand-black to-muted-black border-brand-orange/20 rounded-lg border bg-gradient-to-br p-6">
                                <h3 className="text-brand-orange mb-4 text-lg font-semibold">Price Chart</h3>
                                <PriceChart symbol={selectedStock.symbol} type="stock" />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Footer />
        </>
    );
}
