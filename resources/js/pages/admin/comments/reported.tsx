import AdminLayout from '@/layouts/AdminLayout';
import { Head } from '@inertiajs/react';

interface CommentReport {
    id: number;
    comment_id: number;
    reported_by: number;
    reason: string;
    description: string | null;
    status: 'pending' | 'dismissed' | 'actioned';
    comment: {
        id: number;
        content: string;
        user: {
            id: number;
            name: string;
        };
    };
    created_at: string;
}

interface Props {
    reports: {
        data: CommentReport[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function Reported({ reports }: Props) {
    return (
        <AdminLayout>
            <Head title="Reported Comments" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Reported Comments</h1>
                </div>

                <div className="rounded-lg border">
                    <div className="p-4">
                        <p className="text-muted-foreground text-sm">TODO: Full reported comments UI - See MISSING_FRONTEND_COMPONENTS.md</p>
                        <p className="text-muted-foreground mt-2 text-sm">Total Reports: {reports.total}</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
