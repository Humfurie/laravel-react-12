import { FileText, FolderKanban, Home as HomeIcon, type LucideIcon, MessageSquareHeart, ScrollText } from 'lucide-react';

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
    { id: 'resume', label: 'Resume', icon: ScrollText, route: '/resume', showIcon: true },
    { id: 'guestbook', label: 'Guestbook', icon: MessageSquareHeart, route: '/guestbook', showIcon: true },
];

// Helper function to get navigation by page
export function getNavItemsForPage(): NavItem[] {
    return publicNavItems;
}
