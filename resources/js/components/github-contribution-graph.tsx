import { useMemo } from 'react';

interface ContributionDay {
    contributionCount: number;
    date: string;
    color: string;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

interface GitHubContributionGraphProps {
    calendar: ContributionWeek[];
    className?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function GitHubContributionGraph({ calendar, className = '' }: GitHubContributionGraphProps) {
    // Get month labels based on the calendar data
    const monthLabels = useMemo(() => {
        if (!calendar || calendar.length === 0) return [];

        const labels: { month: string; weekIndex: number }[] = [];
        let lastMonth = -1;

        calendar.forEach((week, weekIndex) => {
            if (week.contributionDays.length > 0) {
                const firstDay = week.contributionDays[0];
                const date = new Date(firstDay.date);
                const month = date.getMonth();

                if (month !== lastMonth) {
                    labels.push({ month: MONTHS[month], weekIndex });
                    lastMonth = month;
                }
            }
        });

        return labels;
    }, [calendar]);

    if (!calendar || calendar.length === 0) {
        return <div className={`text-muted-foreground text-sm ${className}`}>No contribution data available</div>;
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <div className="inline-block min-w-max">
                {/* Month labels */}
                <div className="text-muted-foreground mb-1 flex text-xs">
                    <div className="w-8" /> {/* Spacer for day labels */}
                    <div className="relative flex" style={{ width: calendar.length * 13 }}>
                        {monthLabels.map(({ month, weekIndex }, idx) => (
                            <span key={idx} className="absolute" style={{ left: weekIndex * 13 }}>
                                {month}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Graph grid */}
                <div className="flex">
                    {/* Day labels */}
                    <div className="text-muted-foreground mr-1 flex flex-col justify-around text-xs" style={{ height: 91 }}>
                        <span className="h-3">{DAYS[1]}</span>
                        <span className="h-3">{DAYS[3]}</span>
                        <span className="h-3">{DAYS[5]}</span>
                    </div>

                    {/* Contribution cells */}
                    <div className="flex gap-[3px]">
                        {calendar.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-[3px]">
                                {week.contributionDays.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className="h-[10px] w-[10px] rounded-sm transition-transform hover:scale-125"
                                        style={{
                                            backgroundColor: day.color || getContributionColor(day.contributionCount),
                                        }}
                                        title={`${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${formatDate(day.date)}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="text-muted-foreground mt-2 flex items-center justify-end gap-1 text-xs">
                    <span>Less</span>
                    <div className="flex gap-[3px]">
                        {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((color, idx) => (
                            <div key={idx} className="h-[10px] w-[10px] rounded-sm" style={{ backgroundColor: color }} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}

function getContributionColor(count: number): string {
    if (count === 0) return '#ebedf0';
    if (count <= 3) return '#9be9a8';
    if (count <= 6) return '#40c463';
    if (count <= 9) return '#30a14e';
    return '#216e39';
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
