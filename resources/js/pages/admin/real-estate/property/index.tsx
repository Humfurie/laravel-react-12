import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Home, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Real Estate',
        href: '/admin/real-estate',
    },
    {
        title: 'Properties',
        href: '/admin/real-estate/properties',
    },
];

interface Image {
    id: number;
    url: string;
    is_primary: boolean;
    thumbnails: {
        small: string;
        medium: string;
        large: string;
    };
}

interface Project {
    id: number;
    name: string;
    city: string;
    developer: {
        id: number;
        company_name: string;
    };
}

interface Pricing {
    id: number;
    total_contract_price: number;
    currency: string;
}

interface Property {
    id: number;
    title: string;
    slug: string;
    description?: string;
    unit_number?: string;
    floor_level?: number;
    property_type: string;
    floor_area?: number;
    floor_area_unit?: string;
    bedrooms?: number;
    bathrooms?: number;
    parking_spaces?: number;
    listing_status: string;
    featured: boolean;
    view_count: number;
    created_at: string;
    project?: Project;
    pricing?: Pricing;
    images: Image[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedProperties {
    data: Property[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface PropertyIndexProps {
    properties: PaginatedProperties;
}

export default function PropertyIndex({ properties }: PropertyIndexProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const handleSearch = () => {
        router.get(
            '/admin/real-estate/properties',
            {
                search,
                listing_status: statusFilter !== 'all' ? statusFilter : undefined,
                property_type: typeFilter !== 'all' ? typeFilter : undefined,
            },
            {
                preserveState: true,
            },
        );
    };

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Are you sure you want to delete property "${title}"?`)) {
            router.delete(`/admin/real-estate/properties/${id}`, {
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'reserved':
                return 'bg-yellow-100 text-yellow-800';
            case 'sold':
                return 'bg-gray-100 text-gray-800';
            case 'not_available':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatPrice = (pricing?: Pricing) => {
        if (!pricing) return 'No pricing';
        const currency = pricing.currency || 'PHP';
        const price = new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(pricing.total_contract_price);
        return `${currency} ${price}`;
    };

    const getPrimaryImage = (images: Image[]) => {
        const primary = images.find((img) => img.is_primary);
        return primary?.thumbnails?.small || images[0]?.thumbnails?.small || null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Properties Management" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-gray-50/50 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-2xl font-bold text-gray-900">
                            <Home className="mr-3 h-7 w-7 text-orange-500" />
                            Properties Management
                        </h1>
                        <p className="mt-1 text-gray-600">Manage property listings, images, and details</p>
                    </div>
                    <Link href="/admin/real-estate/properties/create">
                        <Button className="bg-orange-500 hover:bg-orange-600">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Property
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by title, unit number, or location..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                                <SelectItem value="not_available">Not Available</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="1br">1 Bedroom</SelectItem>
                                <SelectItem value="2br">2 Bedrooms</SelectItem>
                                <SelectItem value="3br">3 Bedrooms</SelectItem>
                                <SelectItem value="penthouse">Penthouse</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600">
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                    </div>
                </div>

                {/* Properties Table */}
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {properties.data.length > 0 ? (
                                    properties.data.map((property) => {
                                        const primaryImage = getPrimaryImage(property.images);
                                        return (
                                            <TableRow key={property.id}>
                                                <TableCell>
                                                    {primaryImage ? (
                                                        <img src={primaryImage} alt={property.title} className="h-16 w-16 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                                                            <Home className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <div className="font-medium text-gray-900">
                                                            {property.title}
                                                            {property.featured && (
                                                                <Badge variant="outline" className="ml-2 border-orange-500 text-orange-500">
                                                                    Featured
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {property.unit_number && (
                                                            <div className="text-sm text-gray-500">Unit: {property.unit_number}</div>
                                                        )}
                                                        <div className="mt-1 text-xs text-gray-400">
                                                            <Eye className="mr-1 inline h-3 w-3" />
                                                            {property.view_count} views
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {property.project ? (
                                                        <div className="flex flex-col">
                                                            <div className="font-medium text-gray-900">{property.project.name}</div>
                                                            <div className="text-sm text-gray-500">{property.project.city}</div>
                                                            <div className="text-xs text-gray-400">{property.project.developer.company_name}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No project</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{property.property_type.toUpperCase()}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        {property.floor_area && (
                                                            <div>
                                                                {property.floor_area} {property.floor_area_unit || 'sqm'}
                                                            </div>
                                                        )}
                                                        {property.bedrooms !== undefined && (
                                                            <div className="text-gray-500">
                                                                {property.bedrooms} bed, {property.bathrooms || 0} bath
                                                            </div>
                                                        )}
                                                        {property.floor_level && <div className="text-gray-400">Floor {property.floor_level}</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">{formatPrice(property.pricing)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(property.listing_status)}>
                                                        {property.listing_status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/admin/real-estate/properties/${property.id}/edit`}>
                                                            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDelete(property.id, property.title)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <Home className="mb-4 h-12 w-12 text-gray-300" />
                                                <p className="mb-2 text-lg font-medium text-gray-600">No properties found</p>
                                                <Link href="/admin/real-estate/properties/create">
                                                    <Button className="bg-orange-500 hover:bg-orange-600">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add your first property
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {properties.data.length > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                            <div className="text-sm text-gray-700">
                                Showing {properties.data.length} of {properties.total} properties
                            </div>
                            <div className="flex gap-2">
                                {properties.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={link.active ? 'bg-orange-500 hover:bg-orange-600' : ''}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
