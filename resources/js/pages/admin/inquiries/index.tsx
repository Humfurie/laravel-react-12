import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircleIcon, CheckCircle2Icon, ClockIcon, InboxIcon, MailIcon, PhoneIcon, SearchIcon, TrashIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inquiries', href: '/admin/inquiries' },
];

interface Property {
    id: number;
    name: string;
    project?: {
        name: string;
        developer?: {
            name: string;
        };
    };
}

interface Inquiry {
    id: number;
    property_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    inquiry_type: string;
    message: string;
    preferred_contact_time: string | null;
    status: 'new' | 'in_progress' | 'responded' | 'closed';
    agent_notes: string | null;
    followed_up_at: string | null;
    created_at: string;
    property: Property | null;
}

interface Stats {
    total: number;
    new: number;
    in_progress: number;
    responded: number;
    closed: number;
    needs_follow_up: number;
}

interface FilterOption {
    value: string;
    label: string;
}

interface Props {
    inquiries: {
        data: Inquiry[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats: Stats;
    filters: {
        status?: string;
        type?: string;
        search?: string;
        needs_follow_up?: string;
    };
    statuses: FilterOption[];
    types: FilterOption[];
}

const statusConfig = {
    new: {
        label: 'New',
        variant: 'info' as const,
        icon: AlertCircleIcon,
        color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    },
    in_progress: {
        label: 'In Progress',
        variant: 'progress' as const,
        icon: ClockIcon,
        color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
    },
    responded: {
        label: 'Responded',
        variant: 'success' as const,
        icon: CheckCircle2Icon,
        color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    },
    closed: {
        label: 'Closed',
        variant: 'secondary' as const,
        icon: XCircleIcon,
        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    },
};

const typeLabels: Record<string, string> = {
    site_visit: 'Site Visit',
    pricing_info: 'Pricing Info',
    availability: 'Availability',
    financing: 'Financing',
    general: 'General',
};

export default function InquiriesIndex({ inquiries, stats, filters, statuses, types }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key: string, value: string | null) => {
        router.get(
            '/admin/inquiries',
            {
                ...filters,
                [key]: value || undefined,
                search: search || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const handleStatusUpdate = (inquiry: Inquiry, newStatus: string) => {
        router.patch(`/admin/inquiries/${inquiry.id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleDelete = (inquiry: Inquiry) => {
        if (confirm('Are you sure you want to delete this inquiry?')) {
            router.delete(`/admin/inquiries/${inquiry.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inquiries" />
            <div className="flex flex-col gap-6 p-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                                    <InboxIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
                                    <AlertCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.new}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">New</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-cyan-50 p-2 dark:bg-cyan-950">
                                    <ClockIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.in_progress}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
                                    <CheckCircle2Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.responded}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Responded</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                                    <XCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.closed}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Closed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
                                    <AlertCircleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.needs_follow_up}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Needs Follow-up</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-gray-100 dark:border-gray-800">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
                                <div className="relative min-w-[200px] flex-1">
                                    <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, email, or phone..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="outline" size="sm">
                                    Search
                                </Button>
                            </form>

                            <Select value={filters.status || ''} onValueChange={(value) => handleFilter('status', value || null)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.type || ''} onValueChange={(value) => handleFilter('type', value || null)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Types</SelectItem>
                                    {types.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(filters.status || filters.type || filters.search) && (
                                <Button variant="ghost" size="sm" onClick={() => router.get('/admin/inquiries')} className="text-gray-500">
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Inquiries List */}
                <Card className="border-gray-100 dark:border-gray-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Inquiries ({inquiries.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {inquiries.data.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {inquiries.data.map((inquiry) => {
                                    const config = statusConfig[inquiry.status];
                                    const StatusIcon = config.icon;

                                    return (
                                        <div key={inquiry.id} className="py-4 first:pt-0 last:pb-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 flex-1 items-start gap-4">
                                                    <div className={`rounded-lg p-2.5 ${config.color}`}>
                                                        <StatusIcon className="h-5 w-5" strokeWidth={1.5} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{inquiry.customer_name}</h3>
                                                            <Badge variant={config.variant}>{config.label}</Badge>
                                                            <Badge variant="outline">
                                                                {typeLabels[inquiry.inquiry_type] || inquiry.inquiry_type}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <MailIcon className="h-3.5 w-3.5" />
                                                                {inquiry.customer_email}
                                                            </span>
                                                            {inquiry.customer_phone && (
                                                                <span className="flex items-center gap-1">
                                                                    <PhoneIcon className="h-3.5 w-3.5" />
                                                                    {inquiry.customer_phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {inquiry.property && (
                                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                Property: {inquiry.property.name}
                                                                {inquiry.property.project && ` - ${inquiry.property.project.name}`}
                                                            </p>
                                                        )}
                                                        <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                                                            {inquiry.message}
                                                        </p>
                                                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                                            {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-shrink-0 items-center gap-2">
                                                    <Select value={inquiry.status} onValueChange={(value) => handleStatusUpdate(inquiry, value)}>
                                                        <SelectTrigger className="h-8 w-[130px] text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statuses.map((status) => (
                                                                <SelectItem key={status.value} value={status.value}>
                                                                    {status.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                                                        onClick={() => handleDelete(inquiry)}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <InboxIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No inquiries found</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {inquiries.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {(inquiries.current_page - 1) * inquiries.per_page + 1} to{' '}
                                    {Math.min(inquiries.current_page * inquiries.per_page, inquiries.total)} of {inquiries.total}
                                </p>
                                <div className="flex gap-1">
                                    {inquiries.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="min-w-[36px]"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
