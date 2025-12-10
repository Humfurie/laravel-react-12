import { Coins, FileText, FolderKanban, Home as HomeIcon, type LucideIcon, TrendingUp, Trophy } from 'lucide-react';

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
    { id: 'giveaways', label: 'Giveaways', icon: Trophy, route: '/giveaways', showIcon: true },
    { id: 'crypto', label: 'Crypto', icon: Coins, route: '/crypto', showIcon: true },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp, route: '/stocks', showIcon: true },
];

// Giveaway-specific navigation
export const giveawayNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, route: '/', showIcon: true },
    { id: 'blog', label: 'Blog', icon: FileText, route: '/blog', showIcon: true },
    { id: 'giveaways', label: 'Giveaways', icon: Trophy, route: '/giveaways', showIcon: true },
];

// Helper function to get navigation by page
export function getNavItemsForPage(page?: string): NavItem[] {
    switch (page) {
        case 'giveaways':
            return giveawayNavItems;
        default:
            return publicNavItems;
    }
}
