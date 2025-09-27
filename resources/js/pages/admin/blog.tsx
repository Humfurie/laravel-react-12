import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Trash2, RotateCcw } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { formatDistanceToNow } from 'date-fns';

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
}

interface Props {
    blogs: {
        data: Blog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'published':
            return 'bg-green-100 text-green-800';
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
        router.visit(route('blogs.edit', blog.slug));
    };

    return (
        <div
            className={`border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors ${blog.deleted_at ? 'opacity-50' : ''}`}
            onClick={handleCardClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{blog.title}</h3>
                        <Badge className={getStatusColor(blog.status)}>{blog.status_label}</Badge>
                        {blog.isPrimary && (
                            <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                        {blog.deleted_at && (
                            <Badge variant="destructive" className="text-xs">Deleted</Badge>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">/{blog.slug}</p>

                    {blog.excerpt && (
                        <p className="text-sm text-muted-foreground">
                            {truncateText(blog.excerpt, 120)}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                            Last modified: {formatDistanceToNow(new Date(blog.updated_at), { addSuffix: true })}
                        </span>
                        {blog.published_at ? (
                            <span>
                                Published: {formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}
                            </span>
                        ) : (
                            <span>Not published</span>
                        )}
                    </div>
                </div>

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
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem
                                        onClick={handleRestore}
                                        className="text-green-600"
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Restore
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleForceDelete}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Permanently
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

export default function BlogIndex({ blogs }: Props) {
    return (
        <AdminLayout>
            <Head title="Blog Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
                        <p className="text-muted-foreground">
                            Click on any blog post to edit it
                        </p>
                    </div>
                    <Link href={route('blogs.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Post
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        {blogs.total} post{blogs.total !== 1 ? 's' : ''} found
                    </div>

                    {blogs.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <p className="text-muted-foreground">No blog posts found.</p>
                                <Link href={route('blogs.create')} className="mt-4 inline-block">
                                    <Button>Create your first blog post</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        blogs.data.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}