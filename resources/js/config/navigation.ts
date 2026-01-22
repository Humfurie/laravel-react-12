import { FileText, FolderKanban, Home as HomeIcon, type LucideIcon } from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    route: string;
    showIcon: boolean;
}

// Main public navigation items
export const publicNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, route: '/', showIcon: true },
    { id: 'projects', label: 'Projects', icon: FolderKanban, route: '/projects', showIcon: true },
    { id: 'blog', label: 'Blog', icon: FileText, route: '/blog', showIcon: true },
];

// Helper function to get navigation by page
export function getNavItemsForPage(): NavItem[] {
    return publicNavItems;
}
