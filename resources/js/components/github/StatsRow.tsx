import { GitCommit, GitPullRequest, CircleDot, MessageSquare } from 'lucide-react';

interface StatsRowProps {
    totalContributions: number;
    commits: number;
    pullRequests: number;
    issues: number;
}

const StatsRow = ({ totalContributions, commits, pullRequests, issues }: StatsRowProps) => {
    const stats = [
        { label: 'Contributions', value: totalContributions, icon: CircleDot },
        { label: 'Commits', value: commits, icon: GitCommit },
        { label: 'PRs', value: pullRequests, icon: GitPullRequest },
        { label: 'Issues', value: issues, icon: MessageSquare },
    ];

    return (
        <div className="flex flex-wrap gap-6">
            {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {stat.value.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                </div>
            ))}
        </div>
    );
};

export default StatsRow;
