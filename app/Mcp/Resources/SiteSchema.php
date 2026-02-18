<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Server\Resource;

class SiteSchema extends Resource
{
    protected string $description = 'Portfolio site content schema — describes all available models, their fields, and relationships.';

    public function uri(): string
    {
        return 'schema://portfolio/site-schema';
    }

    public function name(): string
    {
        return 'site-schema';
    }

    public function title(): string
    {
        return 'Portfolio Site Schema';
    }

    public function mimeType(): string
    {
        return 'application/json';
    }

    public function read(): string
    {
        return json_encode([
            'models' => [
                'Blog' => [
                    'fields' => ['id', 'title', 'slug', 'content', 'excerpt', 'status', 'featured_image', 'meta_data', 'tags', 'isPrimary', 'featured_until', 'sort_order', 'view_count', 'published_at'],
                    'statuses' => ['draft', 'published', 'private'],
                    'relationships' => ['image (polymorphic)', 'comments (polymorphic)', 'dailyViews'],
                ],
                'Project' => [
                    'fields' => ['id', 'title', 'slug', 'description', 'short_description', 'category', 'project_category_id', 'tech_stack', 'links', 'github_repo', 'status', 'is_featured', 'is_public', 'metrics', 'case_study', 'testimonials', 'started_at', 'completed_at', 'sort_order', 'ownership_type', 'view_count'],
                    'statuses' => ['live', 'archived', 'maintenance', 'development'],
                    'ownership_types' => ['owner', 'contributor'],
                    'relationships' => ['primaryImage (polymorphic)', 'projectCategory'],
                ],
                'Deployment' => [
                    'fields' => ['id', 'title', 'slug', 'description', 'client_name', 'client_type', 'industry', 'tech_stack', 'challenges_solved', 'live_url', 'demo_url', 'project_id', 'is_featured', 'is_public', 'deployed_at', 'status', 'sort_order'],
                    'statuses' => ['active', 'maintenance', 'archived'],
                    'client_types' => ['family', 'friend', 'business', 'personal'],
                    'relationships' => ['project', 'primaryImage (polymorphic)'],
                ],
                'Experience' => [
                    'fields' => ['id', 'user_id', 'position', 'company', 'location', 'description (array)', 'start_month', 'start_year', 'end_month', 'end_year', 'is_current_position', 'display_order'],
                    'relationships' => ['user', 'image (polymorphic)'],
                ],
                'Expertise' => [
                    'fields' => ['id', 'name', 'image', 'category_slug', 'order', 'is_active'],
                    'categories' => ['be (Backend)', 'fe (Frontend)', 'td (Tools & DevOps)'],
                ],
                'GuestbookEntry' => [
                    'fields' => ['id', 'user_id', 'message', 'is_approved'],
                    'relationships' => ['user'],
                ],
                'Comment' => [
                    'fields' => ['id', 'commentable_type', 'commentable_id', 'user_id', 'parent_id', 'content', 'status', 'is_edited'],
                    'statuses' => ['approved', 'pending', 'rejected'],
                    'relationships' => ['user', 'commentable (polymorphic)', 'parent', 'replies'],
                    'notes' => 'Max 3 levels of nesting',
                ],
            ],
        ], JSON_PRETTY_PRINT);
    }
}
