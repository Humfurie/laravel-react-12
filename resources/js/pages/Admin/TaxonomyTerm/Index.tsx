import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, Tag, Trash2 } from 'lucide-react';

interface Taxonomy {
    id: number;
    name: string;
    slug: string;
}

interface TaxonomyTerm {
    id: number;
    taxonomy_id: number;
    name: string;
    slug: string;
    description: string | null;
    order: number;
    taxonomy: Taxonomy;
}

interface Props {
    terms: TaxonomyTerm[];
    taxonomies: Taxonomy[];
}

export default function Index({ terms, taxonomies }: Props) {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTaxonomyId = urlParams.get('taxonomy_id');

    const handleTaxonomyChange = (taxonomyId: string) => {
        if (taxonomyId === 'all') {
            router.get('/admin/taxonomy-terms');
        } else {
            router.get(`/admin/taxonomy-terms?taxonomy_id=${taxonomyId}`);
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete the term "${name}"?`)) {
            router.delete(`/admin/taxonomy-terms/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const selectedTaxonomy = taxonomies.find((t) => t.id.toString() === selectedTaxonomyId);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Taxonomy Terms</h1>
                        <p className="text-muted-foreground">Manage terms within taxonomies</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/taxonomies">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Taxonomies
                            </Button>
                        </Link>
                        <Link href={`/admin/taxonomy-terms/create${selectedTaxonomyId ? `?taxonomy_id=${selectedTaxonomyId}` : ''}`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Term
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Terms</CardTitle>
                                <CardDescription>
                                    {selectedTaxonomy ? `Showing terms for: ${selectedTaxonomy.name}` : 'All taxonomy terms'}
                                </CardDescription>
                            </div>
                            <div className="w-64">
                                <Select value={selectedTaxonomyId || 'all'} onValueChange={handleTaxonomyChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by taxonomy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Taxonomies</SelectItem>
                                        {taxonomies.map((taxonomy) => (
                                            <SelectItem key={taxonomy.id} value={taxonomy.id.toString()}>
                                                {taxonomy.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {terms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Tag className="text-muted-foreground mb-4 h-12 w-12" />
                                <h3 className="mb-2 text-lg font-semibold">No terms yet</h3>
                                <p className="text-muted-foreground mb-4 text-sm">
                                    {selectedTaxonomy ? `Create your first term for ${selectedTaxonomy.name}` : 'Create your first taxonomy term'}
                                </p>
                                <Link href={`/admin/taxonomy-terms/create${selectedTaxonomyId ? `?taxonomy_id=${selectedTaxonomyId}` : ''}`}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Term
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Taxonomy</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-center">Order</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {terms.map((term) => (
                                        <TableRow key={term.id}>
                                            <TableCell className="font-medium">{term.name}</TableCell>
                                            <TableCell>
                                                <code className="bg-muted rounded px-2 py-1 text-sm">{term.slug}</code>
                                            </TableCell>
                                            <TableCell>
                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                    {term.taxonomy.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground max-w-md truncate">{term.description || '—'}</TableCell>
                                            <TableCell className="text-center">{term.order}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/taxonomy-terms/${term.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(term.id, term.name)}>
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
