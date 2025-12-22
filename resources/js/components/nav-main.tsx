import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    // Function to check if a menu item is active
    const isActive = (href: string) => {
        const currentPath = page.url;
        // Exact match for dashboard
        if (href === '/dashboard') {
            return currentPath === '/dashboard';
        }
        // For other routes, use startsWith to match nested routes
        return currentPath.startsWith(href);
    };

    return (
        <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                Menu
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={{ children: item.title }}>
                            <Link href={item.href}>
                                {item.icon && <item.icon strokeWidth={1.5} />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
