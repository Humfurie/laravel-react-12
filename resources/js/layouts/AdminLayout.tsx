import AppLayout from '@/layouts/app-layout';
import { type ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-6">{children}</div>
        </AppLayout>
    );
}
