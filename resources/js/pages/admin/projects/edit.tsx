import { LazyBlogEditor } from '@/components/lazy';
import { Badge } from '@/components/ui/badge';
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
import { slugify } from '@/lib/slugify';
import type { Project, ProjectCategory, ProjectLinks, ProjectMetrics, ProjectOwnershipType, ProjectStatus, ProjectTestimonial } from '@/types/project';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, CalendarIcon, Link2, Link2Off, Plus, Star, Trash2, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface Props {
    project: Project;
    categories: Record<ProjectCategory, string>;
    statuses: Record<ProjectStatus, string>;
    ownershipTypes: Record<string, string>;
}

type ProjectFormData = {
    title: string;
    slug: string;
    description: string;
    short_description: string;
    category: ProjectCategory;
    tech_stack: string[];
    links: ProjectLinks;
    status: ProjectStatus;
    ownership_type: ProjectOwnershipType;
    is_featured: boolean;
    is_public: boolean;
    metrics: ProjectMetrics;
    case_study: string;
    testimonials: ProjectTestimonial[];
    started_at: string;
    completed_at: string;
    sort_order: number;
    thumbnail: File | null;
    github_repo: string;
};

export default function EditProject({ project, categories, statuses, ownershipTypes }: Props) {
    const [techInput, setTechInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string>(project.thumbnail_url || '');
    const [startDate, setStartDate] = useState<Date | undefined>(project.started_at ? parseISO(project.started_at) : undefined);
    const [completedDate, setCompletedDate] = useState<Date | undefined>(project.completed_at ? parseISO(project.completed_at) : undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Start locked (manual mode) if slug was manually edited, otherwise auto mode
    const [isSlugLocked, setIsSlugLocked] = useState(() => project.slug !== slugify(project.title));

    const { data, setData, post, processing, errors, transform } = useForm<ProjectFormData>({
        title: project.title,
        slug: project.slug,
        description: project.description,
        short_description: project.short_description || '',
        category: project.category,
        tech_stack: project.tech_stack || [],
        links: project.links || {
            demo_url: '',
            repo_url: '',
            docs_url: '',
        },
        status: project.status,
        ownership_type: project.ownership_type,
        is_featured: project.is_featured,
        is_public: project.is_public,
        metrics: project.metrics || {
            users: undefined,
            stars: undefined,
            downloads: undefined,
        },
        case_study: project.case_study || '',
        testimonials: project.testimonials || [],
        started_at: project.started_at || '',
        completed_at: project.completed_at || '',
        sort_order: project.sort_order,
        thumbnail: null,
        github_repo: project.github_repo || '',
    });

    const handleTitleChange = (value: string) => {
        setData((prev) => ({
            ...prev,
            title: value,
            slug: isSlugLocked ? prev.slug : slugify(value),
        }));
    };

    const handleSlugChange = (value: string) => {
        setIsSlugLocked(true);
        setData('slug', value);
    };

    const toggleSlugLock = () => {
        if (isSlugLocked) {
            // Unlocking - regenerate slug from title
            setData('slug', slugify(data.title));
        }
        setIsSlugLocked(!isSlugLocked);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            ...data,
            slug: data.slug || slugify(data.title),
            started_at: startDate ? format(startDate, 'yyyy-MM-dd') : '',
            completed_at: completedDate ? format(completedDate, 'yyyy-MM-dd') : '',
            _method: 'PUT',
        };

        router.post(route('admin.projects.update', project.slug), formData, {
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

        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setData('thumbnail', file);
    };

    const clearThumbnail = () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview('');
        setData('thumbnail', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const addTech = () => {
        if (techInput.trim() && !data.tech_stack.includes(techInput.trim())) {
            setData('tech_stack', [...data.tech_stack, techInput.trim()]);
            setTechInput('');
        }
    };

    const removeTech = (techToRemove: string) => {
        setData(
            'tech_stack',
            data.tech_stack.filter((tech) => tech !== techToRemove),
        );
    };

    const handleTechKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTech();
        }
    };

    const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('images[]', file);
        });

        router.post(route('admin.projects.images.upload', project.slug), formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleDeleteImage = (imageId: number) => {
        if (confirm('Are you sure you want to delete this image?')) {
            router.delete(route('admin.projects.images.delete', [project.slug, imageId]), {
                preserveScroll: true,
            });
        }
    };

    const handleSetPrimaryImage = (imageId: number) => {
        router.patch(
            route('admin.projects.images.set-primary', [project.slug, imageId]),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AdminLayout>
            <Head title={`Edit: ${project.title}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.projects.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
                        <p className="text-muted-foreground">{project.title}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                                <CardDescription>Basic information about your project</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="Enter project title..."
                                        className={errors.title ? 'border-red-500' : ''}
                                        maxLength={255}
                                    />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={toggleSlugLock}
                                            className="h-6 px-2 text-xs"
                                            title={isSlugLocked ? 'Click to auto-generate from title' : 'Click to edit manually'}
                                        >
                                            {isSlugLocked ? (
                                                <>
                                                    <Link2Off className="mr-1 h-3 w-3" />
                                                    Manual
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="mr-1 h-3 w-3" />
                                                    Auto
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => handleSlugChange(e.target.value)}
                                        placeholder="project-url-slug"
                                        className={cn(errors.slug ? 'border-red-500' : '', !isSlugLocked && 'bg-muted')}
                                        disabled={!isSlugLocked}
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        {isSlugLocked ? 'Editing manually. Click "Auto" to sync with title.' : 'Auto-generated from title. Click "Manual" to edit.'}
                                    </p>
                                    {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="short_description">Short Description</Label>
                                    <Textarea
                                        id="short_description"
                                        value={data.short_description}
                                        onChange={(e) => setData('short_description', e.target.value)}
                                        placeholder="Brief description for cards..."
                                        rows={2}
                                        maxLength={300}
                                        className={errors.short_description ? 'border-red-500' : ''}
                                    />
                                    <p className="text-muted-foreground text-xs">{data.short_description.length}/300 characters</p>
                                    {errors.short_description && <p className="text-sm text-red-500">{errors.short_description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Description *</Label>
                                    <LazyBlogEditor
                                        content={data.description}
                                        onChange={(content) => setData('description', content)}
                                        placeholder="Detailed project description..."
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Category *</Label>
                                        <Select value={data.category} onValueChange={(value: ProjectCategory) => setData('category', value)}>
                                            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(categories).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status *</Label>
                                        <Select value={data.status} onValueChange={(value: ProjectStatus) => setData('status', value)}>
                                            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(statuses).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ownership</Label>
                                        <Select value={data.ownership_type} onValueChange={(value: ProjectOwnershipType) => setData('ownership_type', value)}>
                                            <SelectTrigger className={errors.ownership_type ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(ownershipTypes).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.ownership_type && <p className="text-sm text-red-500">{errors.ownership_type}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tech Stack</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={techInput}
                                            onChange={(e) => setTechInput(e.target.value)}
                                            onKeyDown={handleTechKeyDown}
                                            placeholder="Enter technology and press Enter"
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={addTech} disabled={!techInput.trim()}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.tech_stack.map((tech) => (
                                            <Badge key={tech} variant="secondary" className="gap-1">
                                                {tech}
                                                <button type="button" onClick={() => removeTech(tech)} className="ml-1 hover:text-red-600">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Links</CardTitle>
                                <CardDescription>External links to your project</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="demo_url">Demo URL</Label>
                                    <Input
                                        id="demo_url"
                                        type="url"
                                        value={data.links.demo_url || ''}
                                        onChange={(e) => setData('links', { ...data.links, demo_url: e.target.value })}
                                        placeholder="https://myproject.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="repo_url">Repository URL</Label>
                                    <Input
                                        id="repo_url"
                                        type="url"
                                        value={data.links.repo_url || ''}
                                        onChange={(e) => setData('links', { ...data.links, repo_url: e.target.value })}
                                        placeholder="https://github.com/user/repo"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="github_repo">GitHub Repository (for metrics)</Label>
                                    <Input
                                        id="github_repo"
                                        value={data.github_repo}
                                        onChange={(e) => setData('github_repo', e.target.value)}
                                        placeholder="owner/repo (e.g., laravel/laravel)"
                                        className={errors.github_repo ? 'border-red-500' : ''}
                                    />
                                    <p className="text-muted-foreground text-xs">Auto-sync stars, forks, and downloads from GitHub</p>
                                    {errors.github_repo && <p className="text-sm text-red-500">{errors.github_repo}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="docs_url">Documentation URL</Label>
                                    <Input
                                        id="docs_url"
                                        type="url"
                                        value={data.links.docs_url || ''}
                                        onChange={(e) => setData('links', { ...data.links, docs_url: e.target.value })}
                                        placeholder="https://docs.myproject.com"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Metrics</CardTitle>
                                <CardDescription>Optional project metrics and statistics</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="users">Users</Label>
                                    <Input
                                        id="users"
                                        type="number"
                                        value={data.metrics.users || ''}
                                        onChange={(e) =>
                                            setData('metrics', { ...data.metrics, users: e.target.value ? parseInt(e.target.value) : undefined })
                                        }
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stars">GitHub Stars</Label>
                                    <Input
                                        id="stars"
                                        type="number"
                                        value={data.metrics.stars || ''}
                                        onChange={(e) =>
                                            setData('metrics', { ...data.metrics, stars: e.target.value ? parseInt(e.target.value) : undefined })
                                        }
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="downloads">Downloads</Label>
                                    <Input
                                        id="downloads"
                                        type="number"
                                        value={data.metrics.downloads || ''}
                                        onChange={(e) =>
                                            setData('metrics', { ...data.metrics, downloads: e.target.value ? parseInt(e.target.value) : undefined })
                                        }
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Gallery</CardTitle>
                                <CardDescription>Project screenshots and images</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleUploadImages}
                                        accept="image/*"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                    />
                                    <p className="text-muted-foreground mt-2 text-xs">Select multiple images to upload</p>
                                </div>

                                {project.images && project.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-4">
                                        {project.images.map((image) => (
                                            <div key={image.id} className="group relative">
                                                <img
                                                    src={image.thumbnail_urls?.medium || image.url}
                                                    alt=""
                                                    className={cn(
                                                        'h-24 w-full rounded-lg border object-cover',
                                                        image.is_primary && 'ring-2 ring-yellow-500',
                                                    )}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                    {!image.is_primary && (
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleSetPrimaryImage(image.id)}
                                                        >
                                                            <Star className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteImage(image.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                {image.is_primary && (
                                                    <Badge className="absolute top-1 left-1 text-xs" variant="secondary">
                                                        Primary
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Case Study</CardTitle>
                                <CardDescription>Optional detailed write-up about the project</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LazyBlogEditor
                                    content={data.case_study}
                                    onChange={(content) => setData('case_study', content)}
                                    placeholder="Write your case study here..."
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Update</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="is_featured" className="text-sm font-medium">
                                        Featured
                                    </Label>
                                    <Switch
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) => setData('is_featured', checked)}
                                    />
                                </div>
                                <p className="text-muted-foreground text-xs">Show in featured carousel</p>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="is_public" className="text-sm font-medium">
                                        Public
                                    </Label>
                                    <Switch id="is_public" checked={data.is_public} onCheckedChange={(checked) => setData('is_public', checked)} />
                                </div>
                                <p className="text-muted-foreground text-xs">Visible on public projects page</p>

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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Dates</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Started</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, 'PPP') : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>Completed</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !completedDate && 'text-muted-foreground',
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {completedDate ? format(completedDate, 'PPP') : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={completedDate} onSelect={setCompletedDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>New Thumbnail</CardTitle>
                                <CardDescription>Upload a new thumbnail to replace the current one</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {imagePreview && (
                                    <div className="relative">
                                        <img src={imagePreview} alt="Thumbnail preview" className="h-32 w-full rounded-lg border object-cover" />
                                        {data.thumbnail && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={clearThumbnail}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                />
                                <p className="text-muted-foreground text-xs">Supports: JPG, PNG, GIF, WEBP (max 5MB)</p>

                                {data.thumbnail && (
                                    <div className="flex items-center text-green-600">
                                        <Upload className="mr-2 h-4 w-4" />
                                        <span className="text-sm">Selected: {data.thumbnail.name}</span>
                                    </div>
                                )}

                                {errors.thumbnail && <p className="text-sm text-red-500">{errors.thumbnail}</p>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-muted-foreground flex justify-between text-sm">
                                    <span>Views:</span>
                                    <span>{project.view_count}</span>
                                </div>
                                <div className="text-muted-foreground flex justify-between text-sm">
                                    <span>Created:</span>
                                    <span>{format(parseISO(project.created_at), 'PPP')}</span>
                                </div>
                                <div className="text-muted-foreground flex justify-between text-sm">
                                    <span>Updated:</span>
                                    <span>{format(parseISO(project.updated_at), 'PPP')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
