import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import React, { useMemo } from 'react';
import type { Permissions } from '@/types';
import { BookOpen, Briefcase, Building, Code2, FileText, LayoutGrid, Shield, Trophy, Users } from 'lucide-react';
import AppLogo from './app-logo';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    requiredPermission?: keyof Permissions;
    requiredPermissions?: (keyof Permissions)[]; // For items requiring any of multiple permissions
}

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Real Estate Management',
        href: '/admin/real-estate',
        icon: Building,
        requiredPermissions: ['developer', 'realestate-project', 'property'],
    },
    {
        title: 'Blog Management',
        href: '/admin/blogs',
        icon: FileText,
        requiredPermission: 'blog',
    },
    {
        title: 'Raffle Management',
        href: '/admin/raffles',
        icon: Trophy,
        requiredPermission: 'raffle',
    },
    {
        title: 'Experience Management',
        href: '/admin/experiences',
        icon: Briefcase,
        requiredPermission: 'experience',
    },
    {
        title: 'Expertise Management',
        href: '/admin/expertises',
        icon: Code2,
        requiredPermission: 'expertise',
    },
    {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
        requiredPermission: 'user',
    },
    {
        title: 'Role Management',
        href: '/admin/roles',
        icon: Shield,
        requiredPermission: 'role',
    },
    {
        title: 'Permission Management',
        href: '/admin/permissions',
        icon: LayoutGrid,
        requiredPermission: 'permission',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'About',
        href: '/admin/about',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as { auth: { permissions: Permissions } };

    const visibleNavItems = useMemo(() => {
        return allNavItems.filter((item) => {
            // If no permission required, always show
            if (!item.requiredPermission && !item.requiredPermissions) {
                return true;
            }

            // Check single permission
            if (item.requiredPermission) {
                return auth.permissions[item.requiredPermission]?.viewAny ?? false;
            }

            // Check multiple permissions (OR logic - show if user has ANY of them)
            if (item.requiredPermissions) {
                return item.requiredPermissions.some((permission) => auth.permissions[permission]?.viewAny ?? false);
            }

            return false;
        });
    }, [auth.permissions]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
