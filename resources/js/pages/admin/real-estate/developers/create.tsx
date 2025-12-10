import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

export default function CreateDeveloper() {
    const [logoInputType, setLogoInputType] = useState<'upload' | 'url'>('upload');
    const [logoPreview, setLogoPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        company_name: '',
        description: '',
        logo_url: '',
        logo_file: null as File | null,
        contact_email: '',
        contact_phone: '',
        website: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Real Estate', href: '/admin/real-estate' },
        { title: 'Developers', href: '/admin/real-estate' },
        { title: 'Create', href: '' },
    ];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (logoPreview && logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
        form.setData('logo_file', file);
    };

    const clearLogo = () => {
        if (logoPreview && logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
        }

        setLogoPreview('');
        form.setData('logo_url', '');
        form.setData('logo_file', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        form.post('/admin/real-estate/developers', {
            forceFormData: true,
            onSuccess: () => {
                if (logoPreview && logoPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(logoPreview);
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Developer" />

            <div className="mx-auto max-w-4xl">
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
                                <h1 className="text-2xl font-bold text-gray-900">Create New Developer</h1>
                                <p className="mt-1 text-gray-600">Add a new real estate developer to your platform</p>
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
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Company Name *</label>
                                    <input
                                        type="text"
                                        value={form.data.company_name}
                                        onChange={(e) => form.setData('company_name', e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="Enter company name"
                                    />
                                    {form.errors.company_name && <div className="mt-1 text-sm text-red-600">{form.errors.company_name}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        rows={4}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="Describe the developer's background and expertise"
                                    />
                                    {form.errors.description && <div className="mt-1 text-sm text-red-600">{form.errors.description}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Contact Email</label>
                                    <input
                                        type="email"
                                        value={form.data.contact_email}
                                        onChange={(e) => form.setData('contact_email', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="contact@company.com"
                                    />
                                    {form.errors.contact_email && <div className="mt-1 text-sm text-red-600">{form.errors.contact_email}</div>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Contact Phone</label>
                                    <input
                                        type="text"
                                        value={form.data.contact_phone}
                                        onChange={(e) => form.setData('contact_phone', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="+63 xxx xxx xxxx"
                                    />
                                    {form.errors.contact_phone && <div className="mt-1 text-sm text-red-600">{form.errors.contact_phone}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Website</label>
                                    <input
                                        type="url"
                                        value={form.data.website}
                                        onChange={(e) => form.setData('website', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        placeholder="https://company.com"
                                    />
                                    {form.errors.website && <div className="mt-1 text-sm text-red-600">{form.errors.website}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Logo Section */}
                        <div>
                            <h2 className="mb-6 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">Company Logo</h2>
                            <div className="space-y-4">
                                {/* Input type selector */}
                                <div className="flex space-x-6">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={logoInputType === 'upload'}
                                            onChange={() => {
                                                setLogoInputType('upload');
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Upload Logo</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={logoInputType === 'url'}
                                            onChange={() => {
                                                setLogoInputType('url');
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Enter URL</span>
                                    </label>
                                </div>

                                {/* File upload */}
                                {logoInputType === 'upload' && (
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileSelect}
                                            accept="image/*,image/svg+xml"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            Supports: JPG, PNG, GIF, SVG (max 5MB). File will be uploaded when you save the developer.
                                        </p>
                                        {form.data.logo_file && (
                                            <div className="mt-3 flex items-center text-green-600">
                                                <Upload className="mr-2 h-4 w-4" />
                                                <span className="text-sm">Selected: {form.data.logo_file.name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* URL input */}
                                {logoInputType === 'url' && (
                                    <div>
                                        <input
                                            type="text"
                                            value={form.data.logo_url}
                                            onChange={(e) => {
                                                form.setData('logo_url', e.target.value);
                                                setLogoPreview(e.target.value);
                                                form.setData('logo_file', null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            placeholder="https://example.com/logo.png or /storage/logo.png"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">Enter any valid image URL (external or storage path)</p>
                                    </div>
                                )}

                                {/* Preview */}
                                {logoPreview && (
                                    <div className="mt-4">
                                        <label className="mb-3 block text-sm font-medium text-gray-700">Preview:</label>
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="h-20 w-20 rounded-lg border border-gray-300 object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666">Error</text></svg>';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={clearLogo}
                                                className="flex items-center text-sm text-red-600 transition-colors hover:text-red-800"
                                            >
                                                <X className="mr-1 h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {form.errors.logo_url && <div className="mt-1 text-sm text-red-600">{form.errors.logo_url}</div>}
                                {form.errors.logo_file && <div className="mt-1 text-sm text-red-600">{form.errors.logo_file}</div>}
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
                                className="flex items-center rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {form.processing ? 'Creating...' : 'Create Developer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
