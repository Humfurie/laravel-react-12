import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import type { Project, ProjectCategory, ProjectStatus } from '@/types/project';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Github, Globe, MoreHorizontal, Plus, RotateCcw, Search, Star, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    projects: {
        data: Project[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    categories: Record<ProjectCategory, string>;
    statuses: Record<ProjectStatus, string>;
}

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case 'live':
            return 'bg-[#E4EDE8] text-[#1B3D2F] dark:bg-[#162820] dark:text-[#5AAF7E]';
        case 'development':
            return 'bg-yellow-100 text-yellow-800';
        case 'maintenance':
            return 'bg-orange-100 text-orange-800';
        case 'archived':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getCategoryColor = (category: ProjectCategory) => {
    switch (category) {
        case 'web_app':
            return 'bg-blue-100 text-blue-800';
        case 'mobile_app':
            return 'bg-purple-100 text-purple-800';
        case 'api':
            return 'bg-indigo-100 text-indigo-800';
        case 'library':
            return 'bg-pink-100 text-pink-800';
        case 'cli':
            return 'bg-cyan-100 text-cyan-800';
        case 'design':
            return 'bg-rose-100 text-rose-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

function ProjectCard({ project }: { project: Project }) {
    const { can } = usePermissions();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this project?')) {
            router.delete(route('admin.projects.destroy', project.slug));
        }
    };

    const handleRestore = () => {
        router.patch(route('admin.projects.restore', project.slug));
    };

    const handleForceDelete = () => {
        if (confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
            router.delete(route('admin.projects.force-destroy', project.slug));
        }
    };

    const handleCardClick = () => {
        if (can('project', 'update')) {
            router.visit(route('admin.projects.edit', project.slug));
        }
    };

    const hasActions = !project.deleted_at ? can('project', 'delete') : can('project', 'restore') || can('project', 'forceDelete');

    return (
        <div
            className={`hover:bg-muted/50 ${can('project', 'update') ? 'cursor-pointer' : 'cursor-default'} rounded-lg border bg-card p-4 transition-colors dark:shadow-lg dark:shadow-white/10 ${project.deleted_at ? 'opacity-50' : ''}`}
            onClick={handleCardClick}
        >
            <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {project.thumbnail_url && (
                    <div className="hidden h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                        <img src={project.thumbnail_url} alt={project.title} className="h-full w-full object-cover" />
                    </div>
                )}

                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge className={getStatusColor(project.status)}>{project.status_label}</Badge>
                        <Badge className={getCategoryColor(project.category)}>{project.category_label}</Badge>
                        {project.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                                <Star className="mr-1 h-3 w-3" />
                                Featured
                            </Badge>
                        )}
                        {project.deleted_at && (
                            <Badge variant="destructive" className="text-xs">
                                Deleted
                            </Badge>
                        )}
                    </div>

                    <p className="text-muted-foreground line-clamp-2 text-sm">{project.short_description}</p>

                    {/* Tech stack badges */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {project.tech_stack.slice(0, 5).map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                </Badge>
                            ))}
                            {project.tech_stack.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                    +{project.tech_stack.length - 5}
                                </Badge>
                            )}
                        </div>
                    )}

                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span>Updated: {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
                        <span>Views: {project.view_count}</span>
                        {project.links?.demo_url && (
                            <a
                                href={project.links.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-primary flex items-center gap-1"
                            >
                                <Globe className="h-3 w-3" />
                                Demo
                            </a>
                        )}
                        {project.links?.repo_url && (
                            <a
                                href={project.links.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-primary flex items-center gap-1"
                            >
                                <Github className="h-3 w-3" />
                                Repo
                            </a>
                        )}
                    </div>
                </div>

                {hasActions && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {!project.deleted_at ? (
                                    <>
                                        {can('project', 'delete') && (
                                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {can('project', 'restore') && (
                                            <DropdownMenuItem onClick={handleRestore} className="text-[#2A5E44] dark:text-[#5AAF7E]">
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Restore
                                            </DropdownMenuItem>
                                        )}
                                        {can('project', 'forceDelete') && (
                                            <DropdownMenuItem onClick={handleForceDelete} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Permanently
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </div>
    );
}

const statusFilters = [
    { label: 'All', value: undefined },
    { label: 'Live', value: 'live' },
    { label: 'Development', value: 'development' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Archived', value: 'archived' },
    { label: 'Deleted', value: 'deleted' },
] as const;

export default function ProjectsIndex({ projects, filters }: Props) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search || '');
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get(route('admin.projects.index'), { search: search || undefined, status: filters.status }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleFilter = (status: string | undefined) => {
        router.get(route('admin.projects.index'), { search: filters.search, status }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout>
            <Head title="Project Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                        <p className="text-muted-foreground">{can('project', 'update') ? 'Click on any project to edit it' : 'View projects'}</p>
                    </div>
                    {can('project', 'create') && (
                        <Link href={route('admin.projects.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Project
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.label}
                                onClick={() => handleFilter(filter.value)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    filters.status === filter.value
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
                            placeholder="Search projects..."
                            className="rounded-lg border border-gray-200 bg-white py-1.5 pr-4 pl-9 text-sm focus:border-[#5AAF7E] focus:ring-2 focus:ring-[#5AAF7E]/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-muted-foreground text-sm">
                        {projects.total} project{projects.total !== 1 ? 's' : ''} found
                    </div>

                    {projects.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">No projects found.</p>
                                {!filters.search && !filters.status && can('project', 'create') && (
                                    <Link href={route('admin.projects.create')} className="mt-4 inline-block">
                                        <Button>Create your first project</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        projects.data.map((project) => <ProjectCard key={project.id} project={project} />)
                    )}
                </div>

                {/* Pagination */}
                {projects.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: projects.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() =>
                                    router.get(route('admin.projects.index'), { ...filters, page }, { preserveState: true })
                                }
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    page === projects.current_page
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
