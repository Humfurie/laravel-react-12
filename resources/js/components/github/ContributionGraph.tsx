import { useMemo } from 'react';

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
                                <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={`h-[10px] w-[10px] rounded-sm ${getColorClass(day.color)}`}
                                    title={`${day.contributionCount} contributions on ${day.date}`}
                                />
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
