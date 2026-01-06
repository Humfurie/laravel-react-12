import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { MdKeyboardArrowUp, MdOutlineKeyboardArrowDown } from 'react-icons/md';

interface BlogFiltersProps {
    categories: Record<string, string>;
    allTags: string[];
    filters: {
        search: string;
        category: string;
        tag: string;
    };
    onFilterChange: (filters: { search?: string; category?: string; tag?: string }) => void;
}

export function BlogFilters({ categories, allTags, filters, onFilterChange }: BlogFiltersProps) {
    const [searchValue, setSearchValue] = useState(filters.search);
    const [categoryOpen, setCategoryOpen] = useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilterChange({ search: searchValue });
    };

    const handleCategoryChange = (category: string) => {
        onFilterChange({ category: category === 'all' ? '' : category });
        setCategoryOpen(false);
    };

    const handleTagChange = (tag: string) => {
        onFilterChange({ tag: tag === 'all' ? '' : tag });
    };

    const clearFilters = () => {
        setSearchValue('');
        onFilterChange({ search: '', category: '', tag: '' });
    };

    const hasActiveFilters = filters.search || filters.category || filters.tag;
    const categoryOptions = [['all', 'All Categories'], ...Object.entries(categories)];

    return (
        <div className="space-y-4">
            {/* Search and Tag Filter Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search posts..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="focus:border-brand-orange focus:ring-brand-orange rounded-xl border-gray-200 bg-white pr-4 pl-10"
                    />
                </form>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                    <Select value={filters.tag || 'all'} onValueChange={handleTagChange}>
                        <SelectTrigger className="w-full rounded-xl border-gray-200 bg-white sm:w-48">
                            <SelectValue placeholder="Filter by tag" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tags</SelectItem>
                            {allTags.map((tag) => (
                                <SelectItem key={tag} value={tag}>
                                    {tag}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </button>
                )}
            </div>

            {/* Category Pills - Mobile Dropdown */}
            <div className="relative md:hidden">
                <button
                    className="text-brand-black flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left"
                    onClick={() => setCategoryOpen(!categoryOpen)}
                >
                    <span>{filters.category ? categories[filters.category] || 'All Categories' : 'All Categories'}</span>
                    <span className="text-gray-400">{categoryOpen ? <MdKeyboardArrowUp size={20} /> : <MdOutlineKeyboardArrowDown size={20} />}</span>
                </button>

                {categoryOpen && (
                    <ul className="absolute left-0 z-10 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                        {categoryOptions.map(([slug, label]) => (
                            <li
                                key={slug}
                                onClick={() => handleCategoryChange(slug)}
                                className={`cursor-pointer px-4 py-2.5 transition-colors ${
                                    (slug === 'all' && !filters.category) || filters.category === slug
                                        ? 'bg-brand-orange text-white'
                                        : 'hover:bg-orange-50'
                                }`}
                            >
                                {label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Category Pills - Desktop */}
            <div className="hidden flex-wrap gap-2 md:flex">
                {categoryOptions.map(([slug, label]) => (
                    <button
                        key={slug}
                        onClick={() => handleCategoryChange(slug)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            (slug === 'all' && !filters.category) || filters.category === slug
                                ? 'bg-brand-orange border-brand-orange text-white shadow-md'
                                : 'hover:border-brand-orange hover:text-brand-orange border-gray-200 bg-white text-gray-600'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span>Active filters:</span>
                    {filters.search && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-orange-800">
                            Search: "{filters.search}"
                            <button
                                onClick={() => {
                                    setSearchValue('');
                                    onFilterChange({ search: '' });
                                }}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.category && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-purple-800">
                            {categories[filters.category]}
                            <button onClick={() => onFilterChange({ category: '' })}>
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.tag && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-blue-800">
                            Tag: {filters.tag}
                            <button onClick={() => onFilterChange({ tag: '' })}>
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
