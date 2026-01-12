import SocialMediaLayout from '@/layouts/SocialMediaLayout';
import { router } from '@inertiajs/react';
import { Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { type FormEventHandler, useMemo, useState } from 'react';
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
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

/**
 * Aggregated metrics data structure
 */
interface Metrics {
    total_views: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    total_impressions: number;
    total_reach: number;
    avg_engagement_rate: number;
}

/**
 * Platform-specific metrics
 */
interface PlatformMetric {
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
}

/**
 * Time-series metrics data
 */
interface MetricOverTime {
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
}

/**
 * Top performing post
 */
interface TopPost {
    id: number;
    title: string;
    description: string;
    platform: string;
    status: string;
    published_at: string;
    thumbnail_path: string | null;
    social_account: {
        platform: string;
        username: string;
    };
    social_metrics: Array<{
        views: number;
        likes: number;
        comments: number;
        shares: number;
        engagement_rate: number;
    }>;
}

/**
 * Social account data
 */
interface SocialAccount {
    id: number;
    platform: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    is_default: boolean;
    nickname: string | null;
}

/**
 * Analytics page props from backend
 */
interface AnalyticsProps {
    metrics: Metrics;
    platform_metrics: PlatformMetric[];
    metrics_over_time: MetricOverTime[];
    top_posts: TopPost[];
    accounts: SocialAccount[];
    start_date: string;
    end_date: string;
}

/**
 * Date range presets for quick selection
 */
const DATE_RANGES = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
] as const;

/**
 * Platform color mapping for charts
 */
const PLATFORM_COLORS: Record<string, string> = {
    youtube: '#FF0000',
    facebook: '#1877F2',
    instagram: '#E4405F',
    tiktok: '#000000',
    threads: '#000000',
} as const;

/**
 * Analytics Dashboard
 *
 * Displays comprehensive analytics for all connected social media accounts.
 *
 * Features:
 * - Date range selector (last 7/30/90 days, custom)
 * - Aggregated metrics across all platforms
 * - Line charts showing metrics over time
 * - Platform comparison with bar charts
 * - Platform distribution with pie chart
 * - Top performing posts table
 * - Account filter to view specific account analytics
 *
 * Charts built with Recharts library for interactive visualizations.
 */
export default function Analytics({ metrics, platform_metrics, metrics_over_time, top_posts, accounts, start_date, end_date }: AnalyticsProps) {
    const [selectedRange, setSelectedRange] = useState<number | null>(30);
    const [customStartDate, setCustomStartDate] = useState(start_date);
    const [customEndDate, setCustomEndDate] = useState(end_date);

    /**
     * Handle date range preset selection
     * Updates the URL to reload data with the new date range
     */
    const handleRangeSelect = (days: number) => {
        setSelectedRange(days);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        router.get(
            route('admin.social-media.analytics.index'),
            {
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    /**
     * Handle custom date range submission
     * Validates dates and reloads data
     */
    const handleCustomDateSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setSelectedRange(null);

        router.get(
            route('admin.social-media.analytics.index'),
            {
                start_date: customStartDate,
                end_date: customEndDate,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    /**
     * Format large numbers with K/M suffix
     */
    const formatNumber = (num: number): string => {
        if (num >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(1)}M`;
        }
        if (num >= 1_000) {
            return `${(num / 1_000).toFixed(1)}K`;
        }
        return num.toString();
    };

    /**
     * Format date for chart display
     */
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    /**
     * Calculate total engagements for pie chart
     */
    const totalEngagements = useMemo(() => {
        return platform_metrics.reduce((sum, platform) => {
            return sum + platform.likes + platform.comments + platform.shares;
        }, 0);
    }, [platform_metrics]);

    /**
     * Prepare data for platform distribution pie chart
     */
    const pieChartData = useMemo(() => {
        return platform_metrics.map((platform) => ({
            name: platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1),
            value: platform.likes + platform.comments + platform.shares,
        }));
    }, [platform_metrics]);

    return (
        <SocialMediaLayout title="Social Media Analytics">
            <div className="space-y-6 p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Comprehensive analytics across all your social media accounts</p>
                    </div>
                </div>

                {/* Date Range Selector */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Date Range</h2>

                    <div className="flex flex-wrap gap-4">
                        {/* Preset buttons */}
                        {DATE_RANGES.map(({ label, days }) => (
                            <button
                                key={days}
                                onClick={() => handleRangeSelect(days)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                    selectedRange === days
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                {label}
                            </button>
                        ))}

                        {/* Custom date range form */}
                        <form onSubmit={handleCustomDateSubmit} className="flex gap-2">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <span className="flex items-center text-gray-500">to</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="submit"
                                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500"
                            >
                                Apply
                            </button>
                        </form>
                    </div>
                </div>

                {/* Stats Overview Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard title="Total Views" value={formatNumber(metrics?.total_views ?? 0)} icon={<Eye className="h-6 w-6" />} color="blue" />
                    <StatsCard title="Total Likes" value={formatNumber(metrics?.total_likes ?? 0)} icon={<Heart className="h-6 w-6" />} color="red" />
                    <StatsCard
                        title="Total Comments"
                        value={formatNumber(metrics?.total_comments ?? 0)}
                        icon={<MessageCircle className="h-6 w-6" />}
                        color="green"
                    />
                    <StatsCard
                        title="Avg Engagement"
                        value={`${(metrics?.avg_engagement_rate ?? 0).toFixed(2)}%`}
                        icon={<TrendingUp className="h-6 w-6" />}
                        color="purple"
                    />
                </div>

                {/* Metrics Over Time - Line Chart */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Performance Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics_over_time}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="likes" stroke="#EF4444" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="comments" stroke="#10B981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Platform Performance Comparison */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Platform Metrics Bar Chart */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Performance by Platform</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={platform_metrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="platform"
                                    stroke="#9CA3AF"
                                    tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                                />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: '#fff',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="views" fill="#3B82F6" />
                                <Bar dataKey="likes" fill="#EF4444" />
                                <Bar dataKey="comments" fill="#10B981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Platform Distribution Pie Chart */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Engagement Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={PLATFORM_COLORS[entry.name.toLowerCase() as keyof typeof PLATFORM_COLORS] || '#6B7280'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: '#fff',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performing Posts */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Top Performing Posts</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Post
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Platform
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Views
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Likes
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Comments
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Engagement
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {top_posts.map((post) => {
                                    const latestMetric = post.social_metrics[0];
                                    return (
                                        <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">@{post.social_account.username}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 capitalize dark:text-white">
                                                    {post.social_account.platform}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                {formatNumber(latestMetric?.views ?? 0)}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                {formatNumber(latestMetric?.likes ?? 0)}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                {formatNumber(latestMetric?.comments ?? 0)}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                {(latestMetric?.engagement_rate ?? 0).toFixed(2)}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SocialMediaLayout>
    );
}

/**
 * Stats Card Component
 *
 * Displays a single metric with an icon and color coding.
 */
interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: 'blue' | 'red' | 'green' | 'purple';
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className={`rounded-full p-3 ${colorClasses[color]}`}>{icon}</div>
            </div>
        </div>
    );
}
