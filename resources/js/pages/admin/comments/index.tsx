import AdminLayout from '@/layouts/AdminLayout';
import { Head } from '@inertiajs/react';

interface Comment {
    id: number;
    content: string;
    user: {
        id: number;
        name: string;
    };
    status: 'approved' | 'pending' | 'hidden';
    created_at: string;
}

interface Props {
    comments: {
        data: Comment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        approved: number;
        pending: number;
        hidden: number;
        reported: number;
    };
}

export default function Index({ comments, stats }: Props) {
    return (
        <AdminLayout>
            <Head title="Comments Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Comments Management</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                    <div className="rounded-lg border p-4">
                        <h3 className="text-muted-foreground text-sm font-medium">Total</h3>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="text-muted-foreground text-sm font-medium">Approved</h3>
                        <p className="text-2xl font-bold">{stats.approved}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="text-muted-foreground text-sm font-medium">Pending</h3>
                        <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="text-muted-foreground text-sm font-medium">Hidden</h3>
                        <p className="text-2xl font-bold">{stats.hidden}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="text-muted-foreground text-sm font-medium">Reported</h3>
                        <p className="text-2xl font-bold">{stats.reported}</p>
                    </div>
                </div>

                <div className="rounded-lg border">
                    <div className="p-4">
                        <p className="text-muted-foreground text-sm">TODO: Full comment management UI - See MISSING_FRONTEND_COMPONENTS.md</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
