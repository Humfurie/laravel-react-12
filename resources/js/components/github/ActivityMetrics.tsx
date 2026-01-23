import { formatDistanceToNow } from 'date-fns';
import { Clock, GitCommit } from 'lucide-react';

interface ActivityMetricsProps {
    commitCount: number;
    lastCommit: string | null;
}

const ActivityMetrics = ({ commitCount, lastCommit }: ActivityMetricsProps) => {
    const lastUpdated = lastCommit
        ? formatDistanceToNow(new Date(lastCommit), { addSuffix: true })
        : null;

    return (
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {commitCount > 0 && (
                <span className="flex items-center gap-1">
                    <GitCommit className="h-3.5 w-3.5" />
                    {commitCount} commits
                </span>
            )}
            {lastUpdated && (
                <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Updated {lastUpdated}
                </span>
            )}
        </div>
    );
};

export default ActivityMetrics;
