// External packages
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Calendar, Upload } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Layouts
import AdminLayout from '@/layouts/AdminLayout';

// Constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_BACKGROUND_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES_COUNT = 20;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MIN_WINNERS = 1;
const MAX_WINNERS = 100;

export default function Create() {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        number_of_winners: 1,
        status: 'draft' as 'draft' | 'active' | 'ended',
        images: [] as File[],
        background_image: null as File | null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
    const [hasEndDate, setHasEndDate] = useState(false);
    const [uploadErrors, setUploadErrors] = useState<{
        images?: string;
        background?: string;
    }>({});

    // Clean up blob URLs when images change
    useEffect(() => {
        // Create new preview URLs
        const urls = data.images.map((file) => URL.createObjectURL(file));
        setImagePreviewUrls(urls);

        // Cleanup function to revoke URLs
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [data.images]);

    // Clean up blob URL when background image changes
    useEffect(() => {
        if (data.background_image) {
            const url = URL.createObjectURL(data.background_image);
            setBackgroundPreviewUrl(url);

            // Cleanup function to revoke URL
            return () => {
                URL.revokeObjectURL(url);
            };
        } else {
            setBackgroundPreviewUrl(null);
        }
    }, [data.background_image]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) {
            return;
        }

        // Clear previous errors
        setUploadErrors((prev) => ({ ...prev, images: undefined }));

        // Validate file types
        const invalidFiles = files.filter((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
        if (invalidFiles.length > 0) {
            setUploadErrors((prev) => ({
                ...prev,
                images: 'Please upload only image files (JPEG, PNG, GIF, or WebP)',
            }));
            return;
        }

        // Validate file sizes
        const oversizedFiles = files.filter((file) => file.size > MAX_IMAGE_SIZE);
        if (oversizedFiles.length > 0) {
            setUploadErrors((prev) => ({
                ...prev,
                images: `Some images exceed the 10MB size limit`,
            }));
            return;
        }

        // Validate total count
        if (data.images.length + files.length > MAX_IMAGES_COUNT) {
            setUploadErrors((prev) => ({
                ...prev,
                images: `Maximum ${MAX_IMAGES_COUNT} images allowed`,
            }));
            return;
        }

        setData('images', [...data.images, ...files]);
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        // Clear previous errors
        setUploadErrors((prev) => ({ ...prev, background: undefined }));

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setUploadErrors((prev) => ({
                ...prev,
                background: 'Please upload an image file (JPEG, PNG, GIF, or WebP)',
            }));
            return;
        }

        // Validate file size
        if (file.size > MAX_BACKGROUND_SIZE) {
            setUploadErrors((prev) => ({
                ...prev,
                background: 'Image size must be less than 10MB',
            }));
            return;
        }

        setData('background_image', file);
    };

    const removeImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        setData('images', newImages);
    };

    const removeBackgroundImage = () => {
        setData('background_image', null);
        if (backgroundInputRef.current) {
            backgroundInputRef.current.value = '';
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.giveaways.store'), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Create Giveaway" />

            <div className="container mx-auto max-w-4xl py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Create Giveaway</h1>
                    <p className="text-muted-foreground">Set up a new giveaway campaign</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Giveaway Title *</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter giveaway title..."
                                    className="mt-1"
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description / Criteria *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter the giveaway description and criteria for entering..."
                                    rows={6}
                                    className="mt-1"
                                />
                                <p className="text-muted-foreground mt-1 text-xs">Describe the prize and requirements to enter the giveaway</p>
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Prize Images Section */}
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">Prize Images</h2>
                        <p className="text-muted-foreground mb-4 text-sm">Upload images of the prize (optional, can be added after creation)</p>

                        <div className="space-y-4">
                            <div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Images
                                </Button>
                                {uploadErrors.images && <p className="text-destructive mt-1 text-sm">{uploadErrors.images}</p>}
                            </div>

                            {/* Preview uploaded images */}
                            {data.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {data.images.map((file, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={imagePreviewUrls[index]}
                                                alt={`Prize image preview ${index + 1}: ${file.name}`}
                                                className="aspect-square w-full rounded-lg object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => removeImage(index)}
                                            >
                                                ×
                                            </Button>
                                            <p className="text-muted-foreground mt-1 truncate text-xs">{file.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Background Image Section */}
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">Page Background Image</h2>
                        <p className="text-muted-foreground mb-4 text-sm">Upload a custom background image for the public giveaway page (optional)</p>

                        <div className="space-y-4">
                            <div>
                                <input ref={backgroundInputRef} type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
                                <Button type="button" variant="outline" onClick={() => backgroundInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Background Image
                                </Button>
                                {uploadErrors.background && <p className="text-destructive mt-1 text-sm">{uploadErrors.background}</p>}
                            </div>

                            {/* Preview background image */}
                            {data.background_image && backgroundPreviewUrl && (
                                <div className="relative max-w-md">
                                    <img
                                        src={backgroundPreviewUrl}
                                        alt="Background image preview for giveaway page"
                                        className="w-full rounded-lg object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={removeBackgroundImage}
                                    >
                                        Remove
                                    </Button>
                                    <p className="text-muted-foreground mt-1 text-xs">{data.background_image.name}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">Schedule</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="start_date">Start Date & Time *</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="start_date"
                                        type="datetime-local"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                    <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                                </div>
                                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                            </div>

                            <div>
                                <div className="mb-2 flex items-center space-x-3">
                                    <Checkbox
                                        id="has_end_date"
                                        checked={hasEndDate}
                                        onCheckedChange={(checked) => {
                                            const isChecked = checked as boolean;
                                            setHasEndDate(isChecked);
                                            if (!isChecked) {
                                                setData('end_date', '');
                                            }
                                        }}
                                    />
                                    <Label htmlFor="has_end_date" className="cursor-pointer">
                                        Set end date (uncheck for unlimited duration)
                                    </Label>
                                </div>
                                <Label htmlFor="end_date">End Date & Time</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="end_date"
                                        type="datetime-local"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        min={data.start_date}
                                        disabled={!hasEndDate}
                                    />
                                    <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {hasEndDate ? 'Must be after the start date' : 'Unlimited duration - giveaway ends only when winner is picked'}
                                </p>
                                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">Winners Configuration</h2>

                        <div>
                            <Label htmlFor="number_of_winners">Number of Winners *</Label>
                            <Input
                                id="number_of_winners"
                                type="number"
                                min={MIN_WINNERS}
                                max={MAX_WINNERS}
                                value={data.number_of_winners}
                                onChange={(e) => setData('number_of_winners', parseInt(e.target.value) || MIN_WINNERS)}
                                className="mt-1"
                            />
                            <p className="text-muted-foreground mt-1 text-xs">
                                How many winners will be selected from the entries ({MIN_WINNERS}-{MAX_WINNERS})
                            </p>
                            {errors.number_of_winners && <p className="mt-1 text-sm text-red-600">{errors.number_of_winners}</p>}
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">Status</h2>

                        <div>
                            <Label htmlFor="status">Giveaway Status *</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value as 'draft' | 'active' | 'ended')}>
                                <SelectTrigger id="status" className="mt-1">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="ended">Ended</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground mt-1 text-xs">Set to "Active" to allow public entries</p>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('admin.giveaways.index'))}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Giveaway'}
                        </Button>
                    </div>
                </form>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out duration-300"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out duration-300"
                    leaveTo="opacity-0"
                >
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Giveaway created successfully!</p>
                    </div>
                </Transition>
            </div>
        </AdminLayout>
    );
}
