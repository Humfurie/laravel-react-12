import { Coins, FileText, Home as HomeIcon, TrendingUp, Trophy, type LucideIcon } from 'lucide-react';

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
    { id: 'blog', label: 'Blog', icon: FileText, route: '/blog', showIcon: true },
    { id: 'raffles', label: 'Raffles', icon: Trophy, route: '/raffles', showIcon: true },
    { id: 'crypto', label: 'Crypto', icon: Coins, route: '/crypto', showIcon: true },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp, route: '/stocks', showIcon: true },
];

// Raffle-specific navigation
export const raffleNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, route: '/', showIcon: true },
    { id: 'blog', label: 'Blog', icon: FileText, route: '/blog', showIcon: true },
    { id: 'raffles', label: 'Raffles', icon: Trophy, route: '/raffles', showIcon: true },
];

// Helper function to get navigation by page
export function getNavItemsForPage(page?: string): NavItem[] {
    switch (page) {
        case 'raffles':
            return raffleNavItems;
        default:
            return publicNavItems;
    }
}
