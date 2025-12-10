import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BlogCategoryBadgeProps {
    categorySlug: string;
    categoryLabel: string;
    size?: 'sm' | 'md';
    clickable?: boolean;
    onClick?: () => void;
}

const categoryColors: Record<string, string> = {
    tutorial: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    'case-study': 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    thoughts: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    general: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
};

export function BlogCategoryBadge({ categorySlug, categoryLabel, size = 'sm', clickable = false, onClick }: BlogCategoryBadgeProps) {
    const colorClasses = categoryColors[categorySlug] || categoryColors.general;
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <Badge
            variant="outline"
            className={cn(colorClasses, sizeClasses, 'rounded-full border font-medium', clickable && 'cursor-pointer transition-colors')}
            onClick={clickable ? onClick : undefined}
        >
            {categoryLabel}
        </Badge>
    );
}
