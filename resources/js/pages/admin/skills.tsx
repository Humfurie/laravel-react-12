import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageProps as InertiaPageProps } from '@inertiajs/inertia';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export interface FlashMessages {
    success?: string;
    error?: string;
}

export interface PageProps extends InertiaPageProps {
    flash?: FlashMessages;
}

interface Skill {
    id: number;
    name: string;
    slug: string;
    description: string;
    category: string;
    proficiency: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    skills: Skill[];
}

// Define form data type explicitly
interface SkillFormData {
    name: string;
    description: string;
    category: string;
    proficiency: number;
    is_featured: boolean;
    [key: string]: string | number | boolean | undefined;
}

export default function Skills({ skills }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

    // Form for creating/editing skills with explicit type
    const { data, setData, post, put, processing, errors, reset } = useForm<SkillFormData>({
        name: '',
        description: '',
        category: '',
        proficiency: 1,
        is_featured: false,
    });

    // Delete form
    const { delete: deleteSkill } = useForm();

    const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Design', 'Other'];

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.skills.store'), {
            onSuccess: () => {
                reset();
                setIsCreateOpen(false);
            },
        });
    };

    const handleEdit = (skill: Skill) => {
        setEditingSkill(skill);
        setData({
            name: skill.name,
            description: skill.description,
            category: skill.category,
            proficiency: skill.proficiency,
            is_featured: skill.is_featured,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSkill) {
            put(route('admin.skills.update', editingSkill.id), {
                onSuccess: () => {
                    reset();
                    setIsEditOpen(false);
                    setEditingSkill(null);
                },
            });
        }
    };

    const handleDelete = (skill: Skill) => {
        if (confirm('Are you sure you want to delete this skill?')) {
            deleteSkill(route('admin.skills.destroy', skill.id));
        }
    };

    const getProficiencyLabel = (proficiency: number) => {
        const labels = {
            1: 'Beginner',
            2: 'Basic',
            3: 'Intermediate',
            4: 'Advanced',
            5: 'Expert',
        };
        return labels[proficiency as keyof typeof labels] || 'Unknown';
    };

    const getProficiencyColor = (proficiency: number) => {
        const colors = {
            1: 'bg-red-100 text-red-800',
            2: 'bg-orange-100 text-orange-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-blue-100 text-blue-800',
            5: 'bg-green-100 text-green-800',
        };
        return colors[proficiency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const typedErrors = errors as Partial<Record<keyof SkillFormData, string>>;

    return (
        <>
            <Head title="Skills Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Skills Management</h1>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Skill
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Skill</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => (setData as any)('name', e.target.value)}
                                        placeholder="Enter skill name"
                                    />
                                    {typedErrors.name && <p className="text-sm text-red-500">{typedErrors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e: { target: { value: string } }) => (setData as any)('description', e.target.value)}
                                        placeholder="Enter skill description"
                                    />
                                    {typedErrors.description && <p className="text-sm text-red-500">{typedErrors.description}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={data.category} onValueChange={(value) => (setData as any)('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {typedErrors.category && <p className="text-sm text-red-500">{typedErrors.category}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="proficiency">Proficiency Level</Label>
                                    <Select value={data.proficiency.toString()} onValueChange={(value) => (setData as any)('proficiency', parseInt(value))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <SelectItem key={level} value={level.toString()}>
                                                    {level} - {getProficiencyLabel(level)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {typedErrors.proficiency && <p className="text-sm text-red-500">{typedErrors.proficiency}</p>}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) => (setData as any)('is_featured', Boolean(checked))}
                                    />
                                    <Label htmlFor="is_featured">Featured Skill</Label>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Skill'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Flash Messages */}
                {flash?.success && <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">{flash.success}</div>}

                {/* Skills Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {skills.map((skill) => (
                        <Card key={skill.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                                    <div className="flex space-x-1">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(skill)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(skill)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">{skill.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">{skill.category}</Badge>
                                        <Badge className={getProficiencyColor(skill.proficiency)}>{getProficiencyLabel(skill.proficiency)}</Badge>
                                        {skill.is_featured && <Badge variant="default">Featured</Badge>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Edit Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Skill</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={data.name}
                                    onChange={(e) => (setData as any)('name', e.target.value)}
                                    placeholder="Enter skill name"
                                />
                                {typedErrors.name && <p className="text-sm text-red-500">{typedErrors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <textarea
                                    id="edit-description"
                                    value={data.description}
                                    onChange={(e) => (setData as any)('description', e.target.value)}
                                    placeholder="Enter skill description"
                                />
                                {typedErrors.description && <p className="text-sm text-red-500">{typedErrors.description}</p>}
                            </div>

                            <div>
                                <Label htmlFor="edit-category">Category</Label>
                                <Select value={data.category} onValueChange={(value) => (setData as any)('category', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {typedErrors.category && <p className="text-sm text-red-500">{typedErrors.category}</p>}
                            </div>

                            <div>
                                <Label htmlFor="edit-proficiency">Proficiency Level</Label>
                                <Select value={data.proficiency.toString()} onValueChange={(value) => (setData as any)('proficiency', parseInt(value))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <SelectItem key={level} value={level.toString()}>
                                                {level} - {getProficiencyLabel(level)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {typedErrors.proficiency && <p className="text-sm text-red-500">{typedErrors.proficiency}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-is_featured"
                                    checked={data.is_featured}
                                    onCheckedChange={(checked) => (setData as any)('is_featured', Boolean(checked))}
                                />
                                <Label htmlFor="edit-is_featured">Featured Skill</Label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Skill'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
