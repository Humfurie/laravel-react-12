import PostStatusBadge from '@/components/social-media/PostStatusBadge';
import SocialMediaLayout from '@/layouts/SocialMediaLayout';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Calendar, Edit, Eye, MoreVertical, PlusCircle, Search, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

/**
 * Social Post Interface
 *
 * Represents a social media post
 */
interface SocialPost {
    id: number;
    title: string;
    description: string;
    status: 'draft' | 'scheduled' | 'processing' | 'published' | 'failed';
    scheduled_at: string | null;
    published_at: string | null;
    created_at: string;
    platform_post_id: string | null;
    error_message: string | null;
    social_account: {
        id: number;
        platform: string;
        username: string;
        name: string;
        avatar_url: string | null;
    };
    metrics?: {
        views: number;
        likes: number;
        comments: number;
        shares: number;
    };
}

/**
 * Posts Page Props
 *
 * Props passed from Laravel controller via Inertia
 */
interface PostsPageProps {
    /** Paginated posts collection (Laravel's default pagination format) */
    posts: {
        data: SocialPost[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    /** Filter parameters */
    filters: {
        search?: string;
        status?: string;
        platform?: string;
    };
}

/**
 * Platform Configuration
 *
 * Display information for each platform
 */
const PLATFORM_CONFIG: Record<string, { name: string; icon: string; color: string }> = {
    youtube: { name: 'YouTube', icon: '▶️', color: 'text-red-600 dark:text-red-400' },
    facebook: { name: 'Facebook', icon: '📘', color: 'text-blue-600 dark:text-blue-400' },
    instagram: { name: 'Instagram', icon: '📷', color: 'text-pink-600 dark:text-pink-400' },
    tiktok: { name: 'TikTok', icon: '🎵', color: 'text-black dark:text-white' },
    threads: { name: 'Threads', icon: '🧵', color: 'text-gray-600 dark:text-gray-400' },
};

/**
 * Posts Management Page
 *
 * Table view of all social media posts with:
 * - Filterable and searchable table
 * - Status filters (draft, scheduled, published, failed)
 * - Platform filters
 * - Pagination
 * - Row actions (view, edit, delete, analytics)
 * - Bulk actions support
 * - Responsive design
 * - Dark mode support
 *
 * Features:
 * - Search posts by title or description
 * - Filter by status and platform
 * - View post details and analytics
 * - Quick actions via dropdown menu
 * - Real-time status updates
 * - Empty state for no posts
 */
export default function PostsPage({ posts, filters }: PostsPageProps) {
    // Filter state
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedPlatform, setSelectedPlatform] = useState(filters.platform || '');

    // Action menu state
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    /**
     * Handle search form submission
     */
    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();

        router.get(
            route('admin.social-media.posts.index'),
            { search, status: selectedStatus, platform: selectedPlatform },
            { preserveState: true, preserveScroll: true },
        );
    };

