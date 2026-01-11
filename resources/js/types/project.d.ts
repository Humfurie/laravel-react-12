export interface ProjectImage {
    id: number;
    name: string;
    path: string;
    url: string;
    is_primary: boolean;
    order: number;
    thumbnail_urls: {
        small?: string;
        medium?: string;
        large?: string;
    };
}

export interface ProjectLinks {
    demo_url?: string;
    repo_url?: string;
    docs_url?: string;
    npm_url?: string;
    app_store_url?: string;
    play_store_url?: string;
}

export interface ContributionDay {
    contributionCount: number;
    date: string;
    color: string;
}

export interface ContributionWeek {
    contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
    calendar: ContributionWeek[];
    total_contributions: number;
}

export interface ProjectMetrics {
    users?: number;
    stars?: number;
    downloads?: number;
    contribution_calendar?: ContributionCalendar;
    custom?: Record<string, string | number>;
}

export interface ProjectTestimonial {
    name: string;
    role?: string;
    company?: string;
    content: string;
    avatar_url?: string;
}

export type ProjectCategory = 'web_app' | 'mobile_app' | 'api' | 'library' | 'cli' | 'design';
export type ProjectStatus = 'live' | 'archived' | 'maintenance' | 'development';

export interface Project {
    id: number;
    title: string;
    slug: string;
    description: string;
    short_description: string;
    category: ProjectCategory;
    category_label: string;
    tech_stack: string[];
    links: ProjectLinks | null;
    status: ProjectStatus;
    status_label: string;
    is_featured: boolean;
    is_public: boolean;
    metrics: ProjectMetrics | null;
    case_study: string | null;
    testimonials: ProjectTestimonial[] | null;
    started_at: string | null;
    completed_at: string | null;
    featured_at: string | null;
    sort_order: number;
    view_count: number;
    thumbnail_url: string | null;
    images?: ProjectImage[];
    github_repo: string | null;
    metrics_synced_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export const PROJECT_CATEGORIES: Record<ProjectCategory, string> = {
    web_app: 'Web Application',
    mobile_app: 'Mobile App',
    api: 'API / Backend',
    library: 'Library / Package',
    cli: 'CLI Tool',
    design: 'Design System',
};

export const PROJECT_STATUSES: Record<ProjectStatus, string> = {
    live: 'Live',
    development: 'In Development',
    maintenance: 'Under Maintenance',
    archived: 'Archived',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
    live: 'bg-green-500',
    development: 'bg-yellow-500',
    maintenance: 'bg-orange-500',
    archived: 'bg-gray-500',
};
