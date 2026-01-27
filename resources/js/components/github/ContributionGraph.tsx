import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ContributionDay {
    contributionCount: number;
    date: string;
    color: string;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

interface ContributionGraphProps {
    calendar: ContributionWeek[];
    totalContributions: number;
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const ContributionGraph = ({ calendar, totalContributions }: ContributionGraphProps) => {
    const weeks = useMemo(() => {
        // Take last 52 weeks
        return calendar.slice(-52);
    }, [calendar]);

    const getColorClass = (color: string) => {
        // GitHub colors map to Tailwind classes
        const colorMap: Record<string, string> = {
            '#ebedf0': 'bg-gray-100 dark:bg-gray-800',
            '#9be9a8': 'bg-green-200 dark:bg-green-900',
            '#40c463': 'bg-green-400 dark:bg-green-700',
            '#30a14e': 'bg-green-500 dark:bg-green-600',
            '#216e39': 'bg-green-700 dark:bg-green-500',
        };
        return colorMap[color] || 'bg-gray-100 dark:bg-gray-800';
    };

    return (
        <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1">
                <div className="flex gap-[3px]">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {week.contributionDays.map((day, dayIndex) => (
                                <Tooltip key={`${weekIndex}-${dayIndex}`}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`h-[10px] w-[10px] rounded-sm ${getColorClass(day.color)}`}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-medium">
                                            {day.contributionCount} contribution{day.contributionCount !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-primary-foreground/70">{formatDate(day.date)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {totalContributions.toLocaleString()} contributions in the last year
            </p>
        </div>
    );
};

export default ContributionGraph;
