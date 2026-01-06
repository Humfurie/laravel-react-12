import type { ProjectCategory } from '@/types/project';
import { X } from 'lucide-react';

interface ProjectFiltersProps {
    categories: Record<ProjectCategory, string>;
    techStack: string[];
    selectedCategory: string | null;
    selectedTech: string[];
    onCategoryChange: (category: string | null) => void;
    onTechChange: (tech: string[]) => void;
}

export function ProjectFilters({ categories, techStack, selectedCategory, selectedTech, onCategoryChange, onTechChange }: ProjectFiltersProps) {
    const toggleTech = (tech: string) => {
        if (selectedTech.includes(tech)) {
            onTechChange(selectedTech.filter((t) => t !== tech));
        } else {
            onTechChange([...selectedTech, tech]);
        }
    };

    const clearFilters = () => {
        onCategoryChange(null);
        onTechChange([]);
    };

    const hasActiveFilters = selectedCategory !== null || selectedTech.length > 0;

    return (
        <div className="space-y-6">
            {/* Category Filter - Pill Style */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-500">Category:</span>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onCategoryChange(null)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            selectedCategory === null
                                ? 'bg-gray-900 text-white'
                                : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                        }`}
                    >
                        All
                    </button>
                    {Object.entries(categories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => onCategoryChange(key)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                selectedCategory === key
                                    ? 'bg-gray-900 text-white'
                                    : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tech Stack Filter */}
            {techStack.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Tech:</span>
                    <div className="flex flex-wrap gap-2">
                        {techStack.slice(0, 12).map((tech) => (
                            <button
                                key={tech}
                                onClick={() => toggleTech(tech)}
                                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                    selectedTech.includes(tech) ? 'bg-[#88C0A8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tech}
                                {selectedTech.includes(tech) && <X className="h-3 w-3" />}
                            </button>
                        ))}
                        {techStack.length > 12 && <span className="px-2 py-1.5 text-xs text-gray-400">+{techStack.length - 12} more</span>}
                    </div>
                </div>
            )}

            {/* Active Filters Summary & Clear */}
            {hasActiveFilters && (
                <div className="flex items-center gap-3 border-t border-gray-100 pt-2">
                    <span className="text-sm text-gray-500">
                        Active filters:
                        {selectedCategory && (
                            <span className="ml-1 font-medium text-gray-700">{categories[selectedCategory as ProjectCategory]}</span>
                        )}
                        {selectedTech.length > 0 && (
                            <span className="ml-1 font-medium text-gray-700">
                                {selectedCategory && ' + '}
                                {selectedTech.length} tech{selectedTech.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </span>
                    <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900">
                        <X className="h-3 w-3" />
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
