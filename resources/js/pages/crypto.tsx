import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import PriceChart from '@/components/price-chart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

type SortField = 'name' | 'symbol' | 'price' | 'market_cap' | 'change_24h' | 'total_volume';
type SortOrder = 'asc' | 'desc';

interface CryptoData {
    id: string;
    symbol: string;
    name: string;
    price: number;
    image: string | null;
    market_cap: number;
    market_cap_rank: number | null;
    total_volume: number;
    change_24h: number;
    high_24h: number;
    low_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: string | null;
    atl: number;
    atl_change_percentage: number;
    atl_date: string | null;
    last_updated: string | null;
}

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
}

interface CryptoProps {
    cryptoData: CryptoData[];
    stockData: StockData[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        sort_by: string;
        sort_order: string;
    };
}

export default function Crypto({ cryptoData, stockData, pagination, filters }: CryptoProps) {
    const [sortField, setSortField] = useState<SortField>((filters.sort_by as SortField) || 'market_cap');
    const [sortOrder, setSortOrder] = useState<SortOrder>((filters.sort_order as SortOrder) || 'desc');
    const [perPage, setPerPage] = useState<number>(pagination.per_page || 10);
    const [currentPage, setCurrentPage] = useState<number>(pagination.current_page || 1);
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Handler to fetch more crypto from server
    const handlePerPageChange = (value: string) => {
        const newPerPage = Number(value);
        setIsLoading(true);
        setCurrentPage(1); // Reset to first page

        router.visit('/crypto', {
            data: { per_page: newPerPage },
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setPerPage(newPerPage);
                setIsLoading(false);
            },
        });
    };

    // Memoized sorted data
    const sortedData = useMemo(() => {
        return [...cryptoData].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        });
    }, [cryptoData, sortField, sortOrder]);

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
    const { totalMarketCap, totalVolume, avgChange24h } = useMemo(() => {
        const marketCap = cryptoData.reduce((sum, item) => sum + item.market_cap, 0);
        const volume = cryptoData.reduce((sum, item) => sum + item.total_volume, 0);
        const avgChange = cryptoData.length > 0 ? cryptoData.reduce((sum, item) => sum + item.change_24h, 0) / cryptoData.length : 0;

        return {
            totalMarketCap: marketCap,
            totalVolume: volume,
            avgChange24h: avgChange,
        };
    }, [cryptoData]);

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

    return (
        <>
            <Head title="Crypto Market" />
            <FloatingNav currentPage="crypto" />

            <div className="from-brand-black to-muted-black min-h-screen bg-gradient-to-b pt-16 sm:pt-20 lg:pt-24">
                <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
                    <div className="mb-6 text-center sm:mb-8">
                        <h1 className="text-brand-white mb-2 text-xl font-bold sm:text-2xl lg:text-4xl">Cryptocurrency Market</h1>
                        <p className="text-brand-offwhite text-xs sm:text-sm lg:text-base">Real-time cryptocurrency prices and market data</p>
                    </div>
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                            <Card className="border-brand-orange/20 from-brand-black to-muted-black bg-gradient-to-br p-2.5 sm:p-4 lg:p-6">
                                <div className="space-y-0.5 sm:space-y-2">
                                    <p className="text-brand-offwhite text-[9px] sm:text-xs lg:text-sm">Total Market Cap</p>
                                    <p className="text-brand-white text-sm font-bold break-all sm:text-lg lg:text-3xl">
                                        {formatCurrency(totalMarketCap)}
                                    </p>
                                </div>
                            </Card>
                            <Card
                                className={`border p-2.5 sm:p-4 lg:p-6 ${
                                    avgChange24h >= 0
                                        ? 'border-green-500/20 bg-gradient-to-br from-green-900/20 to-green-950/20'
                                        : 'border-red-500/20 bg-gradient-to-br from-red-900/20 to-red-950/20'
                                }`}
                            >
                                <div className="space-y-0.5 sm:space-y-2">
                                    <p className="text-brand-offwhite text-[9px] sm:text-xs lg:text-sm">Avg 24h Change</p>
                                    <div className="flex items-center gap-0.5 sm:gap-2">
                                        <p
                                            className={`text-sm font-bold sm:text-lg lg:text-3xl ${avgChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                        >
                                            {formatPercent(avgChange24h)}
                                        </p>
                                        {avgChange24h >= 0 ? (
                                            <TrendingUp className="h-3.5 w-3.5 text-green-400 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        ) : (
                                            <TrendingDown className="h-3.5 w-3.5 text-red-400 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        )}
                                    </div>
                                </div>
                            </Card>
                            <Card className="border-brand-orange/20 from-brand-black to-muted-black bg-gradient-to-br p-2.5 sm:col-span-2 sm:p-4 lg:col-span-1 lg:p-6">
                                <div className="space-y-0.5 sm:space-y-2">
                                    <p className="text-brand-offwhite text-[9px] sm:text-xs lg:text-sm">Total 24h Volume</p>
                                    <p className="text-brand-white text-sm font-bold break-all sm:text-lg lg:text-3xl">
                                        {formatCurrency(totalVolume)}
                                    </p>
                                </div>
                            </Card>
                        </div>

                        {/* Stock Market Section */}
                        {stockData && stockData.length > 0 && (
                            <div className="mt-2 sm:mt-4 lg:mt-6">
                                <h2 className="text-brand-white mb-3 text-base font-bold sm:text-lg lg:mb-4 lg:text-2xl">Stock Market</h2>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5 lg:gap-4">
                                    {stockData.map((stock) => (
                                        <Card
                                            key={stock.symbol}
                                            className="border-brand-orange/20 from-brand-black to-muted-black hover:bg-brand-orange/5 cursor-pointer bg-gradient-to-br p-2 transition-colors sm:p-3 lg:p-4"
                                            onClick={() => setSelectedStock(stock)}
                                        >
                                            <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-brand-orange font-mono text-[10px] font-bold sm:text-xs lg:text-sm">
                                                        {stock.symbol}
                                                    </span>
                                                    <span className="text-brand-offwhite text-[8px] sm:text-[10px] lg:text-xs">{stock.exchange}</span>
                                                </div>
                                                <p className="text-brand-offwhite line-clamp-1 truncate text-[10px] sm:text-xs lg:text-sm">
                                                    {stock.name}
                                                </p>
                                                <p className="text-brand-white text-xs font-bold sm:text-sm lg:text-lg">
                                                    {formatCurrency(stock.price)}
                                                </p>
                                                <div
                                                    className={`flex items-center gap-0.5 sm:gap-1 ${stock.changesPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                                >
                                                    {stock.changesPercentage >= 0 ? (
                                                        <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                                                    )}
                                                    <span className="text-[10px] font-semibold sm:text-xs lg:text-sm">
                                                        {formatPercent(stock.changesPercentage)}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Crypto Table Title */}
                        <h2 className="text-brand-white mt-3 text-base font-bold sm:mt-4 sm:text-lg lg:mt-6 lg:text-2xl">Cryptocurrencies</h2>

                        {/* Table Controls */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-brand-offwhite text-[10px] sm:text-xs lg:text-sm">Show</span>
                                <Select value={perPage.toString()} onValueChange={handlePerPageChange} disabled={isLoading}>
                                    <SelectTrigger className="border-brand-orange/20 bg-brand-black text-brand-white h-8 w-[70px] text-xs sm:h-9 sm:w-[80px] sm:text-sm lg:w-[100px]">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                        <SelectItem value="250">250</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-brand-offwhite text-[10px] sm:text-xs lg:text-sm">entries</span>
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
                                <span className="text-brand-offwhite text-[10px] sm:text-xs lg:text-sm">
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

                        {/* Crypto Table */}
                        <Card className="border-brand-orange/20 bg-brand-black -mx-3 overflow-x-auto sm:mx-0">
                            <div className="min-w-[600px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-brand-orange/20 hover:bg-brand-orange/5">
                                            <TableHead className="text-brand-orange w-12 text-[10px] sm:text-xs lg:text-sm">#</TableHead>
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
                                                onClick={() => handleSort('change_24h')}
                                            >
                                                <div className="flex items-center">
                                                    <span className="hidden sm:inline">24h Change</span>
                                                    <span className="sm:hidden">24h</span>
                                                    <SortIcon field="change_24h" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-brand-orange hover:text-brand-orange/80 cursor-pointer text-[10px] sm:text-xs lg:text-sm"
                                                onClick={() => handleSort('market_cap')}
                                            >
                                                <div className="flex items-center">
                                                    <span className="hidden lg:inline">Market Cap</span>
                                                    <span className="lg:hidden">Mkt Cap</span>
                                                    <SortIcon field="market_cap" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-brand-orange hover:text-brand-orange/80 cursor-pointer text-[10px] sm:text-xs lg:text-sm"
                                                onClick={() => handleSort('total_volume')}
                                            >
                                                <div className="flex items-center">
                                                    <span className="hidden lg:inline">24h Volume</span>
                                                    <span className="lg:hidden">Vol</span>
                                                    <SortIcon field="total_volume" />
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.map((crypto, index) => (
                                            <TableRow
                                                key={crypto.id}
                                                className="border-brand-orange/10 hover:bg-brand-orange/5 cursor-pointer transition-colors"
                                                onClick={() => setSelectedCrypto(crypto)}
                                            >
                                                <TableCell className="text-brand-offwhite text-[10px] sm:text-xs lg:text-sm">
                                                    {crypto.market_cap_rank || startIndex + index + 1}
                                                </TableCell>
                                                <TableCell className="text-brand-orange font-mono text-[10px] font-bold uppercase sm:text-xs lg:text-sm">
                                                    {crypto.symbol}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        {crypto.image && (
                                                            <img
                                                                src={crypto.image}
                                                                alt={crypto.name}
                                                                className="h-4 w-4 rounded-full sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                                                            />
                                                        )}
                                                        <span className="text-brand-white max-w-[100px] truncate text-[10px] sm:max-w-none sm:text-xs lg:text-sm">
                                                            {crypto.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-brand-white text-[10px] sm:text-xs lg:text-sm">
                                                    {formatCurrency(crypto.price)}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`text-[10px] sm:text-xs lg:text-sm ${crypto.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                                    >
                                                        {formatPercent(crypto.change_24h)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-brand-white text-[10px] font-semibold sm:text-xs lg:text-sm">
                                                    {formatCurrency(crypto.market_cap)}
                                                </TableCell>
                                                <TableCell className="text-brand-white text-[10px] sm:text-xs lg:text-sm">
                                                    {formatCurrency(crypto.total_volume)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        {/* Table Info */}
                        <div className="text-brand-offwhite text-[10px] sm:text-xs lg:text-sm">
                            Showing {startIndex + 1} to {Math.min(startIndex + perPage, sortedData.length)} of {sortedData.length} entries
                        </div>
                    </div>
                </div>
            </div>

            {/* Crypto Detail Dialog */}
            <Dialog open={selectedCrypto !== null} onOpenChange={() => setSelectedCrypto(null)}>
                <DialogContent className="bg-brand-black border-brand-orange/20 text-brand-white max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            {selectedCrypto?.image && <img src={selectedCrypto.image} alt={selectedCrypto.name} className="h-8 w-8 rounded-full" />}
                            <span>{selectedCrypto?.name}</span>
                            <span className="text-brand-orange font-mono uppercase">({selectedCrypto?.symbol})</span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCrypto && (
                        <div className="space-y-6">
                            {/* Price Info */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-brand-offwhite mb-1 text-sm">Current Price</p>
                                    <p className="text-2xl font-bold">{formatCurrency(selectedCrypto.price)}</p>
                                </div>
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-brand-offwhite mb-1 text-sm">24h Change</p>
                                    <p className={`text-2xl font-bold ${selectedCrypto.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatPercent(selectedCrypto.change_24h)}
                                    </p>
                                </div>
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-brand-offwhite mb-1 text-sm">Market Cap</p>
                                    <p className="text-xl font-bold">{formatCurrency(selectedCrypto.market_cap)}</p>
                                </div>
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-brand-offwhite mb-1 text-sm">24h Volume</p>
                                    <p className="text-xl font-bold">{formatCurrency(selectedCrypto.total_volume)}</p>
                                </div>
                            </div>

                            {/* Additional Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">24h High</span>
                                        <span className="font-semibold">{formatCurrency(selectedCrypto.high_24h)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">24h Low</span>
                                        <span className="font-semibold">{formatCurrency(selectedCrypto.low_24h)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">Market Cap Rank</span>
                                        <span className="font-semibold">#{selectedCrypto.market_cap_rank}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">All Time High</span>
                                        <span className="font-semibold">{formatCurrency(selectedCrypto.ath)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">ATH Change</span>
                                        <span className={selectedCrypto.ath_change_percentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                                            {formatPercent(selectedCrypto.ath_change_percentage)}
                                        </span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">Circulating Supply</span>
                                        <span className="font-semibold">
                                            {selectedCrypto.circulating_supply.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Live Chart */}
                            <div className="from-brand-black to-muted-black border-brand-orange/20 rounded-lg border bg-gradient-to-br p-6">
                                <h3 className="text-brand-orange mb-4 text-lg font-semibold">Price Chart</h3>
                                <PriceChart coinId={selectedCrypto.id} type="crypto" />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Stock Detail Dialog */}
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
                                    <p className="text-brand-offwhite mb-1 text-sm">Current Price</p>
                                    <p className="text-2xl font-bold">{formatCurrency(selectedStock.price)}</p>
                                </div>
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-brand-offwhite mb-1 text-sm">Change</p>
                                    <p className={`text-2xl font-bold ${selectedStock.changesPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatPercent(selectedStock.changesPercentage)}
                                    </p>
                                </div>
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-brand-offwhite mb-1 text-sm">Market Cap</p>
                                    <p className="text-xl font-bold">{formatCurrency(selectedStock.marketCap)}</p>
                                </div>
                                <div className="from-brand-orange/10 border-brand-orange/20 rounded-lg border bg-gradient-to-br to-transparent p-4">
                                    <p className="text-brand-offwhite mb-1 text-sm">Volume</p>
                                    <p className="text-xl font-bold">{formatCurrency(selectedStock.volume)}</p>
                                </div>
                            </div>

                            {/* Additional Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">Day High</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.dayHigh)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">Day Low</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.dayLow)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">Exchange</span>
                                        <span className="font-semibold">{selectedStock.exchange}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">52 Week High</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.yearHigh)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">52 Week Low</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.yearLow)}</span>
                                    </div>
                                    <div className="border-brand-orange/10 flex justify-between border-b pb-2">
                                        <span className="text-brand-offwhite">Avg Volume</span>
                                        <span className="font-semibold">
                                            {selectedStock.avgVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
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
