import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React from 'react';

interface Taxonomy {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    taxonomies: Taxonomy[];
    selectedTaxonomyId?: number;
}

export default function Create({ taxonomies, selectedTaxonomyId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        taxonomy_id: selectedTaxonomyId?.toString() || '',
        name: '',
        description: '',
        order: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/taxonomy-terms');
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Taxonomy Term</h1>
                        <p className="text-muted-foreground">Add a new term to a taxonomy</p>
                    </div>
                    <Link href={`/admin/taxonomy-terms${selectedTaxonomyId ? `?taxonomy_id=${selectedTaxonomyId}` : ''}`}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Terms
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Term Details</CardTitle>
                        <CardDescription>Enter the information for your new taxonomy term</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="taxonomy_id">
                                    Taxonomy <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.taxonomy_id} onValueChange={(value) => setData('taxonomy_id', value)}>
                                    <SelectTrigger className={errors.taxonomy_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select a taxonomy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taxonomies.map((taxonomy) => (
                                            <SelectItem key={taxonomy.id} value={taxonomy.id.toString()}>
                                                {taxonomy.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.taxonomy_id && <p className="text-sm text-red-500">{errors.taxonomy_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Political"
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
                                    placeholder="Optional description for this term"
                                    rows={4}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className={errors.order ? 'border-red-500' : ''}
                                />
                                {errors.order && <p className="text-sm text-red-500">{errors.order}</p>}
                                <p className="text-muted-foreground text-sm">Used to sort terms (lower numbers appear first)</p>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href={`/admin/taxonomy-terms${selectedTaxonomyId ? `?taxonomy_id=${selectedTaxonomyId}` : ''}`}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Term'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
