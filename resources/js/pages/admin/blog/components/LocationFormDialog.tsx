import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPicker } from '@/components/map';
import { ImageIcon, Plus, Trash2, Star } from 'lucide-react';
import type { BlogLocation, LocationImage } from '@/types';

interface LocationFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: BlogLocation | null;
    blogSlug: string;
    onSubmit: (data: {
        title: string;
        description: string;
        address: string;
        latitude: number;
        longitude: number;
    }) => Promise<void>;
    isSubmitting: boolean;
    onLocationsChange: (locations: BlogLocation[]) => void;
    locations: BlogLocation[];
}

export function LocationFormDialog({
    open,
    onOpenChange,
    location,
    blogSlug,
    onSubmit,
    isSubmitting,
    onLocationsChange,
    locations,
}: LocationFormDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [images, setImages] = useState<LocationImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form when dialog opens/closes or location changes
    useEffect(() => {
        if (open) {
            if (location) {
                setTitle(location.title);
                setDescription(location.description || '');
                setAddress(location.address || '');
                setLatitude(location.latitude);
                setLongitude(location.longitude);
                setImages(location.images || []);
            } else {
                setTitle('');
                setDescription('');
                setAddress('');
                setLatitude(null);
                setLongitude(null);
                setImages([]);
            }
        }
    }, [open, location]);

    const handleMapClick = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || latitude === null || longitude === null) return;

        await onSubmit({
            title: title.trim(),
            description: description.trim(),
            address: address.trim(),
            latitude,
            longitude,
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length || !location) return;

        setIsUploading(true);

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(
                    route('blogs.locations.images.upload', [blogSlug, location.id]),
                    {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN':
                                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: formData,
                    }
                );

                const result = await response.json();
                if (result.success) {
                    setImages((prev) => [...prev, result.image]);
                    // Update parent locations
                    onLocationsChange(
                        locations.map((loc) =>
                            loc.id === location.id
                                ? { ...loc, images: [...loc.images, result.image] }
                                : loc
                        )
                    );
                }
            } catch (error) {
                console.error('Failed to upload image:', error);
            }
        }

        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = async (image: LocationImage) => {
        if (!location) return;

        try {
            const response = await fetch(
                route('blogs.locations.images.delete', [blogSlug, location.id, image.id]),
                {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN':
                            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                }
            );

            if (response.ok) {
                const newImages = images.filter((img) => img.id !== image.id);
                setImages(newImages);
                onLocationsChange(
                    locations.map((loc) =>
                        loc.id === location.id ? { ...loc, images: newImages } : loc
                    )
                );
            }
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    };

    const handleSetPrimary = async (image: LocationImage) => {
        if (!location) return;

        try {
            const response = await fetch(
                route('blogs.locations.images.primary', [blogSlug, location.id, image.id]),
                {
                    method: 'PATCH',
                    headers: {
                        'X-CSRF-TOKEN':
                            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                }
            );

            if (response.ok) {
                const newImages = images.map((img) => ({
                    ...img,
                    is_primary: img.id === image.id,
                }));
                setImages(newImages);
                onLocationsChange(
                    locations.map((loc) =>
                        loc.id === location.id
                            ? {
                                  ...loc,
                                  images: newImages,
                                  primary_image_url: image.url,
                              }
                            : loc
                    )
                );
            }
        } catch (error) {
            console.error('Failed to set primary image:', error);
        }
    };

    const isValid = title.trim() && latitude !== null && longitude !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{location ? 'Edit Location' : 'Add Location'}</DialogTitle>
                    <DialogDescription>
                        Click on the map to place a pin, then fill in the details.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Map Picker */}
                    <div className="space-y-2">
                        <Label>Location (click to place pin) *</Label>
                        <MapPicker
                            latitude={latitude}
                            longitude={longitude}
                            onChange={handleMapClick}
                            height="250px"
                        />
                        {latitude !== null && longitude !== null && (
                            <p className="text-xs text-gray-500">
                                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="location-title">Title *</Label>
                        <Input
                            id="location-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Tokyo Tower"
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="location-address">Address</Label>
                        <Input
                            id="location-address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="e.g., 4 Chome-2-8 Shibakoen, Minato City, Tokyo"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="location-description">Description</Label>
                        <Textarea
                            id="location-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell the story of this place..."
                            rows={3}
                        />
                    </div>

                    {/* Image Gallery (only shown when editing) */}
                    {location && (
                        <div className="space-y-2">
                            <Label>Photos</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((image) => (
                                    <div key={image.id} className="relative group">
                                        <img
                                            src={image.url}
                                            alt=""
                                            className={`h-20 w-full rounded-lg object-cover ${
                                                image.is_primary ? 'ring-2 ring-orange-500' : ''
                                            }`}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleSetPrimary(image)}
                                                className={`p-1 rounded ${
                                                    image.is_primary
                                                        ? 'text-orange-400'
                                                        : 'text-white hover:text-orange-400'
                                                }`}
                                                title="Set as primary"
                                            >
                                                <Star className="h-4 w-4" fill={image.is_primary ? 'currentColor' : 'none'} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteImage(image)}
                                                className="p-1 rounded text-white hover:text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {image.is_primary && (
                                            <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 rounded">
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Upload button */}
                                <label className="h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    {isUploading ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full" />
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5 text-gray-400" />
                                            <span className="text-xs text-gray-400 mt-1">Add</span>
                                        </>
                                    )}
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">
                                Upload photos for this location. The primary photo will be shown in the map popup.
                            </p>
                        </div>
                    )}

                    {!location && (
                        <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <ImageIcon className="inline h-4 w-4 mr-1" />
                            Save this location first, then you can add photos.
                        </p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isValid || isSubmitting}>
                            {isSubmitting ? 'Saving...' : location ? 'Update' : 'Add Location'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