    /**
     * Handle filter changes
     */
    const handleFilterChange = (filterType: 'status' | 'platform', value: string) => {
        const params: Record<string, string> = { search };

        if (filterType === 'status') {
            setSelectedStatus(value);
            if (value) params.status = value;
            if (selectedPlatform) params.platform = selectedPlatform;
        } else {
            setSelectedPlatform(value);
            if (value) params.platform = value;
            if (selectedStatus) params.status = selectedStatus;
        }

        router.get(route('admin.social-media.posts.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    /**
     * Delete a post
     */
    const handleDelete = (postId: number, postTitle: string) => {
        if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) {
            return;
        }

        router.delete(route('admin.social-media.posts.destroy', postId), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenMenuId(null);
            },
        });
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <SocialMediaLayout>
            <Head title="Manage Posts" />

            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Manage Posts</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">View and manage all your social media posts across platforms</p>
                </div>

                <Link
                    href={route('admin.social-media.posts.create')}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    <PlusCircle className="h-4 w-4" />
                    Create Post
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-center">
                    {/* Search Input */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search posts..."
                                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-blue-500 md:w-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="processing">Processing</option>
                            <option value="published">Published</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    {/* Platform Filter */}
                    <div>
                        <select
                            value={selectedPlatform}
                            onChange={(e) => handleFilterChange('platform', e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-blue-500 md:w-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Platforms</option>
                            {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => (
                                <option key={platform} value={platform}>
                                    {config.icon} {config.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search Button */}
                    <button
                        type="submit"
                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Posts Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {posts.data.length > 0 ? (
                    <>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Post
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Platform
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Metrics
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {posts.data.map((post) => {
                                        const platformConfig = PLATFORM_CONFIG[post.social_account.platform] || {
                                            name: post.social_account.platform,
                                            icon: '🔗',
                                            color: 'text-gray-600',
                                        };

                                        return (
                                            <tr key={post.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                                                {/* Post Title and Description */}
                                                <td className="px-6 py-4">
                                                    <div className="max-w-md">
                                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{post.title}</p>
                                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{post.description}</p>
                                                    </div>
                                                </td>

                                                {/* Platform and Account */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-lg ${platformConfig.color}`}>{platformConfig.icon}</span>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">
                                                                {platformConfig.name}
                                                            </p>
                                                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                                {post.social_account.name || post.social_account.username}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <PostStatusBadge status={post.status} />
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4">
                                                    <div className="text-xs">
                                                        {post.status === 'published' && post.published_at ? (
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">Published</p>
                                                                <p className="text-gray-500 dark:text-gray-400">{formatDate(post.published_at)}</p>
                                                            </div>
                                                        ) : post.status === 'scheduled' && post.scheduled_at ? (
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">Scheduled</p>
                                                                <p className="text-gray-500 dark:text-gray-400">{formatDate(post.scheduled_at)}</p>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">Created</p>
                                                                <p className="text-gray-500 dark:text-gray-400">{formatDate(post.created_at)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Metrics */}
                                                <td className="px-6 py-4">
                                                    {post.metrics ? (
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            <p>👁️ {post.metrics.views.toLocaleString()}</p>
                                                            <p>❤️ {post.metrics.likes.toLocaleString()}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="relative flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                                                            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                                        >
                                                            <MoreVertical className="h-5 w-5" />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {openMenuId === post.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />

                                                                <div className="absolute top-8 right-0 z-20 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                                    <Link
                                                                        href={route('admin.social-media.posts.show', post.id)}
                                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        View Details
                                                                    </Link>

                                                                    <Link
                                                                        href={route('admin.social-media.posts.edit', post.id)}
                                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                        Edit Post
                                                                    </Link>

                                                                    {post.status === 'published' && (
                                                                        <Link
                                                                            href={route('admin.social-media.analytics.post', post.id)}
                                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                                                        >
                                                                            <BarChart3 className="h-4 w-4" />
                                                                            View Analytics
                                                                        </Link>
                                                                    )}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDelete(post.id, post.title)}
                                                                        className="flex w-full items-center gap-2 border-t border-gray-200 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing {(posts.current_page - 1) * posts.per_page + 1} to{' '}
                                        {Math.min(posts.current_page * posts.per_page, posts.total)} of {posts.total} results
                                    </div>

                                    <div className="flex gap-2">
                                        {posts.current_page > 1 && (
                                            <Link
                                                href={route('admin.social-media.posts.index', {
                                                    page: posts.current_page - 1,
                                                    search,
                                                    status: selectedStatus,
                                                    platform: selectedPlatform,
                                                })}
                                                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                Previous
                                            </Link>
                                        )}

                                        {posts.current_page < posts.last_page && (
                                            <Link
                                                href={route('admin.social-media.posts.index', {
                                                    page: posts.current_page + 1,
                                                    search,
                                                    status: selectedStatus,
                                                    platform: selectedPlatform,
                                                })}
                                                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    // Empty State
                    <div className="p-12 text-center">
                        <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">No posts found</h3>
                        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                            {search || selectedStatus || selectedPlatform
                                ? 'Try adjusting your filters to see more results'
                                : 'Get started by creating your first social media post'}
                        </p>
                        <Link
                            href={route('admin.social-media.posts.create')}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Create Your First Post
                        </Link>
                    </div>
                )}
            </div>
        </SocialMediaLayout>
    );
}
