import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, MoreHorizontal, Plus, Search, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

interface Giveaway {
    id: number;
    title: string;
    slug: string;
    description: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'active' | 'ended';
    is_active: boolean;
    has_ended: boolean;
    entries_count: number;
    winner: {
        id: number;
        name: string;
    } | null;
    primary_image_url: string | null;
    created_at: string;
}

interface Props {
    giveaways: {
        data: Giveaway[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'draft':
            return 'bg-yellow-100 text-yellow-800';
        case 'ended':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'active':
            return 'Active';
        case 'draft':
            return 'Draft';
        case 'ended':
            return 'Ended';
        default:
            return status;
    }
};

function RaffleCard({ giveaway }: { giveaway: Giveaway }) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this giveaway?')) {
            router.delete(route('admin.giveaways.destroy', giveaway.slug));
        }
    };

    const handleEdit = () => {
        router.visit(route('admin.giveaways.edit', giveaway.slug));
    };

    const handleWinnerSelection = () => {
        router.visit(route('admin.giveaways.winner-selection', giveaway.slug));
    };

    return (
        <div className="group hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors" onClick={handleEdit}>
            <div className="flex gap-4">
                {giveaway.primary_image_url && (
                    <div className="flex-shrink-0">
                        <img src={giveaway.primary_image_url} alt={giveaway.title} className="h-24 w-24 rounded-md object-cover" />
                    </div>
                )}
                <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold">{giveaway.title}</h3>
                                <Badge className={getStatusColor(giveaway.status)}>{getStatusLabel(giveaway.status)}</Badge>
                                {giveaway.winner && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Trophy className="h-3 w-3" />
                                        Winner Selected
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {giveaway.description.substring(0, 150)}
                                {giveaway.description.length > 150 && '...'}
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                                {!giveaway.winner && giveaway.entries_count > 0 && (
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleWinnerSelection();
                                        }}
                                    >
                                        Select Winner
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete();
                                    }}
                                    className="text-red-600"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{giveaway.entries_count} entries</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {new Date(giveaway.start_date).toLocaleDateString()} - {new Date(giveaway.end_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {giveaway.winner && (
                        <div className="text-sm">
                            <span className="text-muted-foreground">Winner: </span>
                            <span className="font-medium">{giveaway.winner.name}</span>
                        </div>
                    )}

                    <div className="text-muted-foreground text-xs">Created {formatDistanceToNow(new Date(giveaway.created_at))} ago</div>
                </div>
            </div>
        </div>
    );
}

export default function Index({ giveaways, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(route('admin.giveaways.index'), { search: value, status }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(route('admin.giveaways.index'), { search, status: value }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout>
            <Head title="Giveaways" />

            <div className="container mx-auto py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Giveaways</h1>
                        <p className="text-muted-foreground">Manage your giveaway campaigns and select winners</p>
                    </div>
                    <Link href={route('admin.giveaways.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Giveaway
                        </Button>
                    </Link>
                </div>

                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            type="text"
                            placeholder="Search giveaways..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="ended">Ended</option>
                    </select>
                </div>

                {giveaways?.data?.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Trophy className="text-muted-foreground mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-semibold">No giveaways found</h3>
                        <p className="text-muted-foreground mb-4 text-sm">Get started by creating your first giveaway campaign.</p>
                        <Link href={route('admin.giveaways.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Giveaway
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {giveaways?.data?.map((giveaway) => (
                            <RaffleCard key={giveaway.id} giveaway={giveaway} />
                        ))}
                    </div>
                )}

                {giveaways?.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {Array.from({ length: giveaways?.last_page || 1 }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === giveaways?.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    router.get(
                                        route('admin.giveaways.index', {
                                            page,
                                            search,
                                            status,
                                        }),
                                    )
                                }
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
