import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import { TableSkeleton } from '@/components/markets/TableSkeleton';
import PriceChart from '@/components/price-chart';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

type SortFieldCrypto = 'name' | 'symbol' | 'price' | 'market_cap' | 'change_24h' | 'total_volume';
type SortFieldStock = 'name' | 'symbol' | 'price' | 'marketCap' | 'changesPercentage' | 'volume';
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

interface MarketsProps {
    cryptoData: CryptoData[];
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

// Memoized Crypto Table Row Component
const CryptoTableRow = memo(
    ({
        crypto,
        index,
        onClick,
        formatCurrency,
        formatPercent,
    }: {
        crypto: CryptoData;
        index: number;
        onClick: () => void;
        formatCurrency: (value: number) => string;
        formatPercent: (value: number) => string;
    }) => (
        <TableRow
            className="cursor-pointer border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
            onClick={onClick}
        >
            <TableCell className="text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">
                {crypto.market_cap_rank || index + 1}
            </TableCell>
            <TableCell className="font-mono text-[10px] font-bold text-orange-600 uppercase sm:text-xs lg:text-sm dark:text-orange-400">
                {crypto.symbol}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1 sm:gap-2">
                    {crypto.image && (
                        <img src={crypto.image} alt={crypto.name} loading="lazy" className="h-4 w-4 rounded-full sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    )}
                    <span className="max-w-[100px] truncate text-[10px] text-gray-900 sm:max-w-none sm:text-xs lg:text-sm dark:text-white">
                        {crypto.name}
                    </span>
                </div>
            </TableCell>
            <TableCell className="text-[10px] text-gray-900 sm:text-xs lg:text-sm dark:text-white">{formatCurrency(crypto.price)}</TableCell>
            <TableCell>
                <span
                    className={`text-[10px] sm:text-xs lg:text-sm ${crypto.change_24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                >
                    {formatPercent(crypto.change_24h)}
                </span>
            </TableCell>
            <TableCell className="text-[10px] font-semibold text-gray-900 sm:text-xs lg:text-sm dark:text-white">
                {formatCurrency(crypto.market_cap)}
            </TableCell>
            <TableCell className="text-[10px] text-gray-900 sm:text-xs lg:text-sm dark:text-white">{formatCurrency(crypto.total_volume)}</TableCell>
        </TableRow>
    ),
);
CryptoTableRow.displayName = 'CryptoTableRow';

// Memoized Stock Table Row Component
const StockTableRow = memo(
    ({
        stock,
        onClick,
        formatCurrency,
        formatPercent,
        formatLargeNumber,
    }: {
        stock: StockData;
        onClick: () => void;
        formatCurrency: (value: number) => string;
        formatPercent: (value: number) => string;
        formatLargeNumber: (value: number) => string;
    }) => (
        <TableRow className="cursor-pointer border-gray-200 transition-colors hover:bg-orange-500/5 dark:border-gray-700/10" onClick={onClick}>
            <TableCell className="font-mono text-[10px] font-bold text-orange-600 uppercase sm:text-xs lg:text-sm dark:text-orange-400">
                {stock.symbol}
            </TableCell>
            <TableCell className="max-w-[100px] truncate text-[10px] text-gray-900 sm:max-w-none sm:text-xs lg:text-sm dark:text-white">
                {stock.name}
            </TableCell>
            <TableCell className="text-[10px] text-gray-900 sm:text-xs lg:text-sm dark:text-white">{formatCurrency(stock.price)}</TableCell>
            <TableCell>
                <span className={`text-[10px] sm:text-xs lg:text-sm ${stock.changesPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(stock.changesPercentage)}
                </span>
            </TableCell>
            <TableCell className="text-[10px] font-semibold text-gray-900 sm:text-xs lg:text-sm dark:text-white">
                {formatLargeNumber(stock.marketCap)}
            </TableCell>
            <TableCell className="text-[10px] text-gray-900 sm:text-xs lg:text-sm dark:text-white">
                {stock.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </TableCell>
            <TableCell className="text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">{stock.exchange}</TableCell>
        </TableRow>
    ),
);
StockTableRow.displayName = 'StockTableRow';

export default function Markets({ cryptoData, stockData, indices, gainers, losers, pagination }: MarketsProps) {
    const [activeTab, setActiveTab] = useState<'crypto' | 'stocks'>('crypto');
    const [sortFieldCrypto, setSortFieldCrypto] = useState<SortFieldCrypto>('market_cap');
    const [sortFieldStock, setSortFieldStock] = useState<SortFieldStock>('marketCap');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handlePerPageChange = useCallback((value: string) => {
        setIsLoading(true);
        router.get(
            '/markets',
            { per_page: value },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    }, []);

    const formatCurrency = useCallback((value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    }, []);

    const formatPercent = useCallback((value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    }, []);

    const formatLargeNumber = useCallback(
        (value: number) => {
            if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
            if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
            if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
            return formatCurrency(value);
        },
        [formatCurrency],
    );

    // Crypto logic - simple client-side sorting only
    const sortedCrypto = useMemo(() => {
        return [...cryptoData].sort((a, b) => {
            const aValue = a[sortFieldCrypto];
            const bValue = b[sortFieldCrypto];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        });
    }, [cryptoData, sortFieldCrypto, sortOrder]);

    const { totalMarketCapCrypto, totalVolumeCrypto, avgChange24h } = useMemo(() => {
        const marketCap = cryptoData.reduce((sum, item) => sum + item.market_cap, 0);
        const volume = cryptoData.reduce((sum, item) => sum + item.total_volume, 0);
        const avgChange = cryptoData.length > 0 ? cryptoData.reduce((sum, item) => sum + item.change_24h, 0) / cryptoData.length : 0;

        return {
            totalMarketCapCrypto: marketCap,
            totalVolumeCrypto: volume,
            avgChange24h: avgChange,
        };
    }, [cryptoData]);

    // Stock logic - simple client-side sorting only
    const sortedStocks = useMemo(() => {
        return [...stockData].sort((a, b) => {
            const aValue = a[sortFieldStock];
            const bValue = b[sortFieldStock];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        });
    }, [stockData, sortFieldStock, sortOrder]);

    const { totalMarketCapStocks, totalVolumeStocks, avgChangeStocks } = useMemo(() => {
        const marketCap = stockData.reduce((sum, item) => sum + item.marketCap, 0);
        const volume = stockData.reduce((sum, item) => sum + item.volume, 0);
        const average = stockData.length > 0 ? stockData.reduce((sum, item) => sum + item.changesPercentage, 0) / stockData.length : 0;

        return {
            totalMarketCapStocks: marketCap,
            totalVolumeStocks: volume,
            avgChangeStocks: average,
        };
    }, [stockData]);

    const handleSortCrypto = useCallback((field: SortFieldCrypto) => {
        setSortFieldCrypto((prevField) => {
            if (prevField === field) {
                setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
                return prevField;
            } else {
                setSortOrder('desc');
                return field;
            }
        });
    }, []);

    const handleSortStock = useCallback((field: SortFieldStock) => {
        setSortFieldStock((prevField) => {
            if (prevField === field) {
                setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
                return prevField;
            } else {
                setSortOrder('desc');
                return field;
            }
        });
    }, []);

    const SortIconCrypto = ({ field }: { field: SortFieldCrypto }) => {
        if (sortFieldCrypto !== field) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />;
        return sortOrder === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4 text-orange-600 dark:text-orange-400" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4 text-orange-600 dark:text-orange-400" />
        );
    };

    const SortIconStock = ({ field }: { field: SortFieldStock }) => {
        if (sortFieldStock !== field) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />;
        return sortOrder === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4 text-orange-600 dark:text-orange-400" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4 text-orange-600 dark:text-orange-400" />
        );
    };

    return (
        <>
            <Head title="Markets" />
            <FloatingNav currentPage="markets" />

            <div className="min-h-screen bg-[#FAFAF8] pt-16 sm:pt-20 lg:pt-24 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
                    <div className="mb-6 text-center sm:mb-8">
                        <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-4xl dark:text-white">Financial Markets</h1>
                        <p className="text-xs text-gray-600 sm:text-sm lg:text-base dark:text-gray-400">
                            Real-time cryptocurrency and stock market data
                        </p>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'crypto' | 'stocks')} className="w-full">
                        <TabsList className="mx-auto mb-6 grid w-full max-w-md grid-cols-2 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                            <TabsTrigger value="crypto" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                Cryptocurrency
                            </TabsTrigger>
                            <TabsTrigger value="stocks" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                Stocks
                            </TabsTrigger>
                        </TabsList>

                        {/* Crypto Tab */}
                        <TabsContent value="crypto">
                            <div className="flex flex-col gap-4 sm:gap-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                                    <Card className="border-gray-200 bg-white p-2.5 sm:p-4 lg:p-6 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="space-y-0.5 sm:space-y-2">
                                            <p className="text-[9px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">Total Market Cap</p>
                                            <p className="text-sm font-bold break-all text-gray-900 sm:text-lg lg:text-3xl dark:text-white">
                                                {formatCurrency(totalMarketCapCrypto)}
                                            </p>
                                        </div>
                                    </Card>
                                    <Card
                                        className={`border p-2.5 sm:p-4 lg:p-6 ${
                                            avgChange24h >= 0
                                                ? 'border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-900/20'
                                                : 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-900/20'
                                        }`}
                                    >
                                        <div className="space-y-0.5 sm:space-y-2">
                                            <p className="text-[9px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">Avg 24h Change</p>
                                            <div className="flex items-center gap-0.5 sm:gap-2">
                                                <p
                                                    className={`text-sm font-bold sm:text-lg lg:text-3xl ${avgChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                                >
                                                    {formatPercent(avgChange24h)}
                                                </p>
                                                {avgChange24h >= 0 ? (
                                                    <TrendingUp className="h-3.5 w-3.5 text-green-600 sm:h-5 sm:w-5 lg:h-6 lg:w-6 dark:text-green-400" />
                                                ) : (
                                                    <TrendingDown className="h-3.5 w-3.5 text-red-600 sm:h-5 sm:w-5 lg:h-6 lg:w-6 dark:text-red-400" />
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="border-gray-200 bg-white p-2.5 sm:col-span-2 sm:p-4 lg:col-span-1 lg:p-6 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="space-y-0.5 sm:space-y-2">
                                            <p className="text-[9px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">Total 24h Volume</p>
                                            <p className="text-sm font-bold break-all text-gray-900 sm:text-lg lg:text-3xl dark:text-white">
                                                {formatCurrency(totalVolumeCrypto)}
                                            </p>
                                        </div>
                                    </Card>
                                </div>

                                {/* Crypto Table */}
                                <h2 className="mt-3 text-base font-bold text-gray-900 sm:mt-4 sm:text-lg lg:mt-6 lg:text-2xl dark:text-white">
                                    Cryptocurrencies
                                </h2>

                                {/* Table Controls */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">Show</span>
                                    <Select value={pagination.per_page.toString()} onValueChange={handlePerPageChange} disabled={isLoading}>
                                        <SelectTrigger className="h-9 w-[80px] border-gray-200 bg-white text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                            <SelectItem value="250">250</SelectItem>
                                            <SelectItem value="1000">1000</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">entries</span>
                                </div>

                                <Card className="-mx-3 overflow-x-auto border-gray-200 bg-white sm:mx-0 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="min-w-[600px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                                                    <TableHead className="w-12 text-[10px] text-orange-600 sm:text-xs lg:text-sm dark:text-orange-400">
                                                        #
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-700 sm:text-xs lg:text-sm dark:text-orange-400 dark:hover:text-orange-300"
                                                        onClick={() => handleSortCrypto('symbol')}
                                                    >
                                                        <div className="flex items-center">
                                                            Symbol
                                                            <SortIconCrypto field="symbol" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-700 sm:text-xs lg:text-sm dark:text-orange-400 dark:hover:text-orange-300"
                                                        onClick={() => handleSortCrypto('name')}
                                                    >
                                                        <div className="flex items-center">
                                                            Name
                                                            <SortIconCrypto field="name" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-700 sm:text-xs lg:text-sm dark:text-orange-400 dark:hover:text-orange-300"
                                                        onClick={() => handleSortCrypto('price')}
                                                    >
                                                        <div className="flex items-center">
                                                            Price
                                                            <SortIconCrypto field="price" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-700 sm:text-xs lg:text-sm dark:text-orange-400 dark:hover:text-orange-300"
                                                        onClick={() => handleSortCrypto('change_24h')}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="hidden sm:inline">24h Change</span>
                                                            <span className="sm:hidden">24h</span>
                                                            <SortIconCrypto field="change_24h" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-700 sm:text-xs lg:text-sm dark:text-orange-400 dark:hover:text-orange-300"
                                                        onClick={() => handleSortCrypto('market_cap')}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="hidden lg:inline">Market Cap</span>
                                                            <span className="lg:hidden">Mkt Cap</span>
                                                            <SortIconCrypto field="market_cap" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-700 sm:text-xs lg:text-sm dark:text-orange-400 dark:hover:text-orange-300"
                                                        onClick={() => handleSortCrypto('total_volume')}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="hidden lg:inline">24h Volume</span>
                                                            <span className="lg:hidden">Vol</span>
                                                            <SortIconCrypto field="total_volume" />
                                                        </div>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan={7}>
                                                            <TableSkeleton rows={10} columns={7} />
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    sortedCrypto.map((crypto, index) => (
                                                        <CryptoTableRow
                                                            key={crypto.id}
                                                            crypto={crypto}
                                                            index={index}
                                                            onClick={() => setSelectedCrypto(crypto)}
                                                            formatCurrency={formatCurrency}
                                                            formatPercent={formatPercent}
                                                        />
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>

                                {/* Table Info */}
                                <div className="text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">
                                    Showing {cryptoData.length} cryptocurrencies
                                </div>
                            </div>
                        </TabsContent>

                        {/* Stocks Tab */}
                        <TabsContent value="stocks">
                            <div className="flex flex-col gap-4 sm:gap-6">
                                {/* Market Indices */}
                                {indices && indices.length > 0 && (
                                    <div>
                                        <h2 className="mb-3 text-base font-bold text-gray-900 sm:text-lg lg:mb-4 lg:text-xl dark:text-white">
                                            Market Indices
                                        </h2>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {indices.map((index) => (
                                                <Card
                                                    key={index.symbol}
                                                    className="border-gray-200 bg-gradient-to-br from-white to-gray-100 p-3 sm:p-4 lg:p-6 dark:border-gray-700/20 dark:from-gray-800 dark:to-gray-900"
                                                >
                                                    <div className="space-y-1 sm:space-y-2">
                                                        <p className="text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">
                                                            {index.name}
                                                        </p>
                                                        <p className="text-base font-bold text-gray-900 sm:text-lg lg:text-2xl dark:text-white">
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
                                                <h2 className="mb-2 text-base font-bold text-green-400 sm:mb-3 sm:text-lg lg:mb-4 lg:text-xl">
                                                    Top Gainers
                                                </h2>
                                                <div className="space-y-2">
                                                    {gainers.map((stock) => (
                                                        <Card
                                                            key={stock.symbol}
                                                            className="border-green-500/20 bg-gradient-to-r from-green-900/20 to-transparent p-2.5 sm:p-3 lg:p-4"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-mono text-xs font-bold text-orange-600 sm:text-sm lg:text-base dark:text-orange-400">
                                                                        {stock.symbol}
                                                                    </p>
                                                                    <p className="truncate text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">
                                                                        {stock.name}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs font-bold text-gray-900 sm:text-sm lg:text-base dark:text-white">
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
                                                <h2 className="mb-2 text-base font-bold text-red-400 sm:mb-3 sm:text-lg lg:mb-4 lg:text-xl">
                                                    Top Losers
                                                </h2>
                                                <div className="space-y-2">
                                                    {losers.map((stock) => (
                                                        <Card
                                                            key={stock.symbol}
                                                            className="border-red-500/20 bg-gradient-to-r from-red-900/20 to-transparent p-2.5 sm:p-3 lg:p-4"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-mono text-xs font-bold text-orange-600 sm:text-sm lg:text-base dark:text-orange-400">
                                                                        {stock.symbol}
                                                                    </p>
                                                                    <p className="truncate text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">
                                                                        {stock.name}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs font-bold text-gray-900 sm:text-sm lg:text-base dark:text-white">
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
                                    <Card className="border-gray-200 bg-gradient-to-br from-white to-gray-100 p-3 sm:p-4 lg:p-6 dark:border-gray-700/20 dark:from-gray-800 dark:to-gray-900">
                                        <div className="space-y-1 sm:space-y-2">
                                            <p className="text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">Total Market Cap</p>
                                            <p className="text-base font-bold text-gray-900 sm:text-lg lg:text-3xl dark:text-white">
                                                {formatLargeNumber(totalMarketCapStocks)}
                                            </p>
                                        </div>
                                    </Card>
                                    <Card
                                        className={`border p-3 sm:p-4 lg:p-6 ${
                                            avgChangeStocks >= 0
                                                ? 'border-green-500/20 bg-gradient-to-br from-green-900/20 to-green-950/20'
                                                : 'border-red-500/20 bg-gradient-to-br from-red-900/20 to-red-950/20'
                                        }`}
                                    >
                                        <div className="space-y-1 sm:space-y-2">
                                            <p className="text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">Avg Change</p>
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <p
                                                    className={`text-base font-bold sm:text-lg lg:text-3xl ${avgChangeStocks >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                                >
                                                    {formatPercent(avgChangeStocks)}
                                                </p>
                                                {avgChangeStocks >= 0 ? (
                                                    <TrendingUp className="h-4 w-4 text-green-400 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-400 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="border-gray-200 bg-gradient-to-br from-white to-gray-100 p-3 sm:col-span-2 sm:p-4 lg:col-span-1 lg:p-6 dark:border-gray-700/20 dark:from-gray-800 dark:to-gray-900">
                                        <div className="space-y-1 sm:space-y-2">
                                            <p className="text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">Total Volume</p>
                                            <p className="text-base font-bold text-gray-900 sm:text-lg lg:text-3xl dark:text-white">
                                                {formatLargeNumber(totalVolumeStocks)}
                                            </p>
                                        </div>
                                    </Card>
                                </div>

                                {/* Stock Table Title */}
                                <h2 className="mt-3 text-base font-bold text-gray-900 sm:mt-4 sm:text-lg lg:mt-6 lg:text-2xl dark:text-white">
                                    Popular Stocks
                                </h2>

                                {/* Table Controls */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">Show</span>
                                    <Select value={pagination.per_page.toString()} onValueChange={handlePerPageChange} disabled={isLoading}>
                                        <SelectTrigger className="h-9 w-[80px] border-gray-200 bg-white text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                            <SelectItem value="1000">1000</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">entries</span>
                                </div>

                                {/* Stock Table */}
                                <Card className="-mx-3 overflow-x-auto border-gray-200 bg-white sm:mx-0 dark:border-gray-700/20 dark:bg-gray-800">
                                    <div className="min-w-[650px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-200 hover:bg-orange-500/5 dark:border-gray-700/20">
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-600 sm:text-xs lg:text-sm dark:text-orange-400 dark:text-orange-400/80"
                                                        onClick={() => handleSortStock('symbol')}
                                                    >
                                                        <div className="flex items-center">
                                                            Symbol
                                                            <SortIconStock field="symbol" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-600 sm:text-xs lg:text-sm dark:text-orange-400 dark:text-orange-400/80"
                                                        onClick={() => handleSortStock('name')}
                                                    >
                                                        <div className="flex items-center">
                                                            Name
                                                            <SortIconStock field="name" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-600 sm:text-xs lg:text-sm dark:text-orange-400 dark:text-orange-400/80"
                                                        onClick={() => handleSortStock('price')}
                                                    >
                                                        <div className="flex items-center">
                                                            Price
                                                            <SortIconStock field="price" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-600 sm:text-xs lg:text-sm dark:text-orange-400 dark:text-orange-400/80"
                                                        onClick={() => handleSortStock('changesPercentage')}
                                                    >
                                                        <div className="flex items-center">
                                                            Change
                                                            <SortIconStock field="changesPercentage" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-600 sm:text-xs lg:text-sm dark:text-orange-400 dark:text-orange-400/80"
                                                        onClick={() => handleSortStock('marketCap')}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="hidden lg:inline">Market Cap</span>
                                                            <span className="lg:hidden">Mkt Cap</span>
                                                            <SortIconStock field="marketCap" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="cursor-pointer text-[10px] text-orange-600 hover:text-orange-600 sm:text-xs lg:text-sm dark:text-orange-400 dark:text-orange-400/80"
                                                        onClick={() => handleSortStock('volume')}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="hidden lg:inline">Volume</span>
                                                            <span className="lg:hidden">Vol</span>
                                                            <SortIconStock field="volume" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="text-[10px] text-orange-600 sm:text-xs lg:text-sm dark:text-orange-400">
                                                        Exchange
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan={7}>
                                                            <TableSkeleton rows={10} columns={7} />
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    sortedStocks.map((stock) => (
                                                        <StockTableRow
                                                            key={stock.symbol}
                                                            stock={stock}
                                                            onClick={() => setSelectedStock(stock)}
                                                            formatCurrency={formatCurrency}
                                                            formatPercent={formatPercent}
                                                            formatLargeNumber={formatLargeNumber}
                                                        />
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>

                                {/* Table Info */}
                                <div className="text-[10px] text-gray-600 sm:text-xs lg:text-sm dark:text-gray-400">
                                    Showing {stockData.length} stocks
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Crypto Detail Dialog */}
            <Dialog open={selectedCrypto !== null} onOpenChange={() => setSelectedCrypto(null)}>
                <DialogContent className="max-w-4xl border-gray-200 bg-white text-gray-900 dark:border-gray-700/20 dark:bg-gray-800 dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            {selectedCrypto?.image && (
                                <img src={selectedCrypto.image} alt={selectedCrypto.name} loading="lazy" className="h-8 w-8 rounded-full" />
                            )}
                            <span>{selectedCrypto?.name}</span>
                            <span className="font-mono text-orange-600 uppercase dark:text-orange-400">({selectedCrypto?.symbol})</span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCrypto && (
                        <div className="space-y-6">
                            {/* Price Info */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-500/10 to-transparent p-4 dark:border-gray-700/20">
                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                                    <p className="text-2xl font-bold">{formatCurrency(selectedCrypto.price)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-500/10 to-transparent p-4 dark:border-gray-700/20">
                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">24h Change</p>
                                    <p className={`text-2xl font-bold ${selectedCrypto.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatPercent(selectedCrypto.change_24h)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-500/10 to-transparent p-4 dark:border-gray-700/20">
                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Market Cap</p>
                                    <p className="text-xl font-bold">{formatCurrency(selectedCrypto.market_cap)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-500/10 to-transparent p-4 dark:border-gray-700/20">
                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">24h Volume</p>
                                    <p className="text-xl font-bold">{formatCurrency(selectedCrypto.total_volume)}</p>
                                </div>
                            </div>

                            {/* Additional Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">24h High</span>
                                        <span className="font-semibold">{formatCurrency(selectedCrypto.high_24h)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">24h Low</span>
                                        <span className="font-semibold">{formatCurrency(selectedCrypto.low_24h)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">Market Cap Rank</span>
                                        <span className="font-semibold">#{selectedCrypto.market_cap_rank}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">All Time High</span>
                                        <span className="font-semibold">{formatCurrency(selectedCrypto.ath)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">ATH Change</span>
                                        <span className={selectedCrypto.ath_change_percentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                                            {formatPercent(selectedCrypto.ath_change_percentage)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">Circulating Supply</span>
                                        <span className="font-semibold">
                                            {selectedCrypto.circulating_supply.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Live Chart */}
                            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-100 p-6 dark:border-gray-700/20 dark:from-gray-800 dark:to-gray-900">
                                <h3 className="mb-4 text-lg font-semibold text-orange-600 dark:text-orange-400">Price Chart</h3>
                                <PriceChart coinId={selectedCrypto.id} type="crypto" />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Stock Detail Dialog */}
            <Dialog open={selectedStock !== null} onOpenChange={() => setSelectedStock(null)}>
                <DialogContent className="max-w-4xl border-gray-200 bg-white text-gray-900 dark:border-gray-700/20 dark:bg-gray-800 dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            <span>{selectedStock?.name}</span>
                            <span className="font-mono text-orange-600 uppercase dark:text-orange-400">({selectedStock?.symbol})</span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedStock && (
                        <div className="space-y-6">
                            {/* Price Info */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-500/10 to-transparent p-4 dark:border-gray-700/20">
                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                                    <p className="text-2xl font-bold">{formatCurrency(selectedStock.price)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-500/10 to-transparent p-4 dark:border-gray-700/20">
                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Change</p>
                                    <p className={`text-2xl font-bold ${selectedStock.changesPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatPercent(selectedStock.changesPercentage)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-500/10 to-transparent p-4 dark:border-gray-700/20">
                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Market Cap</p>
                                    <p className="text-xl font-bold">{formatLargeNumber(selectedStock.marketCap)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-500/10 to-transparent p-4 dark:border-gray-700/20">
                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Volume</p>
                                    <p className="text-xl font-bold">
                                        {selectedStock.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">Day High</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.dayHigh)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">Day Low</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.dayLow)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">Open</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.open)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">Previous Close</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.previousClose)}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">52 Week High</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.yearHigh)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                        <span className="text-gray-600 dark:text-gray-400">52 Week Low</span>
                                        <span className="font-semibold">{formatCurrency(selectedStock.yearLow)}</span>
                                    </div>
                                    {selectedStock.pe && (
                                        <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                            <span className="text-gray-600 dark:text-gray-400">P/E Ratio</span>
                                            <span className="font-semibold">{selectedStock.pe.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {selectedStock.eps && (
                                        <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700/10">
                                            <span className="text-gray-600 dark:text-gray-400">EPS</span>
                                            <span className="font-semibold">{formatCurrency(selectedStock.eps)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Live Chart */}
                            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-100 p-6 dark:border-gray-700/20 dark:from-gray-800 dark:to-gray-900">
                                <h3 className="mb-4 text-lg font-semibold text-orange-600 dark:text-orange-400">Price Chart</h3>
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
