import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { FileTextIcon, GiftIcon, HomeIcon, InboxIcon } from 'lucide-react';

export function QuickActionsWidget() {
    const quickActions = [
        {
            title: 'Create Blog Post',
            icon: <FileTextIcon className="h-4 w-4" />,
            link: '/admin/blogs/create',
            variant: 'default' as const,
        },
        {
            title: 'Add Property',
            icon: <HomeIcon className="h-4 w-4" />,
            link: '/admin/properties/create',
            variant: 'default' as const,
        },
        {
            title: 'Create Giveaway',
            icon: <GiftIcon className="h-4 w-4" />,
            link: '/admin/giveaways/create',
            variant: 'default' as const,
        },
        {
            title: 'View Inquiries',
            icon: <InboxIcon className="h-4 w-4" />,
            link: '/admin/inquiries',
            variant: 'outline' as const,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, index) => (
                        <Link key={index} href={action.link}>
                            <Button variant={action.variant} className="flex h-auto w-full flex-col items-center gap-2 py-4">
                                <div className="bg-primary/10 rounded-full p-2">{action.icon}</div>
                                <span className="text-center text-xs">{action.title}</span>
                            </Button>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
