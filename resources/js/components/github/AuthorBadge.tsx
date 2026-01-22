interface AuthorBadgeProps {
    avatarUrl: string;
    name: string;
}

const AuthorBadge = ({ avatarUrl, name }: AuthorBadgeProps) => {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <img
                    src={avatarUrl}
                    alt={name}
                    className="h-8 w-8 rounded-full ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Author</span>
        </div>
    );
};

export default AuthorBadge;
