import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Upload, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import React, { useState, useRef } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { BlogEditor } from '@/components/blog-editor';
import { cn } from '@/lib/utils';

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
}

interface Props {
    blog: Blog;
}

export default function EditBlog({ blog }: Props) {
    const [publishedDate, setPublishedDate] = useState<Date | undefined>(
        blog.published_at ? parseISO(blog.published_at) : undefined
    );
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors } = useForm({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt || '',
        status: blog.status,
        featured_image: blog.featured_image || '',
        meta_data: {
            meta_title: blog.meta_data?.meta_title || '',
            meta_description: blog.meta_data?.meta_description || '',
            meta_keywords: blog.meta_data?.meta_keywords || '',
        },
        isPrimary: blog.isPrimary,
        sort_order: blog.sort_order,
        published_at: blog.published_at || '',
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (value: string) => {
        setData(prev => ({
            ...prev,
            title: value,
            // Only auto-generate slug if it's currently matching the title pattern
            slug: prev.slug === generateSlug(prev.title) ? generateSlug(value) : prev.slug,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('blogs.update', blog.slug));
    };

    const handleSaveAsDraft = () => {
        setData('status', 'draft');
        setData('published_at', '');
        setTimeout(() => {
            put(route('blogs.update', blog.slug));
        }, 0);
    };

    const handlePublish = () => {
        setData('status', 'published');
        if (!data.published_at && !publishedDate) {
            setData('published_at', format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
        } else if (publishedDate) {
            setData('published_at', format(publishedDate, 'yyyy-MM-dd HH:mm:ss'));
        }
        setTimeout(() => {
            put(route('blogs.update', blog.slug));
        }, 0);
    };

    const handleUpdate = () => {
        if (publishedDate) {
            setData('published_at', format(publishedDate, 'yyyy-MM-dd HH:mm:ss'));
        }
        setTimeout(() => {
            put(route('blogs.update', blog.slug));
        }, 0);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/admin/blogs/upload-image', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            if (result.success) {
                setData('featured_image', result.url);
            } else {
                alert('Upload failed: ' + result.message);
            }
        } catch (error) {
            alert('Upload failed: ' + error);
        } finally {
            setUploading(false);
        }
    };

    const clearFeaturedImage = () => {
        setData('featured_image', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AdminLayout>
            <Head title={`Edit: ${blog.title}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('blogs.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Posts
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
                        <p className="text-muted-foreground">
                            Update your blog post content and settings
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Content</CardTitle>
                                <CardDescription>The main content of your blog post</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="Enter post title..."
                                        className={errors.title ? 'border-red-500' : ''}
                                    />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="post-url-slug"
                                        className={errors.slug ? 'border-red-500' : ''}
                                    />
                                    {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        URL: {window.location.origin}/blog/{data.slug || 'post-slug'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Content *</Label>
                                    <BlogEditor
                                        content={data.content}
                                        onChange={(content) => setData('content', content)}
                                        placeholder="Start writing your blog post..."
                                    />
                                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Excerpt</Label>
                                    <Textarea
                                        id="excerpt"
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        placeholder="Brief description of the post..."
                                        rows={3}
                                        className={errors.excerpt ? 'border-red-500' : ''}
                                    />
                                    {errors.excerpt && <p className="text-sm text-red-500">{errors.excerpt}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        If left empty, an excerpt will be generated from the content
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>SEO Settings</CardTitle>
                                <CardDescription>Optimize your post for search engines</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="meta_title">Meta Title</Label>
                                    <Input
                                        id="meta_title"
                                        value={data.meta_data.meta_title}
                                        onChange={(e) => setData('meta_data', {
                                            ...data.meta_data,
                                            meta_title: e.target.value
                                        })}
                                        placeholder="SEO title (max 60 characters)"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {data.meta_data.meta_title.length}/60 characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meta_description">Meta Description</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={data.meta_data.meta_description}
                                        onChange={(e) => setData('meta_data', {
                                            ...data.meta_data,
                                            meta_description: e.target.value
                                        })}
                                        placeholder="SEO description (max 160 characters)"
                                        rows={3}
                                        maxLength={160}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {data.meta_data.meta_description.length}/160 characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meta_keywords">Keywords</Label>
                                    <Input
                                        id="meta_keywords"
                                        value={data.meta_data.meta_keywords}
                                        onChange={(e) => setData('meta_data', {
                                            ...data.meta_data,
                                            meta_keywords: e.target.value
                                        })}
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Publish</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={data.status} onValueChange={(value: 'draft' | 'published' | 'private') => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="private">Private</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Publish Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !publishedDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {publishedDate ? format(publishedDate, "PPP") : "Set publish date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={publishedDate}
                                                onSelect={setPublishedDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="flex justify-between gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSaveAsDraft}
                                        disabled={processing}
                                        className="flex-1"
                                    >
                                        Save Draft
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={data.status === 'published' ? handleUpdate : handlePublish}
                                        disabled={processing}
                                        className="flex-1"
                                    >
                                        {data.status === 'published' ? 'Update' : 'Publish'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Post Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="isPrimary" className="text-sm font-medium">
                                        Primary Post
                                    </Label>
                                    <Switch
                                        id="isPrimary"
                                        checked={data.isPrimary}
                                        onCheckedChange={(checked) => setData('isPrimary', checked)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Mark this as a primary/featured post
                                </p>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Featured Image</Label>

                                    {/* Current Featured Image Preview */}
                                    {data.featured_image && (
                                        <div className="relative mb-4">
                                            <img
                                                src={data.featured_image}
                                                alt="Featured image preview"
                                                className="w-full h-32 object-cover rounded-lg border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={clearFeaturedImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="flex-1"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            {uploading ? 'Uploading...' : 'Upload Image'}
                                        </Button>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />

                                    {/* Manual URL Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="featured_image_url">Or enter image URL</Label>
                                        <Input
                                            id="featured_image_url"
                                            value={data.featured_image}
                                            onChange={(e) => setData('featured_image', e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
