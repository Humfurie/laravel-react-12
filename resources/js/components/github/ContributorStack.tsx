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

const DEFAULT_AVATAR = '/images/default-avatar.png';

/**
 * Validates that a URL is a safe http/https URL.
 * Prevents XSS via javascript: URLs, data: URIs, or other protocols.
 */
function getSafeAvatarUrl(url: string | null): string {
    if (!url) return DEFAULT_AVATAR;

    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            return url;
        }
    } catch {
        // Invalid URL
    }

    return DEFAULT_AVATAR;
}

const ContributorStack = ({ contributors, authorUsername, maxDisplay = 5 }: ContributorStackProps) => {
    if (!contributors || contributors.length === 0) return null;

    const displayContributors = contributors.slice(0, maxDisplay);
    const remainingCount = contributors.length - maxDisplay;

    return (
        <div className="flex items-center">
            <div className="flex -space-x-2">
                {displayContributors.map((contributor, index) => {
                    const isAuthor = contributor.login && contributor.login === authorUsername;
                    const displayName = contributor.login || 'Contributor';
                    const titleText = `${displayName}${isAuthor ? ' (You)' : ''} - ${contributor.contributions} commits`;

                    return (
                        <img
                            key={contributor.login || index}
                            src={getSafeAvatarUrl(contributor.avatar_url)}
                            alt={displayName}
                            title={titleText}
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
