interface Contributor {
    login: string | null;
    avatar_url: string | null;
    contributions: number;
}

interface ContributorStackProps {
    contributors: Contributor[];
    authorUsername?: string;
    maxDisplay?: number;
}

const ContributorStack = ({ contributors, authorUsername, maxDisplay = 5 }: ContributorStackProps) => {
    if (!contributors || contributors.length === 0) return null;

    const displayContributors = contributors.slice(0, maxDisplay);
    const remainingCount = contributors.length - maxDisplay;

    return (
        <div className="flex items-center">
            <div className="flex -space-x-2">
                {displayContributors.map((contributor, index) => {
                    const isAuthor = contributor.login === authorUsername;
                    return (
                        <img
                            key={contributor.login || index}
                            src={contributor.avatar_url || '/images/default-avatar.png'}
                            alt={contributor.login || 'Contributor'}
                            title={`${contributor.login}${isAuthor ? ' (You)' : ''} - ${contributor.contributions} commits`}
                            className={`h-7 w-7 rounded-full border-2 border-white dark:border-gray-900 ${
                                isAuthor ? 'ring-2 ring-orange-500' : ''
                            }`}
                        />
                    );
                })}
            </div>
            {remainingCount > 0 && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    +{remainingCount} more
                </span>
            )}
        </div>
    );
};

export default ContributorStack;
