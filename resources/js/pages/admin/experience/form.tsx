import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, GripVertical, Plus, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface Experience {
    id?: number;
    company: string;
    image_url: string | null;
    location: string;
    description: string[];
    position: string;
    start_month: number;
    start_year: number;
    end_month: number | null;
    end_year: number | null;
    is_current_position: boolean;
    display_order: number;
}

interface Props {
    experience?: Experience;
}

type ExperienceFormData = {
    position: string;
    company: string;
    location: string;
    description: string[];
    start_month: number;
    start_year: number;
    end_month: number | null;
    end_year: number | null;
    is_current_position: boolean;
    display_order: number;
    image: File | null;
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Sortable Description Item Component
function SortableDescriptionItem({ id, description, onRemove }: { id: string; description: string; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-muted/50 flex items-start gap-2 rounded-lg border p-3">
            <button
                type="button"
                className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4" />
            </button>
            <span className="flex-1 text-sm">{description}</span>
            <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-800">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export default function ExperienceForm({ experience }: Props) {
    const isEditing = !!experience;
    const [descriptionInput, setDescriptionInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(experience?.image_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const { data, setData, processing, errors } = useForm<ExperienceFormData>({
        position: experience?.position || '',
        company: experience?.company || '',
        location: experience?.location || '',
        description: experience?.description || [],
        start_month: experience?.start_month ?? 0,
        start_year: experience?.start_year || currentYear,
        end_month: experience?.end_month ?? null,
        end_year: experience?.end_year ?? null,
        is_current_position: experience?.is_current_position ?? false,
        display_order: experience?.display_order ?? 0,
        image: null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            position: data.position,
            company: data.company,
            location: data.location,
            description: data.description,
            start_month: data.start_month,
            start_year: data.start_year,
            end_month: data.end_month,
            end_year: data.end_year,
            is_current_position: data.is_current_position,
            display_order: data.display_order,
            image: data.image,
        };

        if (isEditing) {
            // For updates, use router.post with _method: 'PUT'
            router.post(
                route('experiences.update', experience.id),
                {
                    ...formData,
                    _method: 'PUT',
                },
                {
                    forceFormData: true,
                },
            );
        } else {
            // For creates, use router.post
            router.post(route('experiences.store'), formData, {
                forceFormData: true,
            });
        }
    };

    const addDescription = () => {
        if (descriptionInput.trim() && !data.description.includes(descriptionInput.trim())) {
            setData('description', [...data.description, descriptionInput.trim()]);
            setDescriptionInput('');
        }
    };

    const removeDescription = (index: number) => {
        setData(
            'description',
            data.description.filter((_, i) => i !== index),
        );
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = data.description.indexOf(active.id as string);
            const newIndex = data.description.indexOf(over.id as string);

            if (oldIndex !== -1 && newIndex !== -1) {
                setData('description', arrayMove(data.description, oldIndex, newIndex));
            }
        }
    };

    const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addDescription();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AdminLayout>
            <Head title={isEditing ? 'Edit Experience' : 'Create Experience'} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('experiences.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Experiences
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit' : 'Add New'} Experience</h1>
                        <p className="text-muted-foreground">Fill in the details about your work experience</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Experience Details</CardTitle>
                                <CardDescription>Basic information about the position</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position Title *</Label>
                                    <Input
                                        id="position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="e.g., Senior Software Engineer"
                                        className={errors.position ? 'border-red-500' : ''}
                                    />
                                    {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name *</Label>
                                    <Input
                                        id="company"
                                        value={data.company}
                                        onChange={(e) => setData('company', e.target.value)}
                                        placeholder="e.g., Tech Company Inc"
                                        className={errors.company ? 'border-red-500' : ''}
                                    />
                                    {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="e.g., San Francisco, CA"
                                        className={errors.location ? 'border-red-500' : ''}
                                    />
                                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Responsibilities & Achievements</Label>
                                    <div className="flex gap-2">
                                        <Textarea
                                            id="description"
                                            value={descriptionInput}
                                            onChange={(e) => setDescriptionInput(e.target.value)}
                                            onKeyDown={handleDescriptionKeyDown}
                                            placeholder="Enter a responsibility or achievement and press Enter"
                                            rows={2}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addDescription}
                                            disabled={!descriptionInput.trim()}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                    <div className="mt-2 space-y-2">
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={data.description} strategy={verticalListSortingStrategy}>
                                                {data.description.map((desc, index) => (
                                                    <SortableDescriptionItem
                                                        key={desc}
                                                        id={desc}
                                                        description={desc}
                                                        onRemove={() => removeDescription(index)}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                    <p className="text-muted-foreground text-xs">
                                        <GripVertical className="mr-1 inline h-3 w-3" />
                                        Drag to reorder • Add bullet points highlighting key responsibilities and achievements
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Duration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Month</Label>
                                        <Select value={String(data.start_month)} onValueChange={(value) => setData('start_month', parseInt(value))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month, index) => (
                                                    <SelectItem key={index} value={String(index)}>
                                                        {month}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Start Year</Label>
                                        <Select value={String(data.start_year)} onValueChange={(value) => setData('start_year', parseInt(value))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem key={year} value={String(year)}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="is_current" className="text-sm font-medium">
                                        Current Position
                                    </Label>
                                    <Switch
                                        id="is_current"
                                        checked={data.is_current_position}
                                        onCheckedChange={(checked) => {
                                            setData('is_current_position', checked);
                                            if (checked) {
                                                setData('end_month', null);
                                                setData('end_year', null);
                                            }
                                        }}
                                    />
                                </div>

                                {!data.is_current_position && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>End Month</Label>
                                            <Select
                                                value={data.end_month !== null ? String(data.end_month) : '0'}
                                                onValueChange={(value) => setData('end_month', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((month, index) => (
                                                        <SelectItem key={index} value={String(index)}>
                                                            {month}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Year</Label>
                                            <Select
                                                value={data.end_year !== null ? String(data.end_year) : String(currentYear)}
                                                onValueChange={(value) => setData('end_year', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year} value={String(year)}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="display_order">Display Order</Label>
                                    <Input
                                        id="display_order"
                                        type="number"
                                        value={data.display_order}
                                        onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                    <p className="text-muted-foreground text-xs">Lower numbers appear first</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Company Logo</Label>

                                    {imagePreview && (
                                        <div className="relative mb-4">
                                            <img src={imagePreview} alt="Company logo preview" className="h-32 w-32 rounded-lg border object-cover" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={clearImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}

                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Logo
                                    </Button>

                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" disabled={processing} className="w-full">
                            {isEditing ? 'Update' : 'Create'} Experience
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
