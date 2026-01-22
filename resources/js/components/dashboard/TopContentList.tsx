import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, UsersIcon } from 'lucide-react';

interface ContentItem {
    id: number;
    title?: string;
    name?: string;
    views?: number;
    entries?: number;
}

interface TopContentListProps {
    title: string;
    items: ContentItem[];
    type: 'views' | 'entries';
}

export function TopContentList({ title, items, type }: TopContentListProps) {
    const isEmpty = items.length === 0;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {!isEmpty ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {items.map((item, index) => {
                            const displayTitle = item.title || item.name || 'Untitled';
                            const count = type === 'views' ? item.views : item.entries;

                            return (
                                <div
                                    key={item.id}
                                    className="-mx-6 flex items-center justify-between px-6 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                            {index + 1}
                                        </span>
                                        <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">{displayTitle}</p>
                                    </div>
                                    <div className="ml-2 flex flex-shrink-0 items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                        {type === 'views' ? (
                                            <EyeIcon className="h-4 w-4" strokeWidth={1.5} />
                                        ) : (
                                            <UsersIcon className="h-4 w-4" strokeWidth={1.5} />
                                        )}
                                        <span className="text-sm font-medium">{count?.toLocaleString() || 0}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No content available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
