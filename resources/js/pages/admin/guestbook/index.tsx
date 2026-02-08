import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Eye, EyeOff, MessageSquareHeart, RotateCcw, Search, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface GuestbookEntry {
    id: number;
    user_id: number;
    message: string;
    is_approved: boolean;
    created_at: string;
    deleted_at: string | null;
    user: User;
}

interface Stats {
    total: number;
    approved: number;
    hidden: number;
}

interface Props {
    entries: {
        data: GuestbookEntry[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: {
        status?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guestbook', href: '/admin/guestbook' },
];

export default function GuestbookIndex({ entries, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/guestbook', { search, status: filters.status }, { preserveState: true });
    };

    const handleFilter = (status: string | undefined) => {
        router.get('/admin/guestbook', { search: filters.search, status }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guestbook Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guestbook Management</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage guestbook entries from visitors.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-500/20">
                                <MessageSquareHeart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Entries</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-500/20">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-500/20">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hidden}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Hidden</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                        {[
                            { label: 'All', value: undefined },
                            { label: 'Approved', value: 'approved' },
                            { label: 'Hidden', value: 'hidden' },
                        ].map((filter) => (
                            <button
                                key={filter.label}
                                onClick={() => handleFilter(filter.value)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    filters.status === filter.value
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search messages..."
                                className="rounded-lg border border-gray-200 bg-white py-1.5 pr-4 pl-9 text-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    User
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Message
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {entries.data.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 ${entry.deleted_at ? 'opacity-50' : ''}`}
                                >
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {entry.user?.avatar_url ? (
                                                <img src={entry.user.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                    {entry.user?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {entry.user?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                        {entry.message}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        {entry.deleted_at ? (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                Deleted
                                            </span>
                                        ) : entry.is_approved ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-400">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-500/20 dark:text-red-400">
                                                Hidden
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {!entry.deleted_at && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            router.patch(
                                                                `/admin/guestbook/${entry.id}/status`,
                                                                { is_approved: !entry.is_approved },
                                                                { preserveScroll: true },
                                                            )
                                                        }
                                                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                                        title={entry.is_approved ? 'Hide' : 'Approve'}
                                                    >
                                                        {entry.is_approved ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete this entry?')) {
                                                                router.delete(`/admin/guestbook/${entry.id}`, { preserveScroll: true });
                                                            }
                                                        }}
                                                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                            {entry.deleted_at && (
                                                <button
                                                    onClick={() =>
                                                        router.patch(`/admin/guestbook/${entry.id}/restore`, {}, { preserveScroll: true })
                                                    }
                                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-500/10 dark:hover:text-green-400"
                                                    title="Restore"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {entries.data.length === 0 && (
                        <div className="py-12 text-center">
                            <MessageSquareHeart className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">No guestbook entries found.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {entries.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: entries.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() =>
                                    router.get(
                                        '/admin/guestbook',
                                        { ...filters, page },
                                        { preserveState: true },
                                    )
                                }
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    page === entries.current_page
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
