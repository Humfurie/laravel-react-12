import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import type { Deployment, DeploymentClientType, DeploymentStatus } from '@/types/deployment';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Globe, MoreHorizontal, Plus, RotateCcw, Star, Trash2 } from 'lucide-react';

interface Props {
    deployments: {
        data: Deployment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    statuses: Record<DeploymentStatus, string>;
    clientTypes: Record<DeploymentClientType, string>;
    can: {
        create: boolean;
    };
}

const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'maintenance':
            return 'bg-orange-100 text-orange-800';
        case 'archived':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getClientTypeColor = (clientType: DeploymentClientType) => {
    switch (clientType) {
        case 'family':
            return 'bg-pink-100 text-pink-800';
        case 'friend':
            return 'bg-purple-100 text-purple-800';
        case 'business':
            return 'bg-blue-100 text-blue-800';
        case 'personal':
            return 'bg-cyan-100 text-cyan-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

function DeploymentCard({ deployment }: { deployment: Deployment }) {
    const { can } = usePermissions();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this deployment?')) {
            router.delete(route('admin.deployments.destroy', deployment.slug));
        }
    };

    const handleRestore = () => {
        router.patch(route('admin.deployments.restore', deployment.slug));
    };

    const handleForceDelete = () => {
        if (confirm('Are you sure you want to permanently delete this deployment? This action cannot be undone.')) {
            router.delete(route('admin.deployments.force-destroy', deployment.slug));
        }
    };

    const handleCardClick = () => {
        if (can('deployment', 'update')) {
            router.visit(route('admin.deployments.edit', deployment.slug));
        }
    };

    const hasActions = !deployment.deleted_at ? can('deployment', 'delete') : can('deployment', 'restore') || can('deployment', 'forceDelete');

    return (
        <div
            className={`hover:bg-muted/50 ${can('deployment', 'update') ? 'cursor-pointer' : 'cursor-default'} rounded-lg border bg-card p-4 transition-colors dark:shadow-lg dark:shadow-white/10 ${deployment.deleted_at ? 'opacity-50' : ''}`}
            onClick={handleCardClick}
        >
            <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {deployment.thumbnail_url && (
                    <div className="hidden h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                        <img src={deployment.thumbnail_url} alt={deployment.title} className="h-full w-full object-cover" />
                    </div>
                )}

                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{deployment.title}</h3>
                        <Badge className={getStatusColor(deployment.status)}>{deployment.status_label}</Badge>
                        <Badge className={getClientTypeColor(deployment.client_type)}>{deployment.client_type_label}</Badge>
                        {deployment.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                                <Star className="mr-1 h-3 w-3" />
                                Featured
                            </Badge>
                        )}
                        {deployment.deleted_at && (
                            <Badge variant="destructive" className="text-xs">
                                Deleted
                            </Badge>
                        )}
                    </div>

                    <p className="text-muted-foreground text-sm">
                        Client: <span className="font-medium">{deployment.client_name}</span>
                    </p>

                    {deployment.description && (
                        <p className="text-muted-foreground line-clamp-2 text-sm">{deployment.description}</p>
                    )}

                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span>Updated: {formatDistanceToNow(new Date(deployment.updated_at), { addSuffix: true })}</span>
                        {deployment.live_url && (
                            <a
                                href={deployment.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-primary flex items-center gap-1"
                            >
                                <Globe className="h-3 w-3" />
                                Live
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
                                {!deployment.deleted_at ? (
                                    <>
                                        {can('deployment', 'delete') && (
                                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {can('deployment', 'restore') && (
                                            <DropdownMenuItem onClick={handleRestore} className="text-green-600">
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Restore
                                            </DropdownMenuItem>
                                        )}
                                        {can('deployment', 'forceDelete') && (
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

export default function DeploymentsIndex({ deployments, can: pageCan }: Props) {
    const { can } = usePermissions();

    return (
        <AdminLayout>
            <Head title="Deployment Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
                        <p className="text-muted-foreground">{can('deployment', 'update') ? 'Click on any deployment to edit it' : 'View deployments'}</p>
                    </div>
                    {pageCan.create && (
                        <Link href={route('admin.deployments.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Deployment
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="text-muted-foreground text-sm">
                        {deployments.total} deployment{deployments.total !== 1 ? 's' : ''} found
                    </div>

                    {deployments.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">No deployments found.</p>
                                {pageCan.create && (
                                    <Link href={route('admin.deployments.create')} className="mt-4 inline-block">
                                        <Button>Create your first deployment</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        deployments.data.map((deployment) => <DeploymentCard key={deployment.id} deployment={deployment} />)
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
