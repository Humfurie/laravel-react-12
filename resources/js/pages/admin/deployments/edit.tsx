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
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/slugify';
import type { Deployment, DeploymentClientType, DeploymentStatus } from '@/types/deployment';
import { Head, Link, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, CalendarIcon, Link2, Link2Off, Plus, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface Props {
    deployment: Deployment;
    statuses: Record<DeploymentStatus, string>;
    clientTypes: Record<DeploymentClientType, string>;
    projects: { id: number; title: string }[];
}

type DeploymentFormData = {
    title: string;
    slug: string;
    description: string;
    client_name: string;
    client_type: DeploymentClientType;
    industry: string;
    tech_stack: string[];
    challenges_solved: string[];
    live_url: string;
    demo_url: string;
    project_id: number | null;
    status: DeploymentStatus;
    is_featured: boolean;
    is_public: boolean;
    deployed_at: string;
    sort_order: number;
    thumbnail: File | null;
};

export default function EditDeployment({ deployment, statuses, clientTypes, projects }: Props) {
    const [techInput, setTechInput] = useState('');
    const [challengeInput, setChallengeInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string>(deployment.thumbnail_url || '');
    const [deployedDate, setDeployedDate] = useState<Date | undefined>(deployment.deployed_at ? parseISO(deployment.deployed_at) : undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSlugLocked, setIsSlugLocked] = useState(() => deployment.slug !== slugify(deployment.title));

    const { data, setData, post, processing, errors, transform } = useForm<DeploymentFormData>({
        title: deployment.title,
        slug: deployment.slug,
        description: deployment.description || '',
        client_name: deployment.client_name,
        client_type: deployment.client_type,
        industry: deployment.industry || '',
        tech_stack: deployment.tech_stack || [],
        challenges_solved: deployment.challenges_solved || [],
        live_url: deployment.live_url,
        demo_url: deployment.demo_url || '',
        project_id: deployment.project_id,
        status: deployment.status,
        is_featured: deployment.is_featured,
        is_public: deployment.is_public,
        deployed_at: deployment.deployed_at || '',
        sort_order: deployment.sort_order,
        thumbnail: null,
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
            setData('slug', slugify(data.title));
        }
        setIsSlugLocked(!isSlugLocked);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((data) => ({
            ...data,
            slug: data.slug || slugify(data.title),
            deployed_at: deployedDate ? format(deployedDate, 'yyyy-MM-dd') : '',
            _method: 'PUT',
        }));

        post(route('admin.deployments.update', deployment.slug), {
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

    const addChallenge = () => {
        if (challengeInput.trim() && !data.challenges_solved.includes(challengeInput.trim())) {
            setData('challenges_solved', [...data.challenges_solved, challengeInput.trim()]);
            setChallengeInput('');
        }
    };

    const removeChallenge = (challengeToRemove: string) => {
        setData(
            'challenges_solved',
            data.challenges_solved.filter((challenge) => challenge !== challengeToRemove),
        );
    };

    const handleChallengeKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addChallenge();
        }
    };

    return (
        <AdminLayout>
            <Head title={`Edit: ${deployment.title}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.deployments.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Deployments
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Deployment</h1>
                        <p className="text-muted-foreground">{deployment.title}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Deployment Details</CardTitle>
                                <CardDescription>Basic information about your deployment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="Enter deployment title..."
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
                                        placeholder="deployment-url-slug"
                                        className={cn(errors.slug ? 'border-red-500' : '', !isSlugLocked && 'bg-muted')}
                                        disabled={!isSlugLocked}
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        {isSlugLocked ? 'Editing manually. Click "Auto" to sync with title.' : 'Auto-generated from title. Click "Manual" to edit.'}
                                    </p>
                                    {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <LazyBlogEditor
                                        content={data.description}
                                        onChange={(content) => setData('description', content)}
                                        placeholder="Detailed deployment description..."
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="client_name">Client Name *</Label>
                                        <Input
                                            id="client_name"
                                            value={data.client_name}
                                            onChange={(e) => setData('client_name', e.target.value)}
                                            placeholder="Enter client name..."
                                            className={errors.client_name ? 'border-red-500' : ''}
                                            maxLength={255}
                                        />
                                        {errors.client_name && <p className="text-sm text-red-500">{errors.client_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Client Type *</Label>
                                        <Select value={data.client_type} onValueChange={(value: DeploymentClientType) => setData('client_type', value)}>
                                            <SelectTrigger className={errors.client_type ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(clientTypes).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.client_type && <p className="text-sm text-red-500">{errors.client_type}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="industry">Industry</Label>
                                        <Input
                                            id="industry"
                                            value={data.industry}
                                            onChange={(e) => setData('industry', e.target.value)}
                                            placeholder="e.g., Healthcare, E-commerce..."
                                            maxLength={255}
                                        />
                                        {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status *</Label>
                                        <Select value={data.status} onValueChange={(value: DeploymentStatus) => setData('status', value)}>
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
                                </div>

                                <div className="space-y-2">
                                    <Label>Linked Project</Label>
                                    <Select
                                        value={data.project_id?.toString() || 'none'}
                                        onValueChange={(value) => setData('project_id', value === 'none' ? null : parseInt(value))}
                                    >
                                        <SelectTrigger className={errors.project_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select a project (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {projects.map((project) => (
                                                <SelectItem key={project.id} value={project.id.toString()}>
                                                    {project.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-muted-foreground text-xs">Optionally link this deployment to an existing project</p>
                                    {errors.project_id && <p className="text-sm text-red-500">{errors.project_id}</p>}
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
                                    {errors.tech_stack && <p className="text-sm text-red-500">{errors.tech_stack}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Challenges Solved</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={challengeInput}
                                            onChange={(e) => setChallengeInput(e.target.value)}
                                            onKeyDown={handleChallengeKeyDown}
                                            placeholder="Enter a challenge and press Enter"
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={addChallenge} disabled={!challengeInput.trim()}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-2 space-y-2">
                                        {data.challenges_solved.map((challenge, index) => (
                                            <div key={index} className="bg-muted flex items-center justify-between rounded-md p-2">
                                                <span className="text-sm">{challenge}</span>
                                                <button type="button" onClick={() => removeChallenge(challenge)} className="text-muted-foreground hover:text-red-600">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.challenges_solved && <p className="text-sm text-red-500">{errors.challenges_solved}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Links</CardTitle>
                                <CardDescription>External links to the deployment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="live_url">Live URL *</Label>
                                    <Input
                                        id="live_url"
                                        type="url"
                                        value={data.live_url}
                                        onChange={(e) => setData('live_url', e.target.value)}
                                        placeholder="https://deployed-site.com"
                                        className={errors.live_url ? 'border-red-500' : ''}
                                    />
                                    {errors.live_url && <p className="text-sm text-red-500">{errors.live_url}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="demo_url">Demo URL</Label>
                                    <Input
                                        id="demo_url"
                                        type="url"
                                        value={data.demo_url}
                                        onChange={(e) => setData('demo_url', e.target.value)}
                                        placeholder="https://demo.deployed-site.com"
                                    />
                                    <p className="text-muted-foreground text-xs">Optional demo or staging environment URL</p>
                                    {errors.demo_url && <p className="text-sm text-red-500">{errors.demo_url}</p>}
                                </div>
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
                                <p className="text-muted-foreground text-xs">Show in featured section</p>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="is_public" className="text-sm font-medium">
                                        Public
                                    </Label>
                                    <Switch id="is_public" checked={data.is_public} onCheckedChange={(checked) => setData('is_public', checked)} />
                                </div>
                                <p className="text-muted-foreground text-xs">Visible on public deployments page</p>

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
                                <CardTitle>Deployed Date</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Deployed At</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn('w-full justify-start text-left font-normal', !deployedDate && 'text-muted-foreground')}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {deployedDate ? format(deployedDate, 'PPP') : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={deployedDate} onSelect={setDeployedDate} />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.deployed_at && <p className="text-sm text-red-500">{errors.deployed_at}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thumbnail</CardTitle>
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
                                    <span>Created:</span>
                                    <span>{format(parseISO(deployment.created_at), 'PPP')}</span>
                                </div>
                                <div className="text-muted-foreground flex justify-between text-sm">
                                    <span>Updated:</span>
                                    <span>{format(parseISO(deployment.updated_at), 'PPP')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
