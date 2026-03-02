import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    expertises: {
        data: Expertise[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        category?: string;
    };
}

const categoryNames: Record<string, string> = {
    be: 'Backend',
    fe: 'Frontend',
    td: 'Tools & DevOps',
};

const categoryFilters = [
    { label: 'All', value: undefined },
    { label: 'Backend', value: 'be' },
    { label: 'Frontend', value: 'fe' },
    { label: 'Tools & DevOps', value: 'td' },
] as const;

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

export default function Index({ expertises, filters }: Props) {
    const { can } = usePermissions();
    const canCreate = can('expertise', 'create');
    const canUpdate = can('expertise', 'update');
    const canDelete = can('expertise', 'delete');
    const [search, setSearch] = useState(filters.search || '');
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get(route('admin.expertises.index'), { search: search || undefined, category: filters.category }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleFilter = (category: string | undefined) => {
        router.get(route('admin.expertises.index'), { search: filters.search, category }, { preserveState: true, replace: true });
    };

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

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {categoryFilters.map((filter) => (
                            <button
                                key={filter.label}
                                onClick={() => handleFilter(filter.value)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    filters.category === filter.value
                                        ? 'bg-[#1B3D2F] text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search expertises..."
                            className="rounded-lg border border-gray-200 bg-white py-1.5 pr-4 pl-9 text-sm focus:border-[#5AAF7E] focus:ring-2 focus:ring-[#5AAF7E]/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                </div>

                {/* Expertise List */}
                <div className="space-y-4">
                    <div className="text-muted-foreground text-sm">
                        {expertises.total} expertise{expertises.total !== 1 ? 's' : ''} found
                    </div>

                    {expertises.data.length === 0 ? (
                        <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center">
                            <p className="text-lg font-medium">No expertises found</p>
                            <p className="mt-2 text-sm">
                                {filters.search || filters.category ? 'Try adjusting your filters' : 'Get started by creating your first expertise'}
                            </p>
                            {!filters.search && !filters.category && canCreate && (
                                <Link href={route('admin.expertises.create')} className="mt-4 inline-block">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Expertise
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {expertises.data.map((expertise) => (
                                <ExpertiseCard key={expertise.id} expertise={expertise} canUpdate={canUpdate} canDelete={canDelete} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {expertises.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: expertises.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() =>
                                    router.get(route('admin.expertises.index'), { ...filters, page }, { preserveState: true })
                                }
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    page === expertises.current_page
                                        ? 'bg-[#1B3D2F] text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
