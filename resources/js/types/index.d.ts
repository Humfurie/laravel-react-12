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

export interface SocialLinks {
    github?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
}

export interface ProfileStat {
    label: string;
    value: string;
}

export interface User {
    id: number;
    name: string;
    username?: string;
    email: string;
    avatar?: string;
    bio?: string;
    avatar_url?: string;
    github_username?: string;
    google_id?: string;
    facebook_id?: string;
    github_id?: string;
    headline?: string;
    about?: string;
    social_links?: SocialLinks;
    profile_stats?: ProfileStat[];
    resume_path?: string;
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

export interface Comment {
    id: number;
    commentable_type: string;
    commentable_id: number;
    user_id: number;
    parent_id: number | null;
    content: string;
    status: 'approved' | 'pending' | 'hidden';
    is_edited: boolean;
    edited_at: string | null;
    created_at: string;
    updated_at: string;
    user: User;
    replies?: Comment[];
    can_edit?: boolean;
    can_delete?: boolean;
}

export interface CommentReport {
    id: number;
    comment_id: number;
    reported_by: number;
    reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
    description: string | null;
    status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
    reviewed_by: number | null;
    reviewed_at: string | null;
    admin_notes: string | null;
    created_at: string;
    comment: Comment;
    reporter: User;
    reviewer?: User;
}
