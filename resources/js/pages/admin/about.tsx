import { LazySimpleEditor } from '@/components/lazy';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'About',
        href: '/about',
    },
];

export default function About() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="About" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-gray-50 p-6 dark:bg-background">
                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:shadow-lg dark:shadow-white/10">
                    <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">About Page</h1>
                    <LazySimpleEditor />
                </div>
            </div>
        </AppLayout>
    );
}
