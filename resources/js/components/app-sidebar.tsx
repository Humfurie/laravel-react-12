import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import type { Auth, NavItem, Permissions } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Briefcase, Building, Code2, FileText, FolderKanban, Globe, LayoutGrid, Moon, Shield, Sun, Trophy, Users } from 'lucide-react';
import { useMemo } from 'react';
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
        title: 'Deployment Management',
        href: '/admin/deployments',
        icon: Globe,
        requiredPermission: 'deployment',
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
    const { appearance, updateAppearance } = useAppearance();

    const isDark = useMemo(() => {
        if (typeof window === 'undefined') return appearance === 'dark';
        return appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, [appearance]);

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

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
                <SidebarGroup className="group-data-[collapsible=icon]:p-0">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={toggleTheme}
                                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                    tooltip={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
                                >
                                    {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                                    <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
