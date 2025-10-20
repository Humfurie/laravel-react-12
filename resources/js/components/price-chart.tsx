import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartData {
    date: string;
    price: number;
    timestamp?: number;
}

interface PriceChartProps {
    coinId?: string;
    symbol?: string;
    type: 'crypto' | 'stock';
    initialDays?: number;
    initialRange?: string;
}

export default function PriceChart({ coinId, symbol, type, initialDays = 7, initialRange = '1mo' }: PriceChartProps) {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(type === 'crypto' ? initialDays : initialRange);

    const cryptoPeriods = [
        { label: '1D', value: 1 },
        { label: '7D', value: 7 },
        { label: '1M', value: 30 },
        { label: '3M', value: 90 },
        { label: '1Y', value: 365 },
    ];

    const stockPeriods = [
        { label: '1D', value: '1d' },
        { label: '5D', value: '5d' },
        { label: '1M', value: '1mo' },
        { label: '3M', value: '3mo' },
        { label: '6M', value: '6mo' },
        { label: '1Y', value: '1y' },
    ];

    const fetchChartData = useCallback(async () => {
        setLoading(true);
        try {
            let url = '';
            if (type === 'crypto' && coinId) {
                url = `/crypto-chart/${coinId}?days=${selectedPeriod}`;
            } else if (type === 'stock' && symbol) {
                url = `/stock-chart/${symbol}?range=${selectedPeriod}`;
            }

            const response = await axios.get(url);
            setChartData(response.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    }, [type, coinId, symbol, selectedPeriod]);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    const formatDate = (date: string) => {
        const d = new Date(date);
        if (type === 'crypto' && selectedPeriod === 1) {
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    interface TooltipProps {
        active?: boolean;
        payload?: Array<{
            value: number;
            payload: ChartData;
        }>;
    }

    const CustomTooltip = ({ active, payload }: TooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-brand-black border-brand-orange/20 rounded-lg border p-3 shadow-lg">
                    <p className="text-muted-white mb-1 text-sm">{formatDate(payload[0].payload.date)}</p>
                    <p className="text-brand-white text-lg font-bold">{formatPrice(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    const periods = type === 'crypto' ? cryptoPeriods : stockPeriods;
    const isPositive = chartData.length > 0 && chartData[chartData.length - 1]?.price >= chartData[0]?.price;

    return (
        <div className="space-y-4">
            {/* Period Selector */}
            <div className="flex justify-center gap-2">
                {periods.map((period) => (
                    <button
                        key={period.label}
                        onClick={() => setSelectedPeriod(period.value)}
                        className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                            selectedPeriod === period.value
                                ? 'bg-brand-orange text-white'
                                : 'bg-brand-black border-brand-orange/20 text-muted-white hover:bg-brand-orange/10 border'
                        }`}
                    >
                        {period.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="h-64">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="border-brand-orange h-12 w-12 animate-spin rounded-full border-b-2"></div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="text-muted-white flex h-full items-center justify-center">
                        <p>No chart data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? '#4ade80' : '#f87171'} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isPositive ? '#4ade80' : '#f87171'} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#999" tick={{ fill: '#999', fontSize: 12 }} />
                            <YAxis
                                domain={['auto', 'auto']}
                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                                stroke="#999"
                                tick={{ fill: '#999', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={isPositive ? '#4ade80' : '#f87171'}
                                strokeWidth={2}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
