import { DeveloperModal, ProjectModal } from '@/components/real-estate-modals';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Building, Edit, Home, Mail, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Real Estate Management',
        href: '/admin/real-estate',
    },
];

interface Developer {
    id: number;
    company_name: string;
    description?: string;
    logo_url?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    created_at: string;
    real_estate_projects?: RealEstateProject[];
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
    properties?: Property[];
}

interface Property {
    id: number;
    title: string;
    description?: string;
    unit_number?: string;
    floor_level?: number;
    building_phase?: string;
    property_type: string;
    floor_area?: number;
    floor_area_unit?: string;
    balcony_area?: number;
    bedrooms?: number;
    bathrooms?: number;
    parking_spaces?: number;
    orientation?: string;
    view_type?: string;
    listing_status: string;
    floor_plan_url?: string;
    featured: boolean;
    project?: RealEstateProject;
}

interface Inquiry {
    id: number;
    status: string;
    created_at: string;
    property?: Property;
}

interface RealEstateProps {
    developers: Developer[];
    projects: RealEstateProject[];
    properties: Property[];
    inquiries: Inquiry[];
}

export default function RealEstateManagement({ developers, projects, properties, inquiries }: RealEstateProps) {
    const [activeTab, setActiveTab] = useState<'developers' | 'projects' | 'properties' | 'inquiries'>('developers');

    // Modal states
    const [showDeveloperModal, setShowDeveloperModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
    const [editingProject, setEditingProject] = useState<RealEstateProject | null>(null);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    // Developer form
    const developerForm = useForm({
        company_name: '',
        description: '',
        logo_url: '',
        contact_email: '',
        contact_phone: '',
        website: '',
    });

    // Project form
    const projectForm = useForm({
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
        images: [],
        featured_image: '',
    });

    // Property form
    const propertyForm = useForm({
        project_id: '',
        title: '',
        description: '',
        unit_number: '',
        floor_level: '',
        building_phase: '',
        property_type: 'studio',
        floor_area: '',
        floor_area_unit: 'sq.m.',
        balcony_area: '',
        bedrooms: '',
        bathrooms: '',
        parking_spaces: '',
        orientation: '',
        view_type: '',
        listing_status: 'available',
        floor_plan_url: '',
        featured: false,
    });

    // Developer CRUD functions
    const handleCreateDeveloper = () => {
        setEditingDeveloper(null);
        developerForm.reset();
        setShowDeveloperModal(true);
    };

    const handleEditDeveloper = (developer: Developer) => {
        setEditingDeveloper(developer);
        developerForm.setData({
            company_name: developer.company_name || '',
            description: developer.description || '',
            logo_url: developer.logo_url || '',
            contact_email: developer.contact_email || '',
            contact_phone: developer.contact_phone || '',
            website: developer.website || '',
        });
        setShowDeveloperModal(true);
    };

    const handleSubmitDeveloper = (e: FormEvent, selectedFile?: File | null) => {
        e.preventDefault();

        // If there's a selected file, handle the upload first, then create developer
        if (selectedFile) {
            // First upload the file using fetch (since it's a utility endpoint)
            const uploadFile = async () => {
                const formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('type', 'logo');

                try {
                    const response = await fetch('/admin/real-estate/upload-image', {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    const result = await response.json();

                    if (result.success) {
                        // Update the form data with the uploaded URL
                        developerForm.setData('logo_url', result.url);

                        // Then submit the developer form using Inertia
                        if (editingDeveloper) {
                            developerForm.put(`/admin/real-estate/developers/${editingDeveloper.id}`, {
                                onSuccess: () => {
                                    setShowDeveloperModal(false);
                                    setEditingDeveloper(null);
                                },
                            });
                        } else {
                            developerForm.post('/admin/real-estate/developers', {
                                onSuccess: () => {
                                    setShowDeveloperModal(false);
                                },
                            });
                        }
                    } else {
                        alert('Upload failed: ' + (result.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    alert('Upload failed: ' + (error as Error).message);
                }
            };

            uploadFile();
        } else {
            // No file to upload, proceed with form submission
            if (editingDeveloper) {
                developerForm.put(`/admin/real-estate/developers/${editingDeveloper.id}`, {
                    onSuccess: () => {
                        setShowDeveloperModal(false);
                        setEditingDeveloper(null);
                    },
                });
            } else {
                developerForm.post('/admin/real-estate/developers', {
                    onSuccess: () => {
                        setShowDeveloperModal(false);
                    },
                });
            }
        }
    };

    const handleDeleteDeveloper = (id: number) => {
        if (confirm('Are you sure you want to delete this developer?')) {
            router.delete(`/admin/real-estate/developers/${id}`);
        }
    };

    // Project CRUD functions
    const handleCreateProject = () => {
        setEditingProject(null);
        projectForm.reset();
        setShowProjectModal(true);
    };

    const handleEditProject = (project: RealEstateProject) => {
        setEditingProject(project);
        projectForm.setData({
            developer_id: project.developer.id.toString(),
            name: project.name || '',
            description: project.description || '',
            project_type: project.project_type || 'condominium',
            address: project.address || '',
            city: project.city || '',
            province: project.province || '',
            region: project.region || '',
            country: project.country || 'Philippines',
            postal_code: project.postal_code || '',
            latitude: project.latitude?.toString() || '',
            longitude: project.longitude?.toString() || '',
            turnover_date: project.turnover_date || '',
            completion_year: project.completion_year?.toString() || '',
            status: project.status || 'pre-selling',
            total_units: project.total_units?.toString() || '',
            total_floors: project.total_floors?.toString() || '',
            virtual_tour_url: project.virtual_tour_url || '',
            featured: project.featured || false,
            images: (project as any).images || [],
            featured_image: (project as any).featured_image || '',
        });
        setShowProjectModal(true);
    };

    const handleSubmitProject = (e: FormEvent, selectedFiles?: File[], featuredFile?: File | null) => {
        e.preventDefault();

        // Function to handle final form submission
        const submitForm = () => {
            if (editingProject) {
                projectForm.put(`/admin/real-estate/projects/${editingProject.id}`, {
                    onSuccess: () => {
                        setShowProjectModal(false);
                        setEditingProject(null);
                    },
                });
            } else {
                projectForm.post('/admin/real-estate/projects', {
                    onSuccess: () => {
                        setShowProjectModal(false);
                    },
                });
            }
        };

        // If there are files to upload, handle uploads first
        const hasFiles = (selectedFiles && selectedFiles.length > 0) || featuredFile;

        if (hasFiles) {
            const uploadFiles = async () => {
                try {
                    const uploadPromises = [];

                    // Upload featured image if provided
                    if (featuredFile) {
                        const featuredFormData = new FormData();
                        featuredFormData.append('image', featuredFile);
                        featuredFormData.append('type', 'project');

                        const featuredPromise = fetch('/admin/real-estate/upload-image', {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: featuredFormData,
                        }).then((response) => response.json());

                        uploadPromises.push(featuredPromise);
                    }

                    // Upload additional images if provided
                    if (selectedFiles && selectedFiles.length > 0) {
                        for (const file of selectedFiles) {
                            const formData = new FormData();
                            formData.append('image', file);
                            formData.append('type', 'project');

                            const promise = fetch('/admin/real-estate/upload-image', {
                                method: 'POST',
                                headers: {
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                },
                                body: formData,
                            }).then((response) => response.json());

                            uploadPromises.push(promise);
                        }
                    }

                    // Wait for all uploads to complete
                    const results = await Promise.all(uploadPromises);

                    // Check if all uploads were successful
                    const allSuccessful = results.every((result) => result.success);

                    if (allSuccessful) {
                        // Separate featured image result from additional images
                        let featuredImageUrl = projectForm.data.featured_image;
                        let additionalImages = [...(projectForm.data.images || [])];

                        // If we uploaded a featured image, it's the first result
                        if (featuredFile) {
                            featuredImageUrl = results[0].url;
                            // Additional images start from index 1
                            const additionalResults = results.slice(1);
                            additionalImages = additionalResults.map((result) => result.url);
                        } else {
                            // All results are additional images
                            additionalImages = results.map((result) => result.url);
                        }

                        // Update form data with uploaded URLs
                        projectForm.setData({
                            ...projectForm.data,
                            featured_image: featuredImageUrl,
                            images: additionalImages,
                        });

                        // Submit the form
                        submitForm();
                    } else {
                        const failedUploads = results.filter((result) => !result.success);
                        alert('Some uploads failed: ' + failedUploads.map((r) => r.message).join(', '));
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    alert('Upload failed: ' + (error as Error).message);
                }
            };

            uploadFiles();
        } else {
            // No files to upload, proceed with form submission
            submitForm();
        }
    };

    const handleDeleteProject = (id: number) => {
        if (confirm('Are you sure you want to delete this project?')) {
            router.delete(`/admin/real-estate/projects/${id}`);
        }
    };

    // Property CRUD functions
    const handleCreateProperty = () => {
        setEditingProperty(null);
        propertyForm.reset();
        setShowPropertyModal(true);
    };

    const handleEditProperty = (property: Property) => {
        setEditingProperty(property);
        propertyForm.setData({
            project_id: property.project?.id.toString() || '',
            title: property.title || '',
            description: property.description || '',
            unit_number: property.unit_number || '',
            floor_level: property.floor_level?.toString() || '',
            building_phase: property.building_phase || '',
            property_type: property.property_type || 'studio',
            floor_area: property.floor_area?.toString() || '',
            floor_area_unit: property.floor_area_unit || 'sq.m.',
            balcony_area: property.balcony_area?.toString() || '',
            bedrooms: property.bedrooms?.toString() || '',
            bathrooms: property.bathrooms?.toString() || '',
            parking_spaces: property.parking_spaces?.toString() || '',
            orientation: property.orientation || '',
            view_type: property.view_type || '',
            listing_status: property.listing_status || 'available',
            floor_plan_url: property.floor_plan_url || '',
            featured: property.featured || false,
        });
        setShowPropertyModal(true);
    };

    const handleSubmitProperty = (e: FormEvent) => {
        e.preventDefault();

        if (editingProperty) {
            propertyForm.put(`/admin/real-estate/properties/${editingProperty.id}`, {
                onSuccess: () => {
                    setShowPropertyModal(false);
                    setEditingProperty(null);
                },
            });
        } else {
            propertyForm.post('/admin/real-estate/properties', {
                onSuccess: () => {
                    setShowPropertyModal(false);
                },
            });
        }
    };

    const handleDeleteProperty = (id: number) => {
        if (confirm('Are you sure you want to delete this property?')) {
            router.delete(`/admin/real-estate/properties/${id}`);
        }
    };

    const tabs = [
        {
            id: 'developers' as const,
            name: 'Developers',
            icon: Building,
            count: developers.length,
        },
        {
            id: 'projects' as const,
            name: 'Projects',
            icon: Building,
            count: projects.length,
        },
        {
            id: 'properties' as const,
            name: 'Properties',
            icon: Home,
            count: properties.length,
        },
        {
            id: 'inquiries' as const,
            name: 'Inquiries',
            icon: Mail,
            count: inquiries.length,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Real Estate Management" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-gray-50/50 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-2xl font-bold text-gray-900">
                            <Building className="mr-3 h-7 w-7 text-orange-500" />
                            Real Estate Management
                        </h1>
                        <p className="mt-1 text-gray-600">Manage developers, projects, properties, and inquiries</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const gradients = [
                            'from-orange-500 to-orange-600',
                            'from-orange-400 to-orange-500',
                            'from-orange-300 to-orange-400',
                            'from-orange-200 to-orange-300',
                        ];
                        return (
                            <div
                                key={tab.id}
                                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className={`rounded-lg bg-gradient-to-r p-3 ${gradients[index]} shadow-sm`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="truncate text-sm font-medium text-gray-600">{tab.name}</dt>
                                                <dd className="text-2xl font-bold text-gray-900">{tab.count}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tab Navigation */}
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`${
                                            activeTab === tab.id
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } flex items-center border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors`}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {tab.name} ({tab.count})
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'developers' && (
                            <div>
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Developers Management</h2>
                                    <a
                                        href="/admin/real-estate/developers/create"
                                        className="flex items-center rounded-lg bg-orange-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-orange-600"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Developer
                                    </a>
                                </div>

                                {/* Developers Table */}
                                <div className="overflow-hidden rounded-lg bg-white shadow">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Developer
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Contact
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Projects
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {developers.length > 0 ? (
                                                developers.map((developer) => (
                                                    <tr key={developer.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                {developer.logo_url ? (
                                                                    <img
                                                                        className="h-10 w-10 rounded-full object-cover"
                                                                        src={developer.logo_url}
                                                                        alt={developer.company_name}
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                                                                        <Building className="h-6 w-6 text-gray-600" />
                                                                    </div>
                                                                )}
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{developer.company_name}</div>
                                                                    {developer.description && (
                                                                        <div className="text-sm text-gray-500">
                                                                            {developer.description.substring(0, 50)}
                                                                            {developer.description.length > 50 ? '...' : ''}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {developer.contact_email && (
                                                                    <div className="flex items-center">
                                                                        <Mail className="mr-1 h-4 w-4" />
                                                                        {developer.contact_email}
                                                                    </div>
                                                                )}
                                                                {developer.contact_phone && (
                                                                    <div className="mt-1 flex items-center">
                                                                        <span className="mr-1">📞</span>
                                                                        {developer.contact_phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                                                {developer.real_estate_projects?.length || 0} projects
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                            <div className="flex items-center space-x-3">
                                                                <a
                                                                    href={`/admin/real-estate/developers/${developer.id}/edit`}
                                                                    className="flex items-center text-orange-600 transition-colors hover:text-orange-800"
                                                                >
                                                                    <Edit className="mr-1 h-4 w-4" />
                                                                    Edit
                                                                </a>
                                                                <button
                                                                    onClick={() => handleDeleteDeveloper(developer.id)}
                                                                    className="flex items-center text-red-600 transition-colors hover:text-red-800"
                                                                >
                                                                    <Trash2 className="mr-1 h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                        <Building className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                                        <p className="mb-2 text-lg font-medium text-gray-600">No developers found</p>
                                                        <button
                                                            onClick={handleCreateDeveloper}
                                                            className="font-medium text-orange-600 transition-colors hover:text-orange-800"
                                                        >
                                                            Add your first developer
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div>
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Projects Management</h2>
                                    <a
                                        href="/admin/real-estate/projects/create"
                                        className="flex items-center rounded-lg bg-orange-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-orange-600"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Project
                                    </a>
                                </div>

                                {/* Projects Table */}
                                <div className="overflow-hidden rounded-lg bg-white shadow">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Project
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Developer
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Location
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Units
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {projects.length > 0 ? (
                                                projects.map((project) => (
                                                    <tr key={project.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                                                                    <Building className="h-6 w-6 text-orange-600" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {project.project_type.charAt(0).toUpperCase() +
                                                                            project.project_type.slice(1).replace('-', ' ')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{project.developer.company_name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {project.city}, {project.province}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{project.region}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                    project.status === 'pre-selling'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : project.status === 'under-construction'
                                                                          ? 'bg-yellow-100 text-yellow-800'
                                                                          : project.status === 'ready-for-occupancy'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : project.status === 'completed'
                                                                              ? 'bg-gray-100 text-gray-800'
                                                                              : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {project.total_units ? `${project.total_units} units` : 'N/A'}
                                                            </div>
                                                            {project.total_floors && (
                                                                <div className="text-sm text-gray-500">{project.total_floors} floors</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                            <div className="flex items-center space-x-3">
                                                                <a
                                                                    href={`/admin/real-estate/projects/${project.id}/edit`}
                                                                    className="flex items-center text-orange-600 transition-colors hover:text-orange-800"
                                                                >
                                                                    <Edit className="mr-1 h-4 w-4" />
                                                                    Edit
                                                                </a>
                                                                <button
                                                                    onClick={() => handleDeleteProject(project.id)}
                                                                    className="flex items-center text-red-600 transition-colors hover:text-red-800"
                                                                >
                                                                    <Trash2 className="mr-1 h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                        <Building className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                                        <p className="mb-2 text-lg font-medium text-gray-600">No projects found</p>
                                                        <a
                                                            href="/admin/real-estate/projects/create"
                                                            className="font-medium text-orange-600 transition-colors hover:text-orange-800"
                                                        >
                                                            Add your first project
                                                        </a>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'properties' && (
                            <div>
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Properties Management</h2>
                                    <button className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Property
                                    </button>
                                </div>
                                <p className="text-gray-600">Properties management content will be implemented here.</p>
                            </div>
                        )}

                        {activeTab === 'inquiries' && (
                            <div>
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Inquiries Management</h2>
                                </div>
                                <p className="text-gray-600">Inquiries management content will be implemented here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Developer Modal */}
                <DeveloperModal
                    show={showDeveloperModal}
                    onClose={() => setShowDeveloperModal(false)}
                    developer={editingDeveloper}
                    onSubmit={handleSubmitDeveloper}
                    form={developerForm}
                />

                {/* Project Modal */}
                <ProjectModal
                    show={showProjectModal}
                    onClose={() => setShowProjectModal(false)}
                    project={editingProject}
                    onSubmit={handleSubmitProject}
                    form={projectForm}
                    developers={developers}
                />
            </div>
        </AppLayout>
    );
}
