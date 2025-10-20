import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { GripVertical, Home, Save, Star, Trash2, Upload, X } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

interface Image {
    id: number;
    url: string;
    name: string;
    is_primary: boolean;
    order: number;
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
    reservation_fee?: number;
    total_contract_price: number;
    net_selling_price?: number;
    currency: string;
    downpayment_percentage?: number;
    downpayment_amount?: number;
    equity_terms_months?: number;
    monthly_equity?: number;
}

interface Property {
    id: number;
    title: string;
    project_id?: number;
    description?: string;
    unit_number?: string;
    floor_level?: number;
    building_phase?: string;
    property_type: string;
    floor_area?: number;
    floor_area_unit: string;
    balcony_area?: number;
    bedrooms?: number;
    bathrooms?: number;
    parking_spaces?: number;
    orientation?: string;
    view_type?: string;
    listing_status: string;
    floor_plan_url?: string;
    featured: boolean;
    project?: Project;
    pricing?: Pricing;
    images: Image[];
}

interface PropertyFormProps {
    property: Property | null;
    projects: Project[];
}

export default function PropertyForm({ property, projects }: PropertyFormProps) {
    const isEditing = property !== null;
    const [uploading, setUploading] = useState(false);
    const [draggedImage, setDraggedImage] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Real Estate',
            href: '/admin/real-estate',
        },
        {
            title: 'Properties',
            href: '/admin/real-estate/properties',
        },
        {
            title: isEditing ? 'Edit Property' : 'Create Property',
            href: '#',
        },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        project_id: property?.project_id?.toString() || '',
        title: property?.title || '',
        description: property?.description || '',
        unit_number: property?.unit_number || '',
        floor_level: property?.floor_level?.toString() || '',
        building_phase: property?.building_phase || '',
        property_type: property?.property_type || 'studio',
        floor_area: property?.floor_area?.toString() || '',
        floor_area_unit: property?.floor_area_unit || 'sqm',
        balcony_area: property?.balcony_area?.toString() || '',
        bedrooms: property?.bedrooms?.toString() || '0',
        bathrooms: property?.bathrooms?.toString() || '0',
        parking_spaces: property?.parking_spaces?.toString() || '0',
        orientation: property?.orientation || '',
        view_type: property?.view_type || '',
        listing_status: property?.listing_status || 'available',
        floor_plan_url: property?.floor_plan_url || '',
        featured: property?.featured || false,
        // Pricing data
        pricing: {
            reservation_fee: property?.pricing?.reservation_fee?.toString() || '',
            total_contract_price: property?.pricing?.total_contract_price?.toString() || '',
            net_selling_price: property?.pricing?.net_selling_price?.toString() || '',
            currency: property?.pricing?.currency || 'PHP',
            downpayment_percentage: property?.pricing?.downpayment_percentage?.toString() || '',
            downpayment_amount: property?.pricing?.downpayment_amount?.toString() || '',
            equity_terms_months: property?.pricing?.equity_terms_months?.toString() || '',
            monthly_equity: property?.pricing?.monthly_equity?.toString() || '',
        },
    });

    const [images, setImages] = useState<Image[]>(property?.images || []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/real-estate/properties/${property.id}`, {
                onSuccess: () => router.visit('/admin/real-estate/properties'),
            });
        } else {
            post('/admin/real-estate/properties', {
                onSuccess: () => router.visit('/admin/real-estate/properties'),
            });
        }
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !property) return;

        setUploading(true);
        const formData = new FormData();

        Array.from(files).forEach((file) => {
            formData.append('images[]', file);
        });

        try {
            const response = await fetch(`/api/v1/properties/${property.id}/images`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setImages([...images, ...result.data]);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleSetPrimary = async (imageId: number) => {
        if (!property) return;

        try {
            const response = await fetch(`/api/v1/properties/${property.id}/images/${imageId}/primary`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setImages(
                        images.map((img) => ({
                            ...img,
                            is_primary: img.id === imageId,
                        })),
                    );
                }
            }
        } catch (error) {
            console.error('Set primary error:', error);
            alert('Failed to set primary image');
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!property || !confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await fetch(`/api/v1/properties/${property.id}/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setImages(images.filter((img) => img.id !== imageId));
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete image');
        }
    };

    const handleDragStart = (imageId: number) => {
        setDraggedImage(imageId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (targetId: number) => {
        if (!property || draggedImage === null || draggedImage === targetId) return;

        const draggedIndex = images.findIndex((img) => img.id === draggedImage);
        const targetIndex = images.findIndex((img) => img.id === targetId);

        const newImages = [...images];
        const [removed] = newImages.splice(draggedIndex, 1);
        newImages.splice(targetIndex, 0, removed);

        const reorderedImages = newImages.map((img, index) => ({
            id: img.id,
            order: index,
        }));

        setImages(newImages.map((img, index) => ({ ...img, order: index })));
        setDraggedImage(null);

        try {
            await fetch(`/api/v1/properties/${property.id}/images/reorder`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ images: reorderedImages }),
            });
        } catch (error) {
            console.error('Reorder error:', error);
            alert('Failed to reorder images');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Property' : 'Create Property'} />
            <div className="flex h-full flex-1 flex-col gap-6 bg-gray-50/50 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-2xl font-bold text-gray-900">
                            <Home className="mr-3 h-7 w-7 text-orange-500" />
                            {isEditing ? 'Edit Property' : 'Create Property'}
                        </h1>
                        <p className="mt-1 text-gray-600">{isEditing ? 'Update property details and images' : 'Add a new property to the system'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Essential property details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Property Title *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g., Luxurious 2BR Condo with Sea View"
                                        required
                                    />
                                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="project_id">Project</Label>
                                    <Select value={data.project_id} onValueChange={(value) => setData('project_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">No Project</SelectItem>
                                            {projects.map((project) => (
                                                <SelectItem key={project.id} value={project.id.toString()}>
                                                    {project.name} - {project.city} ({project.developer.company_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_number">Unit Number</Label>
                                    <Input
                                        id="unit_number"
                                        value={data.unit_number}
                                        onChange={(e) => setData('unit_number', e.target.value)}
                                        placeholder="e.g., 12-A"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="floor_level">Floor Level</Label>
                                    <Input
                                        id="floor_level"
                                        type="number"
                                        value={data.floor_level}
                                        onChange={(e) => setData('floor_level', e.target.value)}
                                        placeholder="e.g., 15"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Detailed description of the property..."
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Property Specifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Property Specifications</CardTitle>
                            <CardDescription>Size, type, and features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="property_type">Property Type *</Label>
                                    <Select value={data.property_type} onValueChange={(value) => setData('property_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="studio">Studio</SelectItem>
                                            <SelectItem value="1br">1 Bedroom</SelectItem>
                                            <SelectItem value="2br">2 Bedrooms</SelectItem>
                                            <SelectItem value="3br">3 Bedrooms</SelectItem>
                                            <SelectItem value="penthouse">Penthouse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bedrooms">Bedrooms</Label>
                                    <Input
                                        id="bedrooms"
                                        type="number"
                                        value={data.bedrooms}
                                        onChange={(e) => setData('bedrooms', e.target.value)}
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bathrooms">Bathrooms</Label>
                                    <Input
                                        id="bathrooms"
                                        type="number"
                                        step="0.5"
                                        value={data.bathrooms}
                                        onChange={(e) => setData('bathrooms', e.target.value)}
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="floor_area">Floor Area</Label>
                                    <Input
                                        id="floor_area"
                                        type="number"
                                        step="0.01"
                                        value={data.floor_area}
                                        onChange={(e) => setData('floor_area', e.target.value)}
                                        placeholder="e.g., 45.5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="floor_area_unit">Unit</Label>
                                    <Select value={data.floor_area_unit} onValueChange={(value) => setData('floor_area_unit', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sqm">sqm</SelectItem>
                                            <SelectItem value="sqft">sqft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="parking_spaces">Parking Spaces</Label>
                                    <Input
                                        id="parking_spaces"
                                        type="number"
                                        value={data.parking_spaces}
                                        onChange={(e) => setData('parking_spaces', e.target.value)}
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="orientation">Orientation</Label>
                                    <Select value={data.orientation} onValueChange={(value) => setData('orientation', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select orientation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Not specified</SelectItem>
                                            <SelectItem value="north">North</SelectItem>
                                            <SelectItem value="south">South</SelectItem>
                                            <SelectItem value="east">East</SelectItem>
                                            <SelectItem value="west">West</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="view_type">View Type</Label>
                                    <Input
                                        id="view_type"
                                        value={data.view_type}
                                        onChange={(e) => setData('view_type', e.target.value)}
                                        placeholder="e.g., Sea View, City View"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="listing_status">Listing Status *</Label>
                                    <Select value={data.listing_status} onValueChange={(value) => setData('listing_status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="reserved">Reserved</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                            <SelectItem value="not_available">Not Available</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch id="featured" checked={data.featured} onCheckedChange={(checked) => setData('featured', checked)} />
                                <Label htmlFor="featured">Mark as Featured Property</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Information</CardTitle>
                            <CardDescription>Property pricing and payment details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="total_contract_price">Total Contract Price *</Label>
                                    <Input
                                        id="total_contract_price"
                                        type="number"
                                        step="0.01"
                                        value={data.pricing.total_contract_price}
                                        onChange={(e) => setData('pricing', { ...data.pricing, total_contract_price: e.target.value })}
                                        placeholder="e.g., 5500000"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select
                                        value={data.pricing.currency}
                                        onValueChange={(value) => setData('pricing', { ...data.pricing, currency: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PHP">PHP</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reservation_fee">Reservation Fee</Label>
                                    <Input
                                        id="reservation_fee"
                                        type="number"
                                        step="0.01"
                                        value={data.pricing.reservation_fee}
                                        onChange={(e) => setData('pricing', { ...data.pricing, reservation_fee: e.target.value })}
                                        placeholder="e.g., 50000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="downpayment_percentage">Downpayment %</Label>
                                    <Input
                                        id="downpayment_percentage"
                                        type="number"
                                        step="0.01"
                                        value={data.pricing.downpayment_percentage}
                                        onChange={(e) => setData('pricing', { ...data.pricing, downpayment_percentage: e.target.value })}
                                        placeholder="e.g., 20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="equity_terms_months">Equity Terms (months)</Label>
                                    <Input
                                        id="equity_terms_months"
                                        type="number"
                                        value={data.pricing.equity_terms_months}
                                        onChange={(e) => setData('pricing', { ...data.pricing, equity_terms_months: e.target.value })}
                                        placeholder="e.g., 24"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="monthly_equity">Monthly Equity</Label>
                                    <Input
                                        id="monthly_equity"
                                        type="number"
                                        step="0.01"
                                        value={data.pricing.monthly_equity}
                                        onChange={(e) => setData('pricing', { ...data.pricing, monthly_equity: e.target.value })}
                                        placeholder="e.g., 45000"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Image Gallery */}
                    {isEditing && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Property Images</CardTitle>
                                <CardDescription>Upload and manage property images. Drag to reorder, click star to set primary.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e.target.files)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {uploading ? 'Uploading...' : 'Upload Images'}
                                    </Button>
                                </div>

                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                                        {images.map((image) => (
                                            <div
                                                key={image.id}
                                                draggable
                                                onDragStart={() => handleDragStart(image.id)}
                                                onDragOver={handleDragOver}
                                                onDrop={() => handleDrop(image.id)}
                                                className="group relative cursor-move rounded-lg border-2 border-gray-200 p-2 transition-all hover:border-orange-500"
                                            >
                                                <div className="absolute top-2 left-2 z-10">
                                                    <GripVertical className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                                </div>
                                                <img src={image.thumbnails.medium} alt={image.name} className="h-32 w-full rounded object-cover" />
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={image.is_primary ? 'default' : 'secondary'}
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => handleSetPrimary(image.id)}
                                                    >
                                                        <Star className={`h-3 w-3 ${image.is_primary ? 'fill-current' : ''}`} />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => handleDeleteImage(image.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                {image.is_primary && <Badge className="absolute bottom-2 left-2 bg-orange-500">Primary</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {images.length === 0 && (
                                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
                                        <Upload className="mb-4 h-12 w-12 text-gray-400" />
                                        <p className="mb-2 text-sm font-medium text-gray-700">No images uploaded</p>
                                        <p className="text-xs text-gray-500">Click the button above to upload images</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit('/admin/real-estate/properties')}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-orange-500 hover:bg-orange-600">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
