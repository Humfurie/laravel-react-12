import { Camera, CloudUpload, Image as ImageIcon, Plus, Star, Upload, X } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

interface Developer {
    id: number;
    company_name: string;
    description?: string;
    logo_url?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    created_at: string;
}

interface RealEstateProject {
    id: number;
    name: string;
    description?: string;
    project_type: string;
    address?: string;
    city: string;
    province: string;
    region: string;
    country?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    turnover_date?: string;
    completion_year?: number;
    status: string;
    total_units?: number;
    total_floors?: number;
    virtual_tour_url?: string;
    featured: boolean;
    developer: Developer;
}

interface DeveloperFormData {
    company_name: string;
    description: string;
    logo_url?: string;
    contact_email: string;
    contact_phone: string;
    website: string;
}

interface DeveloperForm {
    data: DeveloperFormData;
    errors: Record<string, string>;
    processing: boolean;
    setData: (key: string | object, value?: string | number | boolean | File | null) => void;
}

interface DeveloperModalProps {
    show: boolean;
    onClose: () => void;
    developer: Developer | null;
    onSubmit: (e: FormEvent, selectedFile?: File | null) => void;
    form: DeveloperForm;
}

export function DeveloperModal({ show, onClose, developer, onSubmit, form }: DeveloperModalProps) {
    const [logoInputType, setLogoInputType] = useState<'upload' | 'url'>('upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        // Create a preview URL for the selected file
        const previewUrl = URL.createObjectURL(file);
        form.setData('logo_url', previewUrl);
    };

    const clearLogo = () => {
        form.setData('logo_url', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!show) return null;

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
            <div className="relative top-20 mx-auto w-11/12 rounded-xl border border-gray-200 bg-white p-6 shadow-xl md:w-3/4 lg:w-1/2">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{developer ? 'Edit Developer' : 'Add New Developer'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={(e) => onSubmit(e, selectedFile)}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">Company Name *</label>
                            <input
                                type="text"
                                value={form.data.company_name}
                                onChange={(e) => form.setData('company_name', e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.company_name && <div className="mt-1 text-sm text-red-600">{form.errors.company_name}</div>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.description && <div className="mt-1 text-sm text-red-600">{form.errors.description}</div>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Contact Email</label>
                            <input
                                type="email"
                                value={form.data.contact_email}
                                onChange={(e) => form.setData('contact_email', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.contact_email && <div className="mt-1 text-sm text-red-600">{form.errors.contact_email}</div>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Contact Phone</label>
                            <input
                                type="text"
                                value={form.data.contact_phone}
                                onChange={(e) => form.setData('contact_phone', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.contact_phone && <div className="mt-1 text-sm text-red-600">{form.errors.contact_phone}</div>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Website</label>
                            <input
                                type="url"
                                value={form.data.website}
                                onChange={(e) => form.setData('website', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.website && <div className="mt-1 text-sm text-red-600">{form.errors.website}</div>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">Logo</label>
                            <div className="space-y-3">
                                {/* Input type selector */}
                                <div className="mb-3 flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={logoInputType === 'upload'}
                                            onChange={() => {
                                                setLogoInputType('upload');
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Upload Photo</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={logoInputType === 'url'}
                                            onChange={() => {
                                                setLogoInputType('url');
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Enter URL</span>
                                    </label>
                                </div>

                                {/* File upload (when upload is selected) */}
                                {logoInputType === 'upload' && (
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileSelect}
                                            accept="image/*,image/svg+xml"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Supports: JPG, PNG, GIF, SVG (max 2MB). File will be uploaded when you save the developer.
                                        </p>
                                        {selectedFile && (
                                            <div className="mt-2 flex items-center text-green-600">
                                                <Upload className="mr-2 h-4 w-4" />
                                                <span className="text-sm">Selected: {selectedFile.name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* URL input (when URL is selected) */}
                                {logoInputType === 'url' && (
                                    <div>
                                        <input
                                            type="text"
                                            value={form.data.logo_url}
                                            onChange={(e) => form.setData('logo_url', e.target.value)}
                                            placeholder="https://example.com/logo.png or /storage/logo.png"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Enter any valid image URL (external or storage path)</p>
                                    </div>
                                )}

                                {/* Preview */}
                                {form.data.logo_url && (
                                    <div className="mt-3">
                                        <label className="mb-2 block text-xs text-gray-500">Preview:</label>
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={form.data.logo_url}
                                                alt="Logo preview"
                                                className="h-16 w-16 rounded border border-gray-300 object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666">Error</text></svg>';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={clearLogo}
                                                className="flex items-center text-xs text-red-600 hover:text-red-800"
                                            >
                                                <X className="mr-1 h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {form.errors.logo_url && <div className="mt-1 text-sm text-red-600">{form.errors.logo_url}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-lg bg-orange-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-50"
                        >
                            {form.processing ? 'Saving...' : developer ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface ProjectFormData {
    developer_id: string;
    name: string;
    description: string;
    project_type: string;
    address: string;
    city: string;
    province: string;
    region: string;
    country?: string;
    postal_code: string;
    latitude?: string;
    longitude?: string;
    turnover_date: string;
    completion_year: string;
    status: string;
    total_units: string;
    total_floors: string;
    virtual_tour_url: string;
    featured: boolean;
    featured_image: string | null;
    images: string[];
}

interface ProjectForm {
    data: ProjectFormData;
    errors: Record<string, string>;
    processing: boolean;
    setData: (key: string | object, value?: string | number | boolean | File | null | File[] | string[]) => void;
}

interface ProjectModalProps {
    show: boolean;
    onClose: () => void;
    project: RealEstateProject | null;
    onSubmit: (e: FormEvent, selectedFiles?: File[], featuredFile?: File | null) => void;
    form: ProjectForm;
    developers: Developer[];
}

export function ProjectModal({ show, onClose, project, onSubmit, form, developers }: ProjectModalProps) {
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
    const featuredImageRef = useRef<HTMLInputElement>(null);
    const additionalImagesRef = useRef<HTMLInputElement>(null);

    const handleFeaturedImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFeaturedImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        form.setData('featured_image', previewUrl);
    };

    const handleAdditionalImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setAdditionalImageFiles((prev) => [...prev, ...files]);

        // Create preview URLs
        const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
        const existingImages = form.data.images || [];
        form.setData('images', [...existingImages, ...newPreviewUrls]);
    };

    const removeFeaturedImage = () => {
        setFeaturedImageFile(null);
        form.setData('featured_image', '');
        if (featuredImageRef.current) {
            featuredImageRef.current.value = '';
        }
    };

    const removeAdditionalImage = (index: number) => {
        const updatedFiles = additionalImageFiles.filter((_, i) => i !== index);
        setAdditionalImageFiles(updatedFiles);

        const updatedImages = (form.data.images || []).filter((_: string, i: number) => i !== index);
        form.setData('images', updatedImages);
    };

    if (!show) return null;

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

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
            <div className="relative top-10 mx-auto max-h-[90vh] w-11/12 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl md:w-4/5 lg:w-3/4">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{project ? 'Edit Project' : 'Add New Project'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={(e) => onSubmit(e, additionalImageFiles, featuredImageFile)}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Basic Information */}
                        <div className="lg:col-span-3">
                            <h4 className="mb-4 border-b border-gray-200 pb-2 text-lg font-medium text-gray-900">Basic Information</h4>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Developer *</label>
                            <select
                                value={form.data.developer_id}
                                onChange={(e) => form.setData('developer_id', e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.name && <div className="mt-1 text-sm text-red-600">{form.errors.name}</div>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Project Type *</label>
                            <select
                                value={form.data.project_type}
                                onChange={(e) => form.setData('project_type', e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.description && <div className="mt-1 text-sm text-red-600">{form.errors.description}</div>}
                        </div>

                        {/* Location Information */}
                        <div className="mt-6 lg:col-span-3">
                            <h4 className="mb-4 border-b border-gray-200 pb-2 text-lg font-medium text-gray-900">Location</h4>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.address && <div className="mt-1 text-sm text-red-600">{form.errors.address}</div>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Postal Code</label>
                            <input
                                type="text"
                                value={form.data.postal_code}
                                onChange={(e) => form.setData('postal_code', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.province && <div className="mt-1 text-sm text-red-600">{form.errors.province}</div>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Region *</label>
                            <select
                                value={form.data.region}
                                onChange={(e) => form.setData('region', e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
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

                        {/* Project Details */}
                        <div className="mt-6 lg:col-span-3">
                            <h4 className="mb-4 border-b border-gray-200 pb-2 text-lg font-medium text-gray-900">Project Details</h4>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Status *</label>
                            <select
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.total_units && <div className="mt-1 text-sm text-red-600">{form.errors.total_units}</div>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Total Floors</label>
                            <input
                                type="number"
                                value={form.data.total_floors}
                                onChange={(e) => form.setData('total_floors', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.turnover_date && <div className="mt-1 text-sm text-red-600">{form.errors.turnover_date}</div>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Virtual Tour URL</label>
                            <input
                                type="url"
                                value={form.data.virtual_tour_url}
                                onChange={(e) => form.setData('virtual_tour_url', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            {form.errors.virtual_tour_url && <div className="mt-1 text-sm text-red-600">{form.errors.virtual_tour_url}</div>}
                        </div>

                        <div className="lg:col-span-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={form.data.featured}
                                    onChange={(e) => form.setData('featured', e.target.checked)}
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Featured Project</span>
                            </label>
                        </div>

                        {/* Images Section - Material UI Inspired */}
                        <div className="mt-8 lg:col-span-3">
                            <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-6">
                                <div className="mb-6 flex items-center">
                                    <div className="mr-4 rounded-xl bg-orange-500 p-3">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-gray-900">Project Gallery</h4>
                                        <p className="text-sm text-gray-600">Showcase your project with stunning visuals</p>
                                    </div>
                                </div>

                                {/* Featured Image Card */}
                                <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center">
                                        <Star className="mr-2 h-5 w-5 text-orange-500" />
                                        <h5 className="text-lg font-medium text-gray-900">Featured Image</h5>
                                        <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">Main</span>
                                    </div>

                                    {!form.data.featured_image ? (
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
                                                <h6 className="mb-2 text-lg font-medium text-gray-900">Upload Featured Image</h6>
                                                <p className="mb-4 text-sm text-gray-600">Click to browse or drag and drop</p>
                                                <div className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
                                                    Choose File
                                                </div>
                                                <p className="mt-3 text-xs text-gray-500">Supports: JPG, PNG, GIF (max 2MB)</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="relative overflow-hidden rounded-xl border border-gray-200">
                                                <img
                                                    src={form.data.featured_image}
                                                    alt="Featured image preview"
                                                    className="h-48 w-full object-cover"
                                                    onError={(e) => {
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
                                            <h5 className="text-lg font-medium text-gray-900">Additional Images</h5>
                                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Gallery</span>
                                        </div>
                                        {form.data.images && form.data.images.length > 0 && (
                                            <span className="text-sm text-gray-600">
                                                {form.data.images.length} image{form.data.images.length !== 1 ? 's' : ''}
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
                                            <h6 className="mb-1 text-base font-medium text-gray-900">Add More Images</h6>
                                            <p className="mb-3 text-sm text-gray-600">Select multiple files to upload at once</p>
                                            <div className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
                                                Browse Files
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple files</p>
                                        </div>
                                    </div>

                                    {/* Images Grid */}
                                    {form.data.images && form.data.images.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                            {form.data.images.map((imageUrl: string, index: number) => (
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

                                    {form.errors.images && (
                                        <div className="mt-3 flex items-center text-sm text-red-600">
                                            <X className="mr-1 h-4 w-4" />
                                            {form.errors.images}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-lg bg-orange-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-50"
                        >
                            {form.processing ? 'Saving...' : project ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
