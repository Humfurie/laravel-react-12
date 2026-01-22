import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface Category {
    name: string;
    slug: string;
}

interface Props {
    categories: Category[];
}

type ExpertiseFormData = {
    name: string;
    image: File | null;
    category_slug: string;
    order: number;
    is_active: boolean;
};

export default function Create({ categories }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, processing, errors } = useForm<ExpertiseFormData>({
        name: '',
        image: null,
        category_slug: categories[0]?.slug || '',
        order: 0,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(route('admin.expertises.store'), data, {
            forceFormData: true,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout>
            <Head title="Create Expertise" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('admin.expertises.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Expertise</h1>
                        <p className="text-muted-foreground mt-2">Add a new technical skill or expertise</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Expertise Details</CardTitle>
                            <CardDescription>Fill in the information about this expertise</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Laravel, React, Docker"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="image">
                                    Logo/Icon <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex items-center gap-4">
                                    {imagePreview && (
                                        <div className="flex-shrink-0">
                                            <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-lg border-2 object-contain p-2" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full sm:w-auto"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            {imagePreview ? 'Change Image' : 'Upload Image'}
                                        </Button>
                                        <p className="text-muted-foreground mt-2 text-sm">Recommended: 512x512px, PNG or WebP format</p>
                                    </div>
                                </div>
                                {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">
                                    Category <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.category_slug} onValueChange={(value) => setData('category_slug', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.slug} value={cat.slug}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_slug && <p className="text-sm text-red-500">{errors.category_slug}</p>}
                            </div>

                            {/* Order */}
                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    min="0"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                />
                                <p className="text-muted-foreground text-sm">Lower numbers appear first</p>
                                {errors.order && <p className="text-sm text-red-500">{errors.order}</p>}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Active Status</Label>
                                    <p className="text-muted-foreground text-sm">Display this expertise on the website</p>
                                </div>
                                <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-4">
                        <Link href={route('admin.expertises.index')}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Expertise'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
