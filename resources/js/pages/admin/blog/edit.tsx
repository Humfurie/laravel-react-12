import { BlogEditor } from '@/components/blog-editor';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, CalendarIcon, Plus, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { LocationManager } from './components/LocationManager';
import type { BlogLocation } from '@/types';

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
    tags: string[] | null;
    isPrimary: boolean;
    sort_order: number;
    published_at: string | null;
    locations?: BlogLocation[];
}

interface Props {
    blog: Blog;
}

export default function EditBlog({ blog }: Props) {
    const originalSlug = useRef(blog.slug); // Store the original slug for route params
    const [publishedDate, setPublishedDate] = useState<Date | undefined>(blog.published_at ? parseISO(blog.published_at) : undefined);
    const [tagInput, setTagInput] = useState('');
    const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('url');
    const [imagePreview, setImagePreview] = useState<string>(blog.featured_image || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [locations, setLocations] = useState<BlogLocation[]>(blog.locations || []);

    const { data, setData, post, processing, errors, transform } = useForm({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt || '',
        status: blog.status,
        featured_image: blog.featured_image || '',
        featured_image_file: null as File | null,
        meta_data: {
            meta_title: blog.meta_data?.meta_title || '',
            meta_description: blog.meta_data?.meta_description || '',
            meta_keywords: blog.meta_data?.meta_keywords || '',
        },
        tags: blog.tags || [],
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
        setData((prev) => ({
            ...prev,
            title: value,
            // Only auto-generate slug if it's currently matching the title pattern
            slug: prev.slug === generateSlug(prev.title) ? generateSlug(value) : prev.slug,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((data) => ({
            ...data,
            _method: 'PUT',
        }));

        post(route('blogs.update', originalSlug.current), {
            forceFormData: true,
            onSuccess: () => {
                if (imagePreview && imagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePreview);
                }
            },
        });
    };

    const handleSaveAsDraft = () => {
        transform((data) => ({
            ...data,
            status: 'draft',
            published_at: '',
            _method: 'PUT',
        }));

        post(route('blogs.update', originalSlug.current), {
            forceFormData: true,
            onSuccess: () => {
                if (imagePreview && imagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePreview);
                }
            },
        });
    };

    const handlePublish = () => {
        const publishedAt =
            !data.published_at && !publishedDate
                ? format(new Date(), 'yyyy-MM-dd HH:mm:ss')
                : publishedDate
                  ? format(publishedDate, 'yyyy-MM-dd HH:mm:ss')
                  : data.published_at;

        transform((data) => ({
            ...data,
            status: 'published',
            published_at: publishedAt,
            _method: 'PUT',
        }));

        post(route('blogs.update', originalSlug.current), {
            forceFormData: true,
            onSuccess: () => {
                if (imagePreview && imagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePreview);
                }
            },
        });
    };

    const handleUpdate = () => {
        const publishedAt = publishedDate ? format(publishedDate, 'yyyy-MM-dd HH:mm:ss') : data.published_at;

        transform((data) => ({
            ...data,
            published_at: publishedAt,
            _method: 'PUT',
        }));

        post(route('blogs.update', originalSlug.current), {
            forceFormData: true,
            onSuccess: () => {
                if (imagePreview && imagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePreview);
                }
            },
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Clean up old blob URL if exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        // Create preview and set file in form
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setData('featured_image_file', file);
    };

    const clearFeaturedImage = () => {
        // Clean up blob URL if exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview('');
        setData('featured_image', '');
        setData('featured_image_file', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
            setData('tags', [...data.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setData(
            'tags',
            data.tags.filter((tag) => tag !== tagToRemove),
        );
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
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
                        <p className="text-muted-foreground">Update your blog post content and settings</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
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
                                    <p className="text-muted-foreground text-xs">
                                        URL: {typeof window !== 'undefined' ? window.location.origin : ''}/blog/{data.slug || 'post-slug'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Content *</Label>
                                    <BlogEditor
                                        content={data.content}
                                        onChange={(content) => setData('content', content)}
                                        placeholder="Start writing your blog post..."
                                        locations={locations}
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
                                    <p className="text-muted-foreground text-xs">If left empty, an excerpt will be generated from the content</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="tags"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            placeholder="Enter a tag and press Enter"
                                            className={errors.tags ? 'border-red-500' : ''}
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.tags.map((tag) => (
                                            <span
                                                key={String(tag)}
                                                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                                            >
                                                {tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-600">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground text-xs">
                                        Press Enter or click + to add tags. Tags help organize and categorize your posts.
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
                                        onChange={(e) =>
                                            setData('meta_data', {
                                                ...data.meta_data,
                                                meta_title: e.target.value,
                                            })
                                        }
                                        placeholder="SEO title (max 60 characters)"
                                        maxLength={60}
                                    />
                                    <p className="text-muted-foreground text-xs">{data.meta_data.meta_title.length}/60 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meta_description">Meta Description</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={data.meta_data.meta_description}
                                        onChange={(e) =>
                                            setData('meta_data', {
                                                ...data.meta_data,
                                                meta_description: e.target.value,
                                            })
                                        }
                                        placeholder="SEO description (max 160 characters)"
                                        rows={3}
                                        maxLength={160}
                                    />
                                    <p className="text-muted-foreground text-xs">{data.meta_data.meta_description.length}/160 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meta_keywords">Keywords</Label>
                                    <Input
                                        id="meta_keywords"
                                        value={data.meta_data.meta_keywords}
                                        onChange={(e) =>
                                            setData('meta_data', {
                                                ...data.meta_data,
                                                meta_keywords: e.target.value,
                                            })
                                        }
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Travel Locations */}
                        <LocationManager
                            blogId={blog.id}
                            blogSlug={originalSlug.current}
                            locations={locations}
                            onLocationsChange={setLocations}
                        />
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
                                    <Select
                                        value={data.status}
                                        onValueChange={(value: 'draft' | 'published' | 'private') => setData('status', value)}
                                    >
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
                                                    'w-full justify-start text-left font-normal',
                                                    !publishedDate && 'text-muted-foreground',
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {publishedDate ? format(publishedDate, 'PPP') : 'Set publish date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={publishedDate} onSelect={setPublishedDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="flex justify-between gap-2">
                                    <Button type="button" variant="outline" onClick={handleSaveAsDraft} disabled={processing} className="flex-1">
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
                                    <Switch id="isPrimary" checked={data.isPrimary} onCheckedChange={(checked) => setData('isPrimary', checked)} />
                                </div>
                                <p className="text-muted-foreground text-xs">Mark this as a primary/featured post</p>

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
                                                className="h-32 w-full rounded-lg border object-cover"
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

                                    {/* Input type selector */}
                                    <div className="flex space-x-6">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                checked={imageInputType === 'upload'}
                                                onChange={() => {
                                                    setImageInputType('upload');
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-medium">Upload New Image</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                checked={imageInputType === 'url'}
                                                onChange={() => {
                                                    setImageInputType('url');
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-medium">Enter URL</span>
                                        </label>
                                    </div>

                                    {/* File upload */}
                                    {imageInputType === 'upload' && (
                                        <div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileSelect}
                                                accept="image/*,image/svg+xml"
                                                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            />
                                            <p className="mt-2 text-xs text-gray-500">Supports: JPG, PNG, GIF, SVG, WEBP (max 5MB)</p>
                                            {data.featured_image_file && (
                                                <div className="mt-3 flex items-center text-green-600">
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    <span className="text-sm">Selected: {data.featured_image_file.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* URL input */}
                                    {imageInputType === 'url' && (
                                        <div>
                                            <input
                                                type="text"
                                                value={data.featured_image}
                                                onChange={(e) => {
                                                    setData('featured_image', e.target.value);
                                                    setImagePreview(e.target.value);
                                                }}
                                                placeholder="https://example.com/image.jpg or /storage/image.jpg"
                                                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            />
                                            <p className="mt-2 text-xs text-gray-500">Enter any valid image URL (external or storage path)</p>
                                        </div>
                                    )}

                                    {/* Preview */}
                                    {imagePreview && (
                                        <div className="mt-4">
                                            <label className="mb-3 block text-sm font-medium">Preview:</label>
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={imagePreview}
                                                    alt="Featured image preview"
                                                    className="h-20 w-20 rounded-lg border border-gray-300 object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666">Error</text></svg>';
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={clearFeaturedImage}
                                                    className="flex items-center text-sm text-red-600 transition-colors hover:text-red-800"
                                                >
                                                    <X className="mr-1 h-4 w-4" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {errors.featured_image && <div className="mt-1 text-sm text-red-600">{errors.featured_image}</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
