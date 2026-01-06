import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { AlertCircleIcon, CalendarIcon, CheckCircle2Icon, FileTextIcon, ImageIcon } from 'lucide-react';

interface ActionItem {
    title: string;
    count: number;
    icon: React.ReactNode;
    link: string;
    status: 'urgent' | 'warning' | 'info' | 'done';
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
            status: inquiriesNeedingFollowUp > 0 ? 'urgent' : 'done',
        },
        {
            title: 'Giveaways ending in 48h',
            count: giveawaysEndingSoon,
            icon: <CalendarIcon className="h-4 w-4" />,
            link: '/admin/giveaways',
            status: giveawaysEndingSoon > 0 ? 'warning' : 'done',
        },
        {
            title: 'Screenshots to verify',
            count: pendingScreenshots,
            icon: <ImageIcon className="h-4 w-4" />,
            link: '/admin/giveaways',
            status: pendingScreenshots > 0 ? 'warning' : 'done',
        },
        {
            title: 'Draft blog posts',
            count: draftBlogs,
            icon: <FileTextIcon className="h-4 w-4" />,
            link: '/admin/blogs',
            status: draftBlogs > 0 ? 'info' : 'done',
        },
    ];

    const totalItems = actionItems.reduce((sum, item) => sum + item.count, 0);
    const completedItems = actionItems.filter((item) => item.count === 0).length;

    // Status styling mapping (Bress-style)
    const statusStyles = {
        urgent: {
            badge: 'destructive' as const,
            icon: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
        },
        warning: {
            badge: 'warning' as const,
            icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
        },
        info: {
            badge: 'progress' as const,
            icon: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
        },
        done: {
            badge: 'success' as const,
            icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
        },
    };

    return (
        <Card className="border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Action Items</CardTitle>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {totalItems} total, {completedItems} completed
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{completedItems}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Done</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{actionItems.length - completedItems}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">In progress</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {actionItems.map((item, index) => {
                        const styles = statusStyles[item.status];
                        const isDone = item.count === 0;

                        return (
                            <Link
                                key={index}
                                href={item.link}
                                className="-mx-6 flex items-center justify-between px-6 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`rounded-lg p-2 ${styles.icon}`}>
                                        {isDone ? <CheckCircle2Icon className="h-4 w-4" /> : item.icon}
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${isDone ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        {item.title}
                                    </span>
                                </div>
                                <Badge variant={styles.badge}>{isDone ? 'Done' : item.count}</Badge>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
