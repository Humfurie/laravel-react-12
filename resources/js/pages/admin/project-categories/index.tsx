import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ProjectCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    projects_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    categories: ProjectCategory[];
}

export default function Index({ categories }: Props) {
    const { can } = usePermissions();
    const canCreate = can('project', 'create');
    const canUpdate = can('project', 'update');
    const canDelete = can('project', 'delete');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        description: '',
        sort_order: 0,
        is_active: true,
    });

    const openCreateDialog = () => {
        setEditingCategory(null);
        reset();
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: ProjectCategory) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            sort_order: category.sort_order,
            is_active: category.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            put(route('admin.project-categories.update', editingCategory.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.project-categories.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (category: ProjectCategory) => {
        if (category.projects_count > 0) {
            alert(`Cannot delete category with ${category.projects_count} associated projects.`);
            return;
        }

        if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
            router.delete(route('admin.project-categories.destroy', category.id));
        }
    };

    const totalProjects = categories.reduce((sum, cat) => sum + cat.projects_count, 0);
    const activeCategories = categories.filter((cat) => cat.is_active).length;

    return (
        <AdminLayout>
            <Head title="Project Categories" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Project Categories</h1>
                        <p className="text-muted-foreground mt-2">Manage categories for your portfolio projects</p>
                    </div>
                    {canCreate && (
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4 dark:shadow-lg dark:shadow-white/10">
                        <p className="text-muted-foreground text-sm">Total Categories</p>
                        <p className="text-2xl font-bold">{categories.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 dark:shadow-lg dark:shadow-white/10">
                        <p className="text-muted-foreground text-sm">Active Categories</p>
                        <p className="text-2xl font-bold">{activeCategories}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 dark:shadow-lg dark:shadow-white/10">
                        <p className="text-muted-foreground text-sm">Total Projects</p>
                        <p className="text-2xl font-bold">{totalProjects}</p>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="rounded-lg border bg-card dark:shadow-lg dark:shadow-white/10">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Projects</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{category.sort_order}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                            {category.description && (
                                                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="rounded bg-muted px-2 py-1 text-xs">{category.slug}</code>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{category.projects_count}</td>
                                        <td className="px-4 py-3">
                                            {category.is_active ? (
                                                <Badge variant="default" className="bg-green-600">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {canUpdate && (
                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(category)}
                                                        disabled={category.projects_count > 0}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {categories.length === 0 && (
                        <div className="p-12 text-center">
                            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-lg font-medium">No categories found</p>
                            <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first category</p>
                            {canCreate && (
                                <Button className="mt-4" onClick={openCreateDialog}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Category
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Update the category details below.' : 'Add a new category for your projects.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., Web Application"
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="e.g., web-app (auto-generated if empty)"
                            />
                            {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                            <p className="text-xs text-muted-foreground">Leave empty to auto-generate from name</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Brief description of this category"
                                rows={2}
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                min={0}
                            />
                            {errors.sort_order && <p className="text-sm text-destructive">{errors.sort_order}</p>}
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="is_active">Active</Label>
                                <p className="text-xs text-muted-foreground">Show this category in dropdowns</p>
                            </div>
                            <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
