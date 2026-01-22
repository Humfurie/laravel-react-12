import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

interface Expertise {
    id: number;
    name: string;
    image: string;
    image_url: string;
    category_slug: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    expertises: Expertise[];
}

const categoryNames: Record<string, string> = {
    be: 'Backend',
    fe: 'Frontend',
    td: 'Tools & DevOps',
};

function ExpertiseCard({ expertise, canUpdate, canDelete }: { expertise: Expertise; canUpdate: boolean; canDelete: boolean }) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this expertise?')) {
            router.delete(route('admin.expertises.destroy', expertise.id));
        }
    };

    const handleEdit = () => {
        if (canUpdate) {
            router.visit(route('admin.expertises.edit', expertise.id));
        }
    };

    return (
        <div className={`rounded-lg border bg-card p-4 transition-colors dark:shadow-lg dark:shadow-white/10 ${canUpdate ? 'hover:bg-muted/50 cursor-pointer' : ''}`} onClick={handleEdit}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 gap-4">
                    {/* Tech Logo */}
                    {expertise.image_url && (
                        <div className="flex-shrink-0">
                            <img
                                src={expertise.image_url}
                                alt={expertise.name}
                                className="h-16 w-16 rounded-lg border-2 border-border object-contain p-2"
                            />
                        </div>
                    )}

                    {/* Expertise Details */}
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">{expertise.name}</h3>
                            {!expertise.is_active && (
                                <Badge variant="secondary" className="text-xs">
                                    Inactive
                                </Badge>
                            )}
                        </div>

                        <p className="text-muted-foreground text-sm font-medium">{categoryNames[expertise.category_slug]}</p>

                        <p className="text-muted-foreground text-sm">Order: {expertise.order}</p>
                    </div>
                </div>

                {(canUpdate || canDelete) && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {canUpdate && (
                                    <DropdownMenuItem onClick={handleEdit}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {canDelete && (
                                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Index({ expertises }: Props) {
    const { can } = usePermissions();
    const canCreate = can('expertise', 'create');
    const canUpdate = can('expertise', 'update');
    const canDelete = can('expertise', 'delete');

    // Group by category
    const groupedExpertises = expertises.reduce(
        (acc, expertise) => {
            acc[expertise.category_slug] = acc[expertise.category_slug] || [];
            acc[expertise.category_slug].push(expertise);
            return acc;
        },
        {} as Record<string, Expertise[]>,
    );

    return (
        <AdminLayout>
            <Head title="Manage Expertises" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Expertises</h1>
                        <p className="text-muted-foreground mt-2">Manage your technical skills and expertise</p>
                    </div>
                    {canCreate && (
                        <Link href={route('admin.expertises.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Expertise
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4 dark:shadow-lg dark:shadow-white/10">
                        <p className="text-muted-foreground text-sm">Total Expertises</p>
                        <p className="text-2xl font-bold">{expertises.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 dark:shadow-lg dark:shadow-white/10">
                        <p className="text-muted-foreground text-sm">Backend</p>
                        <p className="text-2xl font-bold">{groupedExpertises.be?.length || 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 dark:shadow-lg dark:shadow-white/10">
                        <p className="text-muted-foreground text-sm">Frontend</p>
                        <p className="text-2xl font-bold">{groupedExpertises.fe?.length || 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 dark:shadow-lg dark:shadow-white/10">
                        <p className="text-muted-foreground text-sm">Tools & DevOps</p>
                        <p className="text-2xl font-bold">{groupedExpertises.td?.length || 0}</p>
                    </div>
                </div>

                {/* Expertise List by Category */}
                {Object.entries(groupedExpertises).map(([slug, items]) => (
                    <div key={slug} className="space-y-4">
                        <h2 className="text-xl font-semibold">{categoryNames[slug]}</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {items.map((expertise) => (
                                <ExpertiseCard key={expertise.id} expertise={expertise} canUpdate={canUpdate} canDelete={canDelete} />
                            ))}
                        </div>
                    </div>
                ))}

                {expertises.length === 0 && (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center">
                        <p className="text-lg font-medium">No expertises found</p>
                        <p className="mt-2 text-sm">Get started by creating your first expertise</p>
                        {canCreate && (
                            <Link href={route('admin.expertises.create')} className="mt-4 inline-block">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Expertise
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
