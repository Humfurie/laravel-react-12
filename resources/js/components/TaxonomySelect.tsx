import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TaxonomyTerm {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface Taxonomy {
    id: number;
    name: string;
    slug: string;
    description?: string;
    terms: TaxonomyTerm[];
}

interface TaxonomySelectProps {
    taxonomies: Taxonomy[];
    selectedTermIds: number[];
    onChange: (termIds: number[]) => void;
    error?: string;
}

export function TaxonomySelect({ taxonomies, selectedTermIds = [], onChange, error }: TaxonomySelectProps) {
    const handleToggle = (termId: number) => {
        const newSelection = selectedTermIds.includes(termId) ? selectedTermIds.filter((id) => id !== termId) : [...selectedTermIds, termId];

        onChange(newSelection);
    };

    if (taxonomies.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            {taxonomies.map((taxonomy) => (
                <div key={taxonomy.id} className="space-y-3">
                    <div>
                        <Label className="text-base font-semibold">{taxonomy.name}</Label>
                        {taxonomy.description && <p className="text-muted-foreground text-sm">{taxonomy.description}</p>}
                    </div>

                    {taxonomy.terms.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No terms available.{' '}
                            <a href={`/admin/taxonomy-terms/create?taxonomy_id=${taxonomy.id}`} className="text-blue-600 hover:underline">
                                Create one
                            </a>
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {taxonomy.terms.map((term) => {
                                const isSelected = selectedTermIds.includes(term.id);
                                return (
                                    <div
                                        key={term.id}
                                        onClick={() => handleToggle(term.id)}
                                        className={`flex cursor-pointer items-center space-x-2 rounded-md border px-3 py-2 transition-all ${
                                            isSelected
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800'
                                        } `}
                                    >
                                        <Checkbox id={`term-${term.id}`} checked={isSelected} onCheckedChange={() => handleToggle(term.id)} />
                                        <label htmlFor={`term-${term.id}`} className="cursor-pointer text-sm font-medium">
                                            {term.name}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}

            {selectedTermIds.length > 0 && (
                <div className="bg-muted rounded-md p-3">
                    <p className="mb-2 text-sm font-medium">Selected ({selectedTermIds.length}):</p>
                    <div className="flex flex-wrap gap-2">
                        {taxonomies.map((taxonomy) =>
                            taxonomy.terms
                                .filter((term) => selectedTermIds.includes(term.id))
                                .map((term) => (
                                    <Badge key={term.id} variant="secondary" className="cursor-pointer" onClick={() => handleToggle(term.id)}>
                                        {term.name} ×
                                    </Badge>
                                )),
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
