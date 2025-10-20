import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Camera, CloudUpload, Image as ImageIcon, Loader, Plus, Save, Star, X } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

interface Developer {
    id: number;
    company_name: string;
}

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface CreateProjectProps {
    developers: Developer[];
}

export default function CreateProject({ developers }: CreateProjectProps) {
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
    const [showToast, setShowToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        show: false,
        message: '',
        type: 'success',
    });
    const featuredImageRef = useRef<HTMLInputElement>(null);
    const additionalImagesRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        developer_id: '',
        name: '',
        description: '',
        project_type: 'condominium',
        address: '',
        city: '',
        province: '',
        region: '',
        country: 'Philippines',
        postal_code: '',
        latitude: '',
        longitude: '',
        turnover_date: '',
        completion_year: '',
        status: 'pre-selling',
        total_units: '',
        total_floors: '',
        virtual_tour_url: '',
        featured: false,
        featured_image: null as File | null,
        additional_images: [] as File[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Real Estate', href: '/admin/real-estate' },
        { label: 'Projects', href: '/admin/real-estate' },
        { label: 'Create' },
    ];

    const projectTypes = ['condominium', 'subdivision', 'townhouse', 'commercial', 'mixed-use', 'office', 'industrial'];

    const statusOptions = ['pre-selling', 'under-construction', 'ready-for-occupancy', 'completed', 'sold-out'];

    const regions = [
        'NCR',
        'CAR',
        'Region I',
        'Region II',
        'Region III',
        'Region IV-A',
        'Region IV-B',
        'Region V',
        'Region VI',
        'Region VII',
        'Region VIII',
        'Region IX',
        'Region X',
        'Region XI',
        'Region XII',
        'Region XIII',
    ];

    const handleFeaturedImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Create preview URL for display
        const previewUrl = URL.createObjectURL(file);
        setFeaturedImagePreview(previewUrl);
        // Set the file directly in form data
        form.setData('featured_image', file);
    };

    const handleAdditionalImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        // Create preview URLs for display
        const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
        setAdditionalImagePreviews((prev) => [...prev, ...newPreviewUrls]);
        // Set the files directly in form data
        form.setData('additional_images', [...form.data.additional_images, ...files]);
    };

    const removeFeaturedImage = () => {
        // Clean up blob URL to prevent memory leaks
        if (featuredImagePreview) {
            URL.revokeObjectURL(featuredImagePreview);
        }
        setFeaturedImagePreview('');
        form.setData('featured_image', null);
        if (featuredImageRef.current) {
            featuredImageRef.current.value = '';
        }
    };

    const removeAdditionalImage = (index: number) => {
        // Clean up blob URL to prevent memory leaks
        if (additionalImagePreviews[index]) {
            URL.revokeObjectURL(additionalImagePreviews[index]);
        }

        const updatedFiles = form.data.additional_images.filter((_, i) => i !== index);
        const updatedPreviews = additionalImagePreviews.filter((_, i) => i !== index);

        setAdditionalImagePreviews(updatedPreviews);
        form.setData('additional_images', updatedFiles);
    };

    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setShowToast({ show: true, message, type });
        setTimeout(() => {
            setShowToast({ show: false, message: '', type: 'success' });
        }, 5000);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Submit the form - Inertia will handle file uploads automatically
        form.post('/admin/real-estate/projects', {
            onSuccess: () => {
                // Clean up blob URLs
                if (featuredImagePreview) URL.revokeObjectURL(featuredImagePreview);
                additionalImagePreviews.forEach((url) => URL.revokeObjectURL(url));
                showToastMessage('Project created successfully!', 'success');
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                showToastMessage('Failed to create project. Please check the form.', 'error');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Project" />

            <div className="mx-auto max-w-6xl">
                {/* Toast Notification */}
                {showToast.show && (
                    <div
                        className={`mb-6 rounded-xl border p-4 shadow-sm ${
                            showToast.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                    >
                        <p className={`text-sm font-medium ${showToast.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                            {showToast.message}
                        </p>
                    </div>
                )}

                {/* Header */}
                <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                href="/admin/real-estate"
                                className="mr-4 rounded-lg p-2 text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                                <p className="mt-1 text-gray-600">Add a new real estate project to your platform</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div>
                            <h2 className="mb-6 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">Basic Information</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Developer *</label>
                                    <select
                                        value={form.data.developer_id}
                                        onChange={(e) => form.setData('developer_id', e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    >
                                        <option value="">Select Developer</option>
                                        {developers.map((developer) => (
                                            <option key={developer.id} value={developer.id}>
                                                {developer.company_name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.developer_id && <div className="mt-1 text-sm text-red-600">{form.errors.developer_id}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Project Name *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="Enter project name"
                                    />
                                    {form.errors.name && <div className="mt-1 text-sm text-red-600">{form.errors.name}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Project Type *</label>
                                    <select
                                        value={form.data.project_type}
                                        onChange={(e) => form.setData('project_type', e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    >
                                        {projectTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.project_type && <div className="mt-1 text-sm text-red-600">{form.errors.project_type}</div>}
                                </div>

                                <div className="lg:col-span-3">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="Describe the project features and amenities"
                                    />
                                    {form.errors.description && <div className="mt-1 text-sm text-red-600">{form.errors.description}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div>
                            <h2 className="mb-6 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">Location</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="lg:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
                                    <input
                                        type="text"
                                        value={form.data.address}
                                        onChange={(e) => form.setData('address', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="Street address"
                                    />
                                    {form.errors.address && <div className="mt-1 text-sm text-red-600">{form.errors.address}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Postal Code</label>
                                    <input
                                        type="text"
                                        value={form.data.postal_code}
                                        onChange={(e) => form.setData('postal_code', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="1234"
                                    />
                                    {form.errors.postal_code && <div className="mt-1 text-sm text-red-600">{form.errors.postal_code}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">City *</label>
                                    <input
                                        type="text"
                                        value={form.data.city}
                                        onChange={(e) => form.setData('city', e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="City name"
                                    />
                                    {form.errors.city && <div className="mt-1 text-sm text-red-600">{form.errors.city}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Province *</label>
                                    <input
                                        type="text"
                                        value={form.data.province}
                                        onChange={(e) => form.setData('province', e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="Province name"
                                    />
                                    {form.errors.province && <div className="mt-1 text-sm text-red-600">{form.errors.province}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Region *</label>
                                    <select
                                        value={form.data.region}
                                        onChange={(e) => form.setData('region', e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    >
                                        <option value="">Select Region</option>
                                        {regions.map((region) => (
                                            <option key={region} value={region}>
                                                {region}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.region && <div className="mt-1 text-sm text-red-600">{form.errors.region}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div>
                            <h2 className="mb-6 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">Project Details</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Status *</label>
                                    <select
                                        value={form.data.status}
                                        onChange={(e) => form.setData('status', e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.status && <div className="mt-1 text-sm text-red-600">{form.errors.status}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Total Units</label>
                                    <input
                                        type="number"
                                        value={form.data.total_units}
                                        onChange={(e) => form.setData('total_units', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="100"
                                    />
                                    {form.errors.total_units && <div className="mt-1 text-sm text-red-600">{form.errors.total_units}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Total Floors</label>
                                    <input
                                        type="number"
                                        value={form.data.total_floors}
                                        onChange={(e) => form.setData('total_floors', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="30"
                                    />
                                    {form.errors.total_floors && <div className="mt-1 text-sm text-red-600">{form.errors.total_floors}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Completion Year</label>
                                    <input
                                        type="number"
                                        value={form.data.completion_year}
                                        onChange={(e) => form.setData('completion_year', e.target.value)}
                                        min="2020"
                                        max="2040"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="2025"
                                    />
                                    {form.errors.completion_year && <div className="mt-1 text-sm text-red-600">{form.errors.completion_year}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Turnover Date</label>
                                    <input
                                        type="text"
                                        value={form.data.turnover_date}
                                        onChange={(e) => form.setData('turnover_date', e.target.value)}
                                        placeholder="e.g., Q1 2025, March 2025"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    />
                                    {form.errors.turnover_date && <div className="mt-1 text-sm text-red-600">{form.errors.turnover_date}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Virtual Tour URL</label>
                                    <input
                                        type="url"
                                        value={form.data.virtual_tour_url}
                                        onChange={(e) => form.setData('virtual_tour_url', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="https://tour.example.com"
                                    />
                                    {form.errors.virtual_tour_url && <div className="mt-1 text-sm text-red-600">{form.errors.virtual_tour_url}</div>}
                                </div>

                                <div className="lg:col-span-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={form.data.featured}
                                            onChange={(e) => form.setData('featured', e.target.checked)}
                                            className="mr-3 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Featured Project</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Images Section - Material UI Inspired */}
                        <div>
                            <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-6">
                                <div className="mb-6 flex items-center">
                                    <div className="mr-4 rounded-xl bg-orange-500 p-3">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Project Gallery</h2>
                                        <p className="text-sm text-gray-600">Showcase your project with stunning visuals</p>
                                    </div>
                                </div>

                                {/* Featured Image Card */}
                                <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center">
                                        <Star className="mr-2 h-5 w-5 text-orange-500" />
                                        <h3 className="text-lg font-medium text-gray-900">Featured Image</h3>
                                        <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">Main</span>
                                    </div>

                                    {!featuredImagePreview ? (
                                        <div
                                            className="relative cursor-pointer rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50 p-8 text-center transition-colors hover:border-orange-400"
                                            onClick={() => featuredImageRef.current?.click()}
                                        >
                                            <input
                                                ref={featuredImageRef}
                                                type="file"
                                                onChange={handleFeaturedImageSelect}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <div className="flex flex-col items-center">
                                                <div className="mb-4 rounded-full bg-orange-100 p-4">
                                                    <CloudUpload className="h-8 w-8 text-orange-600" />
                                                </div>
                                                <h4 className="mb-2 text-lg font-medium text-gray-900">Upload Featured Image</h4>
                                                <p className="mb-4 text-sm text-gray-600">Click to browse or drag and drop</p>
                                                <div className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
                                                    Choose File
                                                </div>
                                                <p className="mt-3 text-xs text-gray-500">Supports: JPG, PNG, GIF (max 5MB)</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="relative overflow-hidden rounded-xl border border-gray-200">
                                                <img
                                                    src={featuredImagePreview}
                                                    alt="Featured image preview"
                                                    className="h-48 w-full object-cover"
                                                    onError={(e) => {
                                                        console.error('Image load error:', featuredImagePreview);
                                                        (e.target as HTMLImageElement).src =
                                                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666">Error loading image</text></svg>';
                                                    }}
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <div className="rounded-full bg-orange-500 p-2 text-white">
                                                        <Star className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <div className="bg-opacity-0 hover:bg-opacity-20 absolute inset-0 flex items-center justify-center bg-black transition-all duration-300">
                                                    <div className="flex space-x-2 opacity-0 transition-opacity duration-300 hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => featuredImageRef.current?.click()}
                                                            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-lg transition-colors hover:bg-gray-50"
                                                        >
                                                            Change
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={removeFeaturedImage}
                                                            className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-red-600"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <input
                                                ref={featuredImageRef}
                                                type="file"
                                                onChange={handleFeaturedImageSelect}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </div>
                                    )}

                                    {form.errors.featured_image && (
                                        <div className="mt-3 flex items-center text-sm text-red-600">
                                            <X className="mr-1 h-4 w-4" />
                                            {form.errors.featured_image}
                                        </div>
                                    )}
                                </div>

                                {/* Additional Images Card */}
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <ImageIcon className="mr-2 h-5 w-5 text-orange-500" />
                                            <h3 className="text-lg font-medium text-gray-900">Additional Images</h3>
                                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Gallery</span>
                                        </div>
                                        {additionalImagePreviews.length > 0 && (
                                            <span className="text-sm text-gray-600">
                                                {additionalImagePreviews.length} image{additionalImagePreviews.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>

                                    {/* Upload Area */}
                                    <div
                                        className="mb-4 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center transition-colors hover:border-orange-400"
                                        onClick={() => additionalImagesRef.current?.click()}
                                    >
                                        <input
                                            ref={additionalImagesRef}
                                            type="file"
                                            onChange={handleAdditionalImagesSelect}
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-center">
                                            <div className="mb-3 rounded-full bg-gray-100 p-3">
                                                <Plus className="h-6 w-6 text-gray-600" />
                                            </div>
                                            <h4 className="mb-1 text-base font-medium text-gray-900">Add More Images</h4>
                                            <p className="mb-3 text-sm text-gray-600">Select multiple files to upload at once</p>
                                            <div className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
                                                Browse Files
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple files</p>
                                        </div>
                                    </div>

                                    {/* Images Grid */}
                                    {additionalImagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                            {additionalImagePreviews.map((imageUrl: string, index: number) => (
                                                <div key={index} className="group relative">
                                                    <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Gallery image ${index + 1}`}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src =
                                                                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666">Error</text></svg>';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="bg-opacity-0 group-hover:bg-opacity-40 absolute inset-0 flex items-center justify-center rounded-xl bg-black transition-all duration-300">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAdditionalImage(index)}
                                                            className="scale-90 transform rounded-full bg-red-500 p-2 text-white opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 hover:bg-red-600"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="absolute top-2 left-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700 opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
                                                        #{index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {form.errors.additional_images && (
                                        <div className="mt-3 flex items-center text-sm text-red-600">
                                            <X className="mr-1 h-4 w-4" />
                                            {form.errors.additional_images}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
                            <Link
                                href="/admin/real-estate"
                                className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex items-center rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing ? (
                                    <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Create Project
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
