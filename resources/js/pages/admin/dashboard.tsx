import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActionItemsWidget } from '@/components/dashboard/ActionItemsWidget';
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TopContentList } from '@/components/dashboard/TopContentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileTextIcon, GiftIcon, HomeIcon, InboxIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardStats {
    blogPosts: { count: number; trend: number };
    properties: { count: number; trend: number };
    giveaways: { count: number; trend: number };
    inquiries: { count: number; trend: number };
}

interface ActionItems {
    inquiriesNeedingFollowUp: number;
    giveawaysEndingSoon: number;
    pendingScreenshots: number;
    draftBlogs: number;
}

interface ChartData {
    giveawayEntries: Array<{ date: string; count: number }>;
    propertiesByStatus: Array<{ status: string; count: number }>;
}

interface Activity {
    type: 'giveaway_entry' | 'inquiry' | 'winner' | 'blog';
    message: string;
    time: string;
    timestamp: string;
}

interface TopContent {
    topBlogs: Array<{ id: number; title: string; views: number }>;
    topProperties: Array<{ id: number; name: string; views: number }>;
    topGiveaways: Array<{ id: number; title: string; entries: number }>;
}

interface Insights {
    inquiriesByType: Array<{ type: string; count: number }>;
    totalBlogs: number;
    totalExperiences: number;
    totalProjects: number;
}

interface DashboardData {
    stats: DashboardStats;
    actionItems: ActionItems;
    charts: ChartData;
    recentActivity: Activity[];
    topContent: TopContent;
    insights: Insights;
}

interface DashboardProps {
    dashboardData: DashboardData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard({ dashboardData }: DashboardProps) {
    const data = dashboardData;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Row 1: Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Blog Posts"
                        count={data.stats.blogPosts.count}
                        trend={data.stats.blogPosts.trend}
                        icon={<FileTextIcon className="text-muted-foreground h-4 w-4" />}
                    />
                    <StatsCard
                        title="Available Properties"
                        count={data.stats.properties.count}
                        trend={data.stats.properties.trend}
                        icon={<HomeIcon className="text-muted-foreground h-4 w-4" />}
                    />
                    <StatsCard
                        title="Active Giveaways"
                        count={data.stats.giveaways.count}
                        trend={data.stats.giveaways.trend}
                        icon={<GiftIcon className="text-muted-foreground h-4 w-4" />}
                    />
                    <StatsCard
                        title="New Inquiries"
                        count={data.stats.inquiries.count}
                        trend={data.stats.inquiries.trend}
                        icon={<InboxIcon className="text-muted-foreground h-4 w-4" />}
                    />
                </div>

                {/* Row 2: Action Items + Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <ActionItemsWidget {...data.actionItems} />
                    </div>
                    <div>
                        <QuickActionsWidget />
                    </div>
                </div>

                {/* Row 3: Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Giveaway Entries (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.charts.giveawayEntries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(value) => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString();
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Entries" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Properties by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.charts.propertiesByStatus}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="status" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#3b82f6" name="Properties" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Row 4: Recent Activity + Top Content */}
                <div className="grid gap-4 md:grid-cols-2">
                    <ActivityFeed activities={data.recentActivity} />
                    <div className="space-y-4">
                        <TopContentList title="Top Blog Posts" items={data.topContent.topBlogs} type="views" />
                    </div>
                </div>

                {/* Row 5: More Top Content */}
                <div className="grid gap-4 md:grid-cols-2">
                    <TopContentList title="Most Viewed Properties" items={data.topContent.topProperties} type="views" />
                    <TopContentList title="Popular Giveaways" items={data.topContent.topGiveaways} type="entries" />
                </div>

                {/* Row 6: Additional Insights */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Inquiries by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.insights.inquiriesByType}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {data.insights.inquiriesByType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Content Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <span className="text-sm font-medium">Total Blogs</span>
                                    <span className="text-2xl font-bold">{data.insights.totalBlogs}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <span className="text-sm font-medium">Experiences</span>
                                    <span className="text-2xl font-bold">{data.insights.totalExperiences}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <span className="text-sm font-medium">Real Estate Projects</span>
                                    <span className="text-2xl font-bold">{data.insights.totalProjects}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
