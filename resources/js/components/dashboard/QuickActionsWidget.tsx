import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { FileTextIcon, GiftIcon, HomeIcon, InboxIcon } from 'lucide-react';

export function QuickActionsWidget() {
    const quickActions = [
        {
            title: 'Create Blog Post',
            icon: <FileTextIcon className="h-5 w-5" strokeWidth={1.5} />,
            link: '/admin/blogs/create',
            color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
        },
        {
            title: 'Add Property',
            icon: <HomeIcon className="h-5 w-5" strokeWidth={1.5} />,
            link: '/admin/properties/create',
            color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
        },
        {
            title: 'Create Giveaway',
            icon: <GiftIcon className="h-5 w-5" strokeWidth={1.5} />,
            link: '/admin/giveaways/create',
            color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
        },
        {
            title: 'View Inquiries',
            icon: <InboxIcon className="h-5 w-5" strokeWidth={1.5} />,
            link: '/admin/inquiries',
            color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
        },
    ];

    return (
        <Card className="border-gray-100 dark:border-gray-800">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.link}
                            className="group flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:border-gray-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                        >
                            <div className={`rounded-xl p-3 ${action.color}`}>{action.icon}</div>
                            <span className="text-center text-xs font-medium text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200">
                                {action.title}
                            </span>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
