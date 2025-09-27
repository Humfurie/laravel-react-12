import AppLayout from '@/layouts/app-layout';
import { type ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <AppLayout>
            <div className="container mx-auto py-6 px-4">
                {children}
            </div>
        </AppLayout>
    );
}