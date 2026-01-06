import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    count: number;
    trend: number;
    icon?: React.ReactNode;
}

export function StatsCard({ title, count, trend, icon }: StatsCardProps) {
    const isPositive = trend >= 0;

    return (
        <Card className="border-gray-100 dark:border-gray-800">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                        <div className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{count.toLocaleString()}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    isPositive
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                                        : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                                }`}
                            >
                                {isPositive ? <ArrowUpIcon className="mr-0.5 h-3 w-3" /> : <ArrowDownIcon className="mr-0.5 h-3 w-3" />}
                                {Math.abs(trend)}%
                            </span>
                            <span className="ml-2 text-gray-500 dark:text-gray-400">vs last 30 days</span>
                        </div>
                    </div>
                    {icon && <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800">{icon}</div>}
                </div>
            </CardContent>
        </Card>
    );
}
