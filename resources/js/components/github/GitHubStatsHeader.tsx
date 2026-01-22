import ContributionGraph from './ContributionGraph';
import StatsRow from './StatsRow';

interface GitHubStatsHeaderProps {
    githubStats: {
        total_contributions: number;
        commits: number;
        pull_requests: number;
        issues: number;
        calendar: Array<{
            contributionDays: Array<{
                contributionCount: number;
                date: string;
                color: string;
            }>;
        }>;
    } | null;
}

const GitHubStatsHeader = ({ githubStats }: GitHubStatsHeaderProps) => {
    if (!githubStats) return null;

    return (
        <div className="mb-12 rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                GitHub Activity
            </h3>
            <ContributionGraph
                calendar={githubStats.calendar}
                totalContributions={githubStats.total_contributions}
            />
            <div className="mt-4">
                <StatsRow
                    totalContributions={githubStats.total_contributions}
                    commits={githubStats.commits}
                    pullRequests={githubStats.pull_requests}
                    issues={githubStats.issues}
                />
            </div>
        </div>
    );
};

export default GitHubStatsHeader;
