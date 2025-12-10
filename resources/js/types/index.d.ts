import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface ResourcePermissions {
    viewAny: boolean;
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    restore: boolean;
    forceDelete: boolean;
}

export interface Permissions {
    developer: ResourcePermissions;
    'realestate-project': ResourcePermissions;
    property: ResourcePermissions;
    blog: ResourcePermissions;
    giveaway: ResourcePermissions;
    project: ResourcePermissions;
    inquiry: ResourcePermissions;
    user: ResourcePermissions;
    role: ResourcePermissions;
    permission: ResourcePermissions;
    experience: ResourcePermissions;
    expertise: ResourcePermissions;
    skills: ResourcePermissions;
    technology: ResourcePermissions;
}

export interface Auth {
    user: User;
    isAdmin: boolean;
    roles: string[];
    permissions: Permissions;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface LocationImage {
    id: number;
    url: string;
    is_primary: boolean;
    caption?: string;
}

export interface BlogLocation {
    id: number;
    title: string;
    description?: string;
    address?: string;
    latitude: number;
    longitude: number;
    order: number;
    images: LocationImage[];
    primary_image_url?: string;
}
