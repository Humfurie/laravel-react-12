import { lazy, Suspense } from 'react';

interface PriceChartProps {
    coinId?: string;
    symbol?: string;
    type: 'crypto' | 'stock';
    initialDays?: number;
    initialRange?: string;
}

const PriceChart = lazy(() => import('@/components/price-chart'));

function ChartSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {/* Period selector skeleton */}
            <div className="flex justify-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                ))}
            </div>
            {/* Chart area skeleton */}
            <div className="h-64 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
    );
}

export function LazyPriceChart(props: PriceChartProps) {
    // SSR safety check
    if (typeof window === 'undefined') {
        return <ChartSkeleton />;
    }

    return (
        <Suspense fallback={<ChartSkeleton />}>
            <PriceChart {...props} />
        </Suspense>
    );
}
