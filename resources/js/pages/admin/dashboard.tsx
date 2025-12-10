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
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    PieLabelRenderProps,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Bress-style color palette
const CHART_COLORS = {
    primary: '#0891b2', // Cyan-600
    secondary: '#10b981', // Emerald-500
    tertiary: '#8b5cf6', // Violet-500
    quaternary: '#f59e0b', // Amber-500
    quinary: '#ef4444', // Red-500
};

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

const COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.quaternary, CHART_COLORS.quinary, CHART_COLORS.tertiary];

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
                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Giveaway Entries (Last 30 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.charts.giveawayEntries}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip
                                        labelFormatter={(value) => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString();
                                        }}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke={CHART_COLORS.primary}
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{ r: 6, fill: CHART_COLORS.primary }}
                                        name="Entries"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Properties by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.charts.propertiesByStatus}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="count" fill={CHART_COLORS.secondary} name="Properties" radius={[4, 4, 0, 0]} />
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
                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Inquiries by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.insights.inquiriesByType}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(props: PieLabelRenderProps) =>
                                            `${props.name}: ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={90}
                                        innerRadius={50}
                                        fill="#8884d8"
                                        dataKey="count"
                                        paddingAngle={2}
                                    >
                                        {data.insights.inquiriesByType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Content Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4 dark:bg-blue-950/50">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                                            <FileTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Blogs</span>
                                    </div>
                                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.insights.totalBlogs}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/50">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                                            <GiftIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Experiences</span>
                                    </div>
                                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.insights.totalExperiences}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4 dark:bg-purple-950/50">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                                            <HomeIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Real Estate Projects</span>
                                    </div>
                                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.insights.totalProjects}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
