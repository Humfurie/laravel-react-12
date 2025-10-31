import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { Edit, FolderTree, Plus, Trash2 } from 'lucide-react';

interface Taxonomy {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    terms_count: number;
    model_names: string[];
    is_shared: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    taxonomies: Taxonomy[];
}

export default function Index({ taxonomies }: Props) {
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete the taxonomy "${name}"? This will also delete all its terms.`)) {
            router.delete(`/admin/taxonomies/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Taxonomy Management</h1>
                        <p className="text-muted-foreground">Manage taxonomies and their terms</p>
                    </div>
                    <Link href="/admin/taxonomies/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Taxonomy
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Taxonomies</CardTitle>
                        <CardDescription>A list of all taxonomies in your system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {taxonomies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FolderTree className="text-muted-foreground mb-4 h-12 w-12" />
                                <h3 className="mb-2 text-lg font-semibold">No taxonomies yet</h3>
                                <p className="text-muted-foreground mb-4 text-sm">Get started by creating your first taxonomy</p>
                                <Link href="/admin/taxonomies/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Taxonomy
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Available For</TableHead>
                                        <TableHead className="text-center">Terms</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {taxonomies.map((taxonomy) => (
                                        <TableRow key={taxonomy.id}>
                                            <TableCell className="font-medium">{taxonomy.name}</TableCell>
                                            <TableCell>
                                                <code className="bg-muted rounded px-2 py-1 text-sm">{taxonomy.slug}</code>
                                            </TableCell>
                                            <TableCell>
                                                {taxonomy.is_shared ? (
                                                    <Badge variant="secondary">All Models</Badge>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {taxonomy.model_names.map((modelName) => (
                                                            <Badge key={modelName} variant="outline">
                                                                {modelName}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link
                                                    href={`/admin/taxonomy-terms?taxonomy_id=${taxonomy.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {taxonomy.terms_count} terms
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/taxonomy-terms?taxonomy_id=${taxonomy.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <FolderTree className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/taxonomies/${taxonomy.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(taxonomy.id, taxonomy.name)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
