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
                <span className="text-sm font-medium text-[#9E9E95]">Category:</span>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onCategoryChange(null)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            selectedCategory === null
                                ? 'bg-[#1B3D2F] text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                : 'border border-[#E5E4E0] bg-white text-[#6B6B63] hover:border-[#2A5E44] hover:text-[#1B3D2F] dark:border-[#2A4A3A] dark:bg-[#162820] dark:text-[#9E9E95] dark:hover:border-[#5AAF7E] dark:hover:text-[#5AAF7E]'
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
                                    ? 'bg-[#1B3D2F] text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                    : 'border border-[#E5E4E0] bg-white text-[#6B6B63] hover:border-[#2A5E44] hover:text-[#1B3D2F] dark:border-[#2A4A3A] dark:bg-[#162820] dark:text-[#9E9E95] dark:hover:border-[#5AAF7E] dark:hover:text-[#5AAF7E]'
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
                    <span className="text-sm font-medium text-[#9E9E95]">Tech:</span>
                    <div className="flex flex-wrap gap-2">
                        {techStack.slice(0, 12).map((tech) => (
                            <button
                                key={tech}
                                onClick={() => toggleTech(tech)}
                                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                    selectedTech.includes(tech)
                                        ? 'bg-[#1B3D2F] text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                        : 'border border-[#E5E4E0] bg-white text-[#6B6B63] hover:border-[#2A5E44] hover:text-[#1B3D2F] dark:border-[#2A4A3A] dark:bg-[#162820] dark:text-[#9E9E95] dark:hover:border-[#5AAF7E] dark:hover:text-[#5AAF7E]'
                                }`}
                            >
                                {tech}
                                {selectedTech.includes(tech) && <X className="h-3 w-3" />}
                            </button>
                        ))}
                        {techStack.length > 12 && (
                            <span className="px-2 py-1.5 text-xs text-[#9E9E95]">+{techStack.length - 12} more</span>
                        )}
                    </div>
                </div>
            )}

            {/* Active Filters Summary & Clear */}
            {hasActiveFilters && (
                <div className="flex items-center gap-3 border-t border-[#E5E4E0] pt-2 dark:border-[#2A4A3A]">
                    <span className="text-sm text-[#9E9E95]">
                        Active filters:
                        {selectedCategory && (
                            <span className="ml-1 font-medium text-[#1A1A1A] dark:text-[#E8E6E1]">
                                {categories[selectedCategory as ProjectCategory]}
                            </span>
                        )}
                        {selectedTech.length > 0 && (
                            <span className="ml-1 font-medium text-[#1A1A1A] dark:text-[#E8E6E1]">
                                {selectedCategory && ' + '}
                                {selectedTech.length} tech{selectedTech.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </span>
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-sm text-[#9E9E95] transition-colors hover:text-[#1B3D2F] dark:hover:text-[#5AAF7E]"
                    >
                        <X className="h-3 w-3" />
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
