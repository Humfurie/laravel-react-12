import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React from 'react';

interface Props {
    availableModels: Record<string, string>;
}

export default function Create({ availableModels }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        model_classes: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/taxonomies');
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Taxonomy</h1>
                        <p className="text-muted-foreground">Add a new taxonomy to your system</p>
                    </div>
                    <Link href="/admin/taxonomies">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Taxonomies
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Taxonomy Details</CardTitle>
                        <CardDescription>Enter the information for your new taxonomy</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Blog Categories"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                <p className="text-muted-foreground text-sm">The slug will be automatically generated from the name</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Optional description for this taxonomy"
                                    rows={4}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>

                            <div className="space-y-3 rounded-lg border p-4">
                                <div>
                                    <Label className="text-base">Bind to Models (Optional)</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Select which models this taxonomy is available for. Leave empty to make it available for all models.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(availableModels).map(([modelClass, displayName]) => {
                                        const isChecked = data.model_classes.includes(modelClass);
                                        return (
                                            <div key={modelClass} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`model-${modelClass}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setData('model_classes', [...data.model_classes, modelClass]);
                                                        } else {
                                                            setData(
                                                                'model_classes',
                                                                data.model_classes.filter((c) => c !== modelClass),
                                                            );
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`model-${modelClass}`}
                                                    className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {displayName}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.model_classes && <p className="text-sm text-red-500">{errors.model_classes}</p>}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href="/admin/taxonomies">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Taxonomy'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
