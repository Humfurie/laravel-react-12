import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileTextIcon, GiftIcon, InboxIcon, TrophyIcon } from 'lucide-react';

interface Activity {
    type: 'giveaway_entry' | 'inquiry' | 'winner' | 'blog';
    message: string;
    time: string;
    timestamp: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'giveaway_entry':
                return <GiftIcon className="h-4 w-4" strokeWidth={1.5} />;
            case 'inquiry':
                return <InboxIcon className="h-4 w-4" strokeWidth={1.5} />;
            case 'winner':
                return <TrophyIcon className="h-4 w-4" strokeWidth={1.5} />;
            case 'blog':
                return <FileTextIcon className="h-4 w-4" strokeWidth={1.5} />;
        }
    };

    const getActivityColor = (type: Activity['type']) => {
        switch (type) {
            case 'giveaway_entry':
                return 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400';
            case 'inquiry':
                return 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400';
            case 'winner':
                return 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400';
            case 'blog':
                return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400';
        }
    };

    const getActivityBadgeVariant = (type: Activity['type']) => {
        switch (type) {
            case 'giveaway_entry':
                return 'info';
            case 'inquiry':
                return 'progress';
            case 'winner':
                return 'warning';
            case 'blog':
                return 'success';
        }
    };

    const getActivityLabel = (type: Activity['type']) => {
        switch (type) {
            case 'giveaway_entry':
                return 'Entry';
            case 'inquiry':
                return 'Inquiry';
            case 'winner':
                return 'Winner';
            case 'blog':
                return 'Blog';
        }
    };

    return (
        <Card className="border-gray-100 dark:border-gray-800">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {activities.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {activities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                <div className={`rounded-lg p-2 ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">{activity.message}</p>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <Badge variant={getActivityBadgeVariant(activity.type) as 'info' | 'progress' | 'warning' | 'success'}>
                                            {getActivityLabel(activity.type)}
                                        </Badge>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
