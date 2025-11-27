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
                return <GiftIcon className="h-4 w-4" />;
            case 'inquiry':
                return <InboxIcon className="h-4 w-4" />;
            case 'winner':
                return <TrophyIcon className="h-4 w-4" />;
            case 'blog':
                return <FileTextIcon className="h-4 w-4" />;
        }
    };

    const getActivityColor = (type: Activity['type']) => {
        switch (type) {
            case 'giveaway_entry':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
            case 'inquiry':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
            case 'winner':
                return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'blog':
                return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
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
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {activities.length > 0 ? (
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3 border-b pb-3 last:border-b-0 last:pb-0">
                                <div className={`rounded-md p-2 ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{activity.message}</p>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                            {getActivityLabel(activity.type)}
                                        </Badge>
                                        <span className="text-muted-foreground text-xs">{activity.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted-foreground py-8 text-center">
                        <p>No recent activity</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
