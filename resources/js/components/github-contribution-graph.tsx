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
    // Get month labels based on the calendar data, filtering out overlapping ones
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

        // Filter out labels that would overlap (need at least ~3 weeks / 39px apart)
        const minWeekGap = 3;
        const filtered: typeof labels = [];
        for (const label of labels) {
            if (filtered.length === 0 || label.weekIndex - filtered[filtered.length - 1].weekIndex >= minWeekGap) {
                filtered.push(label);
            }
        }

        return filtered;
    }, [calendar]);

    if (!calendar || calendar.length === 0) {
        return <div className={`text-muted-foreground text-sm ${className}`}>No contribution data available</div>;
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <div className="inline-block">
                {/* Month labels */}
                <div className="text-muted-foreground mb-1 flex text-xs">
                    <div className="w-8 shrink-0" /> {/* Spacer for day labels */}
                    <div className="relative h-4" style={{ width: calendar.length * 13 }}>
                        {monthLabels.map(({ month, weekIndex }, idx) => (
                            <span key={idx} className="absolute text-[10px]" style={{ left: weekIndex * 13 }}>
                                {month}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Graph grid */}
                <div className="flex">
                    {/* Day labels */}
                    <div className="text-muted-foreground mr-1 flex shrink-0 flex-col justify-around text-[10px]" style={{ height: 7 * 10 + 6 * 3 }}>
                        <span>{DAYS[1]}</span>
                        <span>{DAYS[3]}</span>
                        <span>{DAYS[5]}</span>
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
