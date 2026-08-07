import AppLayout from '@/layouts/app-layout';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <AppLayout>
            <Toaster theme="system" richColors position="top-right" />
            <div className="container mx-auto px-4 py-6">{children}</div>
        </AppLayout>
    );
}
