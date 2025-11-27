import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                <div className="text-muted-foreground mt-1 flex items-center text-xs">
                    {isPositive ? <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" /> : <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />}
                    <span className={isPositive ? 'text-green-500' : 'text-red-500'}>{Math.abs(trend)}%</span>
                    <span className="ml-1">from last 30 days</span>
                </div>
            </CardContent>
        </Card>
    );
}
