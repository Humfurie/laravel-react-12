import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { AlertCircleIcon, CalendarIcon, FileTextIcon, ImageIcon } from 'lucide-react';

interface ActionItem {
    title: string;
    count: number;
    icon: React.ReactNode;
    link: string;
    variant: 'default' | 'destructive' | 'warning' | 'secondary';
}

interface ActionItemsWidgetProps {
    inquiriesNeedingFollowUp: number;
    giveawaysEndingSoon: number;
    pendingScreenshots: number;
    draftBlogs: number;
}

export function ActionItemsWidget({ inquiriesNeedingFollowUp, giveawaysEndingSoon, pendingScreenshots, draftBlogs }: ActionItemsWidgetProps) {
    const actionItems: ActionItem[] = [
        {
            title: 'Inquiries needing follow-up',
            count: inquiriesNeedingFollowUp,
            icon: <AlertCircleIcon className="h-4 w-4" />,
            link: '/admin/inquiries',
            variant: inquiriesNeedingFollowUp > 0 ? 'destructive' : 'default',
        },
        {
            title: 'Giveaways ending in 48h',
            count: giveawaysEndingSoon,
            icon: <CalendarIcon className="h-4 w-4" />,
            link: '/admin/giveaways',
            variant: giveawaysEndingSoon > 0 ? 'warning' : 'default',
        },
        {
            title: 'Screenshots to verify',
            count: pendingScreenshots,
            icon: <ImageIcon className="h-4 w-4" />,
            link: '/admin/giveaways',
            variant: pendingScreenshots > 0 ? 'warning' : 'default',
        },
        {
            title: 'Draft blog posts',
            count: draftBlogs,
            icon: <FileTextIcon className="h-4 w-4" />,
            link: '/admin/blogs',
            variant: 'secondary',
        },
    ];

    const hasActionItems = actionItems.some((item) => item.count > 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Action Items</CardTitle>
            </CardHeader>
            <CardContent>
                {hasActionItems ? (
                    <div className="space-y-3">
                        {actionItems.map((item, index) => {
                            if (item.count === 0) return null;

                            return (
                                <Link
                                    key={index}
                                    href={item.link}
                                    className="hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`rounded-md p-2 ${
                                                item.variant === 'destructive'
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                                    : item.variant === 'warning'
                                                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                      : 'bg-muted'
                                            }`}
                                        >
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{item.title}</p>
                                        </div>
                                    </div>
                                    <Badge variant={item.variant} className="ml-2">
                                        {item.count}
                                    </Badge>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-muted-foreground py-8 text-center">
                        <p>All caught up! No action items at the moment.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
