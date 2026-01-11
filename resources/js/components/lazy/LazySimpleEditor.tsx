import { Suspense, lazy } from 'react';

const SimpleEditor = lazy(() =>
    import('@/components/tiptap-templates/simple/simple-editor').then((mod) => ({ default: mod.SimpleEditor })),
);

function SimpleEditorSkeleton() {
    return (
        <div className="simple-editor-wrapper animate-pulse rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Toolbar skeleton */}
            <div className="flex items-center gap-2 border-b border-gray-200 p-3 dark:border-gray-700">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                ))}
            </div>
            {/* Content area skeleton */}
            <div className="space-y-3 p-4" style={{ minHeight: '300px' }}>
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
    );
}

export function LazySimpleEditor() {
    // SSR safety: render skeleton on server
    if (typeof window === 'undefined') {
        return <SimpleEditorSkeleton />;
    }

    return (
        <Suspense fallback={<SimpleEditorSkeleton />}>
            <SimpleEditor />
        </Suspense>
    );
}
