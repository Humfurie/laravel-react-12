import { Suspense, lazy } from 'react';

const BlogEditor = lazy(() => import('@/components/blog-editor').then((mod) => ({ default: mod.BlogEditor })));

interface BlogEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    placeholder?: string;
    className?: string;
}

function EditorSkeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-lg border border-gray-200 dark:border-gray-700 ${className || ''}`}>
            {/* Toolbar skeleton */}
            <div className="flex items-center gap-2 border-b border-gray-200 p-3 dark:border-gray-700">
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            {/* Content area skeleton */}
            <div className="space-y-3 p-4" style={{ minHeight: '400px' }}>
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
    );
}

export function LazyBlogEditor(props: BlogEditorProps) {
    // SSR safety: render skeleton on server
    if (typeof window === 'undefined') {
        return <EditorSkeleton className={props.className} />;
    }

    return (
        <Suspense fallback={<EditorSkeleton className={props.className} />}>
            <BlogEditor {...props} />
        </Suspense>
    );
}
