import { Badge } from '@/components/ui/badge';
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
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {!isEmpty ? (
                    <div className="space-y-3">
                        {items.map((item, index) => {
                            const displayTitle = item.title || item.name || 'Untitled';
                            const count = type === 'views' ? item.views : item.entries;

                            return (
                                <div
                                    key={item.id}
                                    className="hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors"
                                >
                                    <div className="flex min-w-0 flex-1 items-center space-x-3">
                                        <Badge variant="outline" className="flex-shrink-0">
                                            #{index + 1}
                                        </Badge>
                                        <p className="truncate text-sm font-medium">{displayTitle}</p>
                                    </div>
                                    <div className="text-muted-foreground ml-2 flex flex-shrink-0 items-center space-x-1">
                                        {type === 'views' ? <EyeIcon className="h-4 w-4" /> : <UsersIcon className="h-4 w-4" />}
                                        <span className="text-sm font-medium">{count?.toLocaleString() || 0}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-muted-foreground py-8 text-center">
                        <p>No content available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
