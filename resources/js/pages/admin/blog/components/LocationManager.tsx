import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, MapPin, Pencil, Plus, Trash2, ImageIcon } from 'lucide-react';
import { TravelMap } from '@/components/map';
import type { BlogLocation } from '@/types';
import { LocationFormDialog } from './LocationFormDialog';

interface LocationManagerProps {
    blogId: number;
    blogSlug: string;
    locations: BlogLocation[];
    onLocationsChange: (locations: BlogLocation[]) => void;
}

interface SortableLocationItemProps {
    location: BlogLocation;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

function SortableLocationItem({ location, index, onEdit, onDelete }: SortableLocationItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: location.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 rounded-lg border bg-white dark:bg-gray-900 p-3"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold flex-shrink-0">
                {index + 1}
            </div>

            {location.primary_image_url ? (
                <img
                    src={location.primary_image_url}
                    alt={location.title}
                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                />
            ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{location.title}</h4>
                {location.address && (
                    <p className="text-xs text-gray-500 truncate">{location.address}</p>
                )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export function LocationManager({ blogId, blogSlug, locations, onLocationsChange }: LocationManagerProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<BlogLocation | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = locations.findIndex((loc) => loc.id === active.id);
            const newIndex = locations.findIndex((loc) => loc.id === over.id);

            const newLocations = arrayMove(locations, oldIndex, newIndex).map((loc, idx) => ({
                ...loc,
                order: idx,
            }));

            onLocationsChange(newLocations);

            // Persist reorder to server
            try {
                await fetch(route('blogs.locations.reorder', blogSlug), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        locations: newLocations.map((loc) => ({ id: loc.id, order: loc.order })),
                    }),
                });
            } catch (error) {
                console.error('Failed to reorder locations:', error);
            }
        }
    };

    const handleAddLocation = () => {
        setEditingLocation(null);
        setIsFormOpen(true);
    };

    const handleEditLocation = (location: BlogLocation) => {
        setEditingLocation(location);
        setIsFormOpen(true);
    };

    const handleDeleteLocation = async (location: BlogLocation) => {
        if (!confirm(`Are you sure you want to delete "${location.title}"?`)) return;

        try {
            const response = await fetch(route('blogs.locations.destroy', [blogSlug, location.id]), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                onLocationsChange(locations.filter((loc) => loc.id !== location.id));
            }
        } catch (error) {
            console.error('Failed to delete location:', error);
        }
    };

    const handleFormSubmit = async (data: {
        title: string;
        description: string;
        address: string;
        latitude: number;
        longitude: number;
    }) => {
        setIsSubmitting(true);

        try {
            const url = editingLocation
                ? route('blogs.locations.update', [blogSlug, editingLocation.id])
                : route('blogs.locations.store', blogSlug);

            const response = await fetch(url, {
                method: editingLocation ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                if (editingLocation) {
                    onLocationsChange(
                        locations.map((loc) =>
                            loc.id === editingLocation.id ? result.location : loc
                        )
                    );
                } else {
                    onLocationsChange([...locations, result.location]);
                }
                setIsFormOpen(false);
                setEditingLocation(null);
            }
        } catch (error) {
            console.error('Failed to save location:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Travel Locations
                </CardTitle>
                <CardDescription>
                    Add location pins for travel blog posts. Click on the map to place pins with photos and descriptions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Map Preview */}
                {locations.length > 0 && (
                    <div className="rounded-lg overflow-hidden border">
                        <TravelMap locations={locations} height="250px" interactive={true} showRoute={true} />
                    </div>
                )}

                {/* Location List */}
                {locations.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={locations.map((loc) => loc.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {locations.map((location, index) => (
                                    <SortableLocationItem
                                        key={location.id}
                                        location={location}
                                        index={index}
                                        onEdit={() => handleEditLocation(location)}
                                        onDelete={() => handleDeleteLocation(location)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No locations yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Add travel locations to show a map on your blog post.
                        </p>
                    </div>
                )}

                {/* Add Button */}
                <Button onClick={handleAddLocation} className="w-full" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                </Button>

                {/* Form Dialog */}
                <LocationFormDialog
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    location={editingLocation}
                    blogSlug={blogSlug}
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmitting}
                    onLocationsChange={onLocationsChange}
                    locations={locations}
                />
            </CardContent>
        </Card>
    );
}
