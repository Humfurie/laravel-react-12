import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
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
            <div className="flex h-full flex-1 flex-col gap-6 bg-gray-50 p-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h1 className="mb-4 text-2xl font-bold text-gray-900">About Page</h1>
                    <SimpleEditor />
                </div>
            </div>
        </AppLayout>
    );
}
