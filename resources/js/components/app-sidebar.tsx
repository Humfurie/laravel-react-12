import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import React, { useMemo } from 'react';
import type { Auth, NavItem, Permissions } from '@/types';
import { BookOpen, Briefcase, Building, Code2, FileText, FolderKanban, LayoutGrid, Shield, Trophy, Users } from 'lucide-react';
import AppLogo from './app-logo';

interface SidebarNavItem extends NavItem {
    requiredPermission?: keyof Permissions;
    requiredPermissions?: (keyof Permissions)[]; // For items requiring any of multiple permissions
}

interface AdminPageProps {
    auth: Auth;
    [key: string]: unknown;
}

const allNavItems: SidebarNavItem[] = [
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
        title: 'Giveaway Management',
        href: '/admin/giveaways',
        icon: Trophy,
        requiredPermission: 'giveaway',
    },
    {
        title: 'Project Management',
        href: '/admin/projects',
        icon: FolderKanban,
        requiredPermission: 'project',
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

const footerNavItems: SidebarNavItem[] = [
    {
        title: 'About',
        href: '/admin/about',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<AdminPageProps>().props;

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
                            <Link href="/dashboard">
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
