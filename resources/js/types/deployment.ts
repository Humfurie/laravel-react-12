export type DeploymentStatus = 'active' | 'maintenance' | 'archived';
export type DeploymentClientType = 'family' | 'friend' | 'business' | 'personal';

export interface DeploymentImage {
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

export interface Deployment {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    client_name: string;
    client_type: DeploymentClientType;
    client_type_label: string;
    industry: string | null;
    tech_stack: string[] | null;
    challenges_solved: string[] | null;
    live_url: string;
    demo_url: string | null;
    project_id: number | null;
    project?: {
        id: number;
        title: string;
        slug: string;
    };
    images?: DeploymentImage[];
    is_featured: boolean;
    is_public: boolean;
    deployed_at: string | null;
    status: DeploymentStatus;
    status_label: string;
    sort_order: number;
    thumbnail_url: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
