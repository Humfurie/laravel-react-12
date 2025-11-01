import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'draft' as 'draft' | 'active' | 'ended',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.raffles.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Raffle" />

            <div className="container mx-auto max-w-4xl py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Create Raffle</h1>
                    <p className="text-muted-foreground">Set up a new raffle campaign</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Raffle Title *</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter raffle title..."
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
                                    placeholder="Enter the raffle description and criteria for entering..."
                                    rows={6}
                                    className="mt-1"
                                />
                                <p className="text-muted-foreground mt-1 text-xs">Describe the prize and requirements to enter the raffle</p>
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>
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
                                <Label htmlFor="end_date">End Date & Time *</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="end_date"
                                        type="datetime-local"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        min={data.start_date}
                                    />
                                    <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">Must be after the start date</p>
                                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">Status</h2>

                        <div>
                            <Label htmlFor="status">Raffle Status *</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'draft' | 'active' | 'ended')}
                                className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="ended">Ended</option>
                            </select>
                            <p className="text-muted-foreground mt-1 text-xs">Set to "Active" to allow public entries</p>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('admin.raffles.index'))}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Raffle'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
