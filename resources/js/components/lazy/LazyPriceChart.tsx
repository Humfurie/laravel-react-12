import { useEffect, useState } from 'react';

interface PriceChartProps {
    coinId?: string;
    symbol?: string;
    type: 'crypto' | 'stock';
    initialDays?: number;
    initialRange?: string;
}

type PriceChartComponent = React.ComponentType<PriceChartProps>;

function ChartSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {/* Period selector skeleton */}
            <div className="flex justify-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-brand-black/50 h-10 w-12 rounded-lg" />
                ))}
            </div>
            {/* Chart area skeleton */}
            <div className="bg-brand-black/30 h-64 rounded" />
        </div>
    );
}

export function LazyPriceChart(props: PriceChartProps) {
    const [Component, setComponent] = useState<PriceChartComponent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        import('@/components/price-chart').then((mod) => {
            setComponent(() => mod.default);
            setIsLoading(false);
        });
    }, []);

    if (isLoading || !Component) {
        return <ChartSkeleton />;
    }

    return <Component {...props} />;
}
