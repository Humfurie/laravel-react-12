import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { ImageOff, MoreHorizontal, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    status: 'draft' | 'published' | 'private';
    featured_image: string | null;
    meta_data: {
        meta_title?: string;
        meta_description?: string;
        meta_keywords?: string;
    } | null;
    isPrimary: boolean;
    sort_order: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    status_label: string;
    display_image: string | null;
}

interface Props {
    blogs: {
        data: Blog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'published':
            return 'bg-[#E4EDE8] text-[#1B3D2F] dark:bg-[#162820] dark:text-[#5AAF7E]';
        case 'draft':
            return 'bg-yellow-100 text-yellow-800';
        case 'private':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Individual Blog Card Component
function BlogCard({ blog }: { blog: Blog }) {
    const { can } = usePermissions();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this blog post?')) {
            router.delete(route('blogs.destroy', blog.slug));
        }
    };

    const handleRestore = () => {
        router.patch(route('blogs.restore', blog.slug));
    };

    const handleForceDelete = () => {
        if (confirm('Are you sure you want to permanently delete this blog post? This action cannot be undone.')) {
            router.delete(route('blogs.force-destroy', blog.slug));
        }
    };

    const handleCardClick = () => {
        if (can('blog', 'update')) {
            router.visit(route('blogs.edit', blog.slug));
        }
    };

    const hasActions = !blog.deleted_at ? can('blog', 'delete') : can('blog', 'restore') || can('blog', 'forceDelete');

    return (
        <div
            className={`hover:bg-muted/50 ${can('blog', 'update') ? 'cursor-pointer' : 'cursor-default'} rounded-lg border bg-card p-4 transition-colors dark:shadow-lg dark:shadow-white/10 ${blog.deleted_at ? 'opacity-50' : ''}`}
            onClick={handleCardClick}
        >
            <div className="flex items-start gap-4">
                <div className="bg-muted flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md">
                    {blog.display_image ? (
                        <img src={blog.display_image} alt={blog.title} className="h-full w-full object-cover" />
                    ) : (
                        <ImageOff className="text-muted-foreground h-6 w-6" />
                    )}
                </div>

                <div className="flex flex-1 items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">{blog.title}</h3>
                            <Badge className={getStatusColor(blog.status)}>{blog.status_label}</Badge>
                            {blog.isPrimary && (
                                <Badge variant="secondary" className="text-xs">
                                    Primary
                                </Badge>
                            )}
                            {blog.deleted_at && (
                                <Badge variant="destructive" className="text-xs">
                                    Deleted
                                </Badge>
                            )}
                        </div>

                        <p className="text-muted-foreground text-sm">/{blog.slug}</p>

                        {blog.excerpt && <p className="text-muted-foreground text-sm">{truncateText(blog.excerpt, 120)}</p>}

                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                            <span>Last modified: {formatDistanceToNow(new Date(blog.updated_at), { addSuffix: true })}</span>
                            {blog.published_at ? (
                                <span>Published: {formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}</span>
                            ) : (
                                <span>Not published</span>
                            )}
                        </div>
                    </div>

                    {hasActions && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {!blog.deleted_at ? (
                                    <>
                                        {can('blog', 'delete') && (
                                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {can('blog', 'restore') && (
                                            <DropdownMenuItem onClick={handleRestore} className="text-[#2A5E44] dark:text-[#5AAF7E]">
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Restore
                                            </DropdownMenuItem>
                                        )}
                                        {can('blog', 'forceDelete') && (
                                            <DropdownMenuItem onClick={handleForceDelete} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Permanently
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}

const statusFilters = [
    { label: 'All', value: undefined },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Private', value: 'private' },
    { label: 'Deleted', value: 'deleted' },
] as const;

export default function BlogIndex({ blogs, filters }: Props) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search || '');
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get(route('blogs.index'), { search: search || undefined, status: filters.status }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleFilter = (status: string | undefined) => {
        router.get(route('blogs.index'), { search: filters.search, status }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout>
            <Head title="Blog Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
                        <p className="text-muted-foreground">{can('blog', 'update') ? 'Click on any blog post to edit it' : 'View blog posts'}</p>
                    </div>
                    {can('blog', 'create') && (
                        <Link href={route('blogs.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Post
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.label}
                                onClick={() => handleFilter(filter.value)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    filters.status === filter.value
                                        ? 'bg-[#1B3D2F] text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search posts..."
                            className="rounded-lg border border-gray-200 bg-white py-1.5 pr-4 pl-9 text-sm focus:border-[#5AAF7E] focus:ring-2 focus:ring-[#5AAF7E]/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-muted-foreground text-sm">
                        {blogs.total} post{blogs.total !== 1 ? 's' : ''} found
                    </div>

                    {blogs.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">No blog posts found.</p>
                                {!filters.search && !filters.status && (
                                    <Link href={route('blogs.create')} className="mt-4 inline-block">
                                        <Button>Create your first blog post</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        blogs.data.map((blog) => <BlogCard key={blog.id} blog={blog} />)
                    )}
                </div>

                {/* Pagination */}
                {blogs.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: blogs.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() =>
                                    router.get(route('blogs.index'), { ...filters, page }, { preserveState: true })
                                }
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    page === blogs.current_page
                                        ? 'bg-[#1B3D2F] text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
