import AdminLayout from '@/layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Building, Edit, Home, Mail, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

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
    const { can } = usePermissions();

    // Get active tab from URL or default based on permissions
    const getInitialTab = (): 'developers' | 'projects' | 'properties' | 'inquiries' => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'developers' || tab === 'projects' || tab === 'properties' || tab === 'inquiries') {
            return tab;
        }

        // Default to first tab user has viewAny permission for
        if (can('developer', 'viewAny')) return 'developers';
        if (can('realestate-project', 'viewAny')) return 'projects';
        if (can('property', 'viewAny')) return 'properties';

        return 'developers'; // Fallback
    };

    const [activeTab, setActiveTab] = useState<'developers' | 'projects' | 'properties' | 'inquiries'>(getInitialTab());

    // Update URL when tab changes
    const handleTabChange = (tabId: 'developers' | 'projects' | 'properties' | 'inquiries') => {
        setActiveTab(tabId);
        router.visit(`/admin/real-estate?tab=${tabId}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // CRUD functions
    const handleDeleteDeveloper = (id: number) => {
        if (confirm('Are you sure you want to delete this developer?')) {
            router.delete(`/admin/real-estate/developers/${id}`);
        }
    };

    const handleDeleteProject = (id: number) => {
        if (confirm('Are you sure you want to delete this project?')) {
            router.delete(`/admin/real-estate/projects/${id}`);
        }
    };

    // Property CRUD functions
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
        <AdminLayout>
            <Head title="Real Estate Management" />
            <div className="flex h-full flex-1 flex-col gap-6">
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
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${
                                    isActive ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-100'
                                }`}
                            >
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className={`rounded-lg bg-gradient-to-r p-3 ${gradients[index]} shadow-sm`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1 text-left">
                                            <dl>
                                                <dt className="truncate text-sm font-medium text-gray-600">{tab.name}</dt>
                                                <dd className="text-2xl font-bold text-gray-900">{tab.count}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </button>
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
                                        onClick={() => handleTabChange(tab.id)}
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
                                    {can('developer', 'create') && (
                                        <a
                                            href="/admin/real-estate/developers/create"
                                            className="flex items-center rounded-lg bg-orange-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-orange-600"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Developer
                                        </a>
                                    )}
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
                                                                {can('developer', 'update') && (
                                                                    <a
                                                                        href={`/admin/real-estate/developers/${developer.id}/edit`}
                                                                        className="flex items-center text-orange-600 transition-colors hover:text-orange-800"
                                                                    >
                                                                        <Edit className="mr-1 h-4 w-4" />
                                                                        Edit
                                                                    </a>
                                                                )}
                                                                {can('developer', 'delete') && (
                                                                    <button
                                                                        onClick={() => handleDeleteDeveloper(developer.id)}
                                                                        className="flex items-center text-red-600 transition-colors hover:text-red-800"
                                                                    >
                                                                        <Trash2 className="mr-1 h-4 w-4" />
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                        <Building className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                                        <p className="mb-2 text-lg font-medium text-gray-600">No developers found</p>
                                                        <a
                                                            href="/admin/real-estate/developers/create"
                                                            className="font-medium text-orange-600 transition-colors hover:text-orange-800"
                                                        >
                                                            Add your first developer
                                                        </a>
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
                                    {can('realestate-project', 'create') && (
                                        <a
                                            href="/admin/real-estate/projects/create"
                                            className="flex items-center rounded-lg bg-orange-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-orange-600"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Project
                                        </a>
                                    )}
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
                                                                {can('realestate-project', 'update') && (
                                                                    <a
                                                                        href={`/admin/real-estate/projects/${project.id}/edit`}
                                                                        className="flex items-center text-orange-600 transition-colors hover:text-orange-800"
                                                                    >
                                                                        <Edit className="mr-1 h-4 w-4" />
                                                                        Edit
                                                                    </a>
                                                                )}
                                                                {can('realestate-project', 'delete') && (
                                                                    <button
                                                                        onClick={() => handleDeleteProject(project.id)}
                                                                        className="flex items-center text-red-600 transition-colors hover:text-red-800"
                                                                    >
                                                                        <Trash2 className="mr-1 h-4 w-4" />
                                                                        Delete
                                                                    </button>
                                                                )}
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
                                    {can('property', 'create') && (
                                        <a
                                            href="/admin/real-estate/properties/create"
                                            className="flex items-center rounded-lg bg-orange-500 px-4 py-2 text-white shadow-sm transition-colors hover:bg-orange-600"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Property
                                        </a>
                                    )}
                                </div>

                                {/* Properties Table */}
                                <div className="overflow-hidden rounded-lg bg-white shadow">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Property
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Project
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {properties.length > 0 ? (
                                                properties.map((property) => (
                                                    <tr key={property.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                                                                    <Home className="h-6 w-6 text-orange-600" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{property.title}</div>
                                                                    {property.unit_number && (
                                                                        <div className="text-sm text-gray-500">Unit: {property.unit_number}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{property.project?.name || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {property.property_type.charAt(0).toUpperCase() +
                                                                    property.property_type.slice(1).replace('-', ' ')}
                                                            </div>
                                                            {property.bedrooms !== undefined && (
                                                                <div className="text-sm text-gray-500">
                                                                    {property.bedrooms} bed, {property.bathrooms || 0} bath
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                    property.listing_status === 'available'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : property.listing_status === 'reserved'
                                                                          ? 'bg-yellow-100 text-yellow-800'
                                                                          : property.listing_status === 'sold'
                                                                            ? 'bg-gray-100 text-gray-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {property.listing_status.charAt(0).toUpperCase() +
                                                                    property.listing_status.slice(1).replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                            <div className="flex items-center space-x-3">
                                                                {can('property', 'update') && (
                                                                    <a
                                                                        href={`/admin/real-estate/properties/${property.id}/edit`}
                                                                        className="flex items-center text-orange-600 transition-colors hover:text-orange-800"
                                                                    >
                                                                        <Edit className="mr-1 h-4 w-4" />
                                                                        Edit
                                                                    </a>
                                                                )}
                                                                {can('property', 'delete') && (
                                                                    <button
                                                                        onClick={() => handleDeleteProperty(property.id)}
                                                                        className="flex items-center text-red-600 transition-colors hover:text-red-800"
                                                                    >
                                                                        <Trash2 className="mr-1 h-4 w-4" />
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                        <Home className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                                        <p className="mb-2 text-lg font-medium text-gray-600">No properties found</p>
                                                        {can('property', 'create') && (
                                                            <a
                                                                href="/admin/real-estate/properties/create"
                                                                className="font-medium text-orange-600 transition-colors hover:text-orange-800"
                                                            >
                                                                Add your first property
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
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
            </div>
        </AdminLayout>
    );
}
