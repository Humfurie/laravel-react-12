import AccountGroupCard from '@/components/social-media/AccountGroupCard';
import PostStatusBadge from '@/components/social-media/PostStatusBadge';
import SocialMediaLayout from '@/layouts/SocialMediaLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, FileVideo, Link as LinkIcon, PlusCircle, TrendingUp } from 'lucide-react';

/**
 * Social Account Interface
 *
 * Represents a connected social media account
 */
interface SocialAccount {
    id: number;
    platform: string;
    username: string;
    name: string;
    avatar_url: string | null;
    is_default: boolean;
    nickname: string | null;
    status: 'active' | 'expired' | 'error';
    token_expires_at: string | null;
}

/**
 * Recent Post Interface
 *
 * Represents a recent social media post
 */
interface RecentPost {
    id: number;
    title: string;
    status: 'draft' | 'scheduled' | 'processing' | 'published' | 'failed';
    scheduled_at: string | null;
    published_at: string | null;
    created_at: string;
    social_account: {
        platform: string;
        username: string;
        name: string;
    };
}

/**
 * Dashboard Stats Interface
 *
 * Statistics for the dashboard overview
 */
interface DashboardStats {
    total_accounts: number;
    total_posts: number;
    published_posts: number;
    scheduled_posts: number;
}

/**
 * Dashboard Page Props
 *
 * Props passed from Laravel controller via Inertia
 */
interface DashboardProps {
    /** Connected accounts grouped by platform */
    accounts: Record<string, SocialAccount[]>;
    /** Recent posts activity */
    recent_posts: RecentPost[];
    /** Dashboard statistics */
    stats: DashboardStats;
}

/**
 * Platform Configuration
 *
 * Display information for each platform
 */
const PLATFORM_CONFIG: Record<string, { name: string; icon: string }> = {
    youtube: { name: 'YouTube', icon: '▶️' },
    facebook: { name: 'Facebook', icon: '📘' },
    instagram: { name: 'Instagram', icon: '📷' },
    tiktok: { name: 'TikTok', icon: '🎵' },
    threads: { name: 'Threads', icon: '🧵' },
};

/**
 * Social Media Dashboard Page
 *
 * Main dashboard for social media management with:
 * - Statistics overview (accounts, posts, scheduled)
 * - Connected accounts grouped by platform
 * - Recent posts activity feed
 * - Quick action buttons
 * - Empty state for new users
 * - Dark mode support
 * - Responsive design
 *
 * Features:
 * - View all connected accounts organized by platform
 * - See recent post activity across all platforms
 * - Quick access to create post, view calendar, and analytics
 * - Platform-specific account management
 * - Real-time status indicators
 */
export default function SocialMediaDashboard({ accounts, recent_posts, stats }: DashboardProps) {
    // Convert accounts object to array for easier iteration
    const platformEntries = Object.entries(accounts);
    const hasAccounts = platformEntries.length > 0;

    /**
     * Reload dashboard data
     */
    const handleUpdate = () => {
        router.reload({ only: ['accounts', 'recent_posts', 'stats'] });
    };

    return (
        <SocialMediaLayout>
            <Head title="Social Media Dashboard" />

            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Social Media Management</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage your social media accounts and schedule posts across multiple platforms
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                    <Link
                        href={route('admin.social-media.posts.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Create Post
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Accounts */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected Accounts</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total_accounts}</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                            <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Total Posts */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total_posts}</p>
                        </div>
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                            <FileVideo className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Published Posts */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.published_posts}</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Scheduled Posts */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.scheduled_posts}</p>
                        </div>
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
                            <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Connected Accounts - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Connected Accounts</h2>
                    </div>

                    {hasAccounts ? (
                        <div className="space-y-6">
                            {platformEntries.map(([platform, platformAccounts]) => (
                                <AccountGroupCard key={platform} platform={platform} accounts={platformAccounts} onUpdate={handleUpdate} />
                            ))}
                        </div>
                    ) : (
                        // Empty State - No Accounts
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <LinkIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">No Accounts Connected</h3>
                            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                                Connect your social media accounts to start posting and managing your content
                            </p>

                            {/* Platform Connect Buttons */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => (
                                    <Link
                                        key={platform}
                                        href={route('admin.social-media.connect', platform)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <span>{config.icon}</span>
                                        Connect {config.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity - Takes 1 column */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
                        <Link
                            href={route('admin.social-media.posts.index')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            View All
                        </Link>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                        {recent_posts.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {recent_posts.map((post) => {
                                    const platformConfig = PLATFORM_CONFIG[post.social_account.platform] || { icon: '🔗' };

                                    return (
                                        <Link
                                            key={post.id}
                                            href={route('admin.social-media.posts.show', post.id)}
                                            className="block p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            {/* Post Title and Status */}
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <h3 className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">{post.title}</h3>
                                                <PostStatusBadge status={post.status} className="flex-shrink-0" />
                                            </div>

                                            {/* Account Info */}
                                            <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                <span>{platformConfig.icon}</span>
                                                <span>{post.social_account.name || post.social_account.username}</span>
                                            </div>

                                            {/* Timestamp */}
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                {post.status === 'published' && post.published_at
                                                    ? `Published ${new Date(post.published_at).toLocaleDateString()}`
                                                    : post.status === 'scheduled' && post.scheduled_at
                                                      ? `Scheduled for ${new Date(post.scheduled_at).toLocaleDateString()}`
                                                      : `Created ${new Date(post.created_at).toLocaleDateString()}`}
                                            </p>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            // Empty State - No Recent Posts
                            <div className="p-8 text-center">
                                <FileVideo className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">No recent posts</p>
                                <Link
                                    href={route('admin.social-media.posts.create')}
                                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Create Your First Post
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SocialMediaLayout>
    );
}
