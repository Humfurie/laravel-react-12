<?php

namespace App\Mcp\Tools\Dashboard;

use App\Models\Blog;
use App\Models\Comment;
use App\Models\Deployment;
use App\Models\Experience;
use App\Models\Expertise;
use App\Models\GuestbookEntry;
use App\Models\Project;
use Illuminate\Support\Facades\Cache;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class GetDashboardStats extends Tool
{
    public function description(): string
    {
        return 'Get dashboard statistics: counts and summaries for all content types on the portfolio site. Cached for 60 seconds.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema;
    }

    public function handle(array $arguments): ToolResult
    {
        $stats = Cache::remember('mcp:dashboard-stats', 60, fn () => [
            'blogs' => [
                'total' => Blog::count(),
                'published' => Blog::published()->count(),
                'drafts' => Blog::draft()->count(),
                'total_views' => (int) Blog::sum('view_count'),
            ],
            'projects' => [
                'total' => Project::count(),
                'public' => Project::where('is_public', true)->count(),
                'live' => Project::where('status', 'live')->count(),
                'featured' => Project::where('is_featured', true)->count(),
            ],
            'deployments' => [
                'total' => Deployment::count(),
                'active' => Deployment::where('status', 'active')->count(),
                'public' => Deployment::where('is_public', true)->count(),
            ],
            'experiences' => [
                'total' => Experience::where('user_id', config('app.admin_user_id'))->count(),
                'current' => Experience::where('user_id', config('app.admin_user_id'))->where('is_current_position', true)->count(),
            ],
            'expertises' => [
                'total' => Expertise::count(),
                'active' => Expertise::where('is_active', true)->count(),
                'by_category' => [
                    'backend' => Expertise::where('category_slug', 'be')->where('is_active', true)->count(),
                    'frontend' => Expertise::where('category_slug', 'fe')->where('is_active', true)->count(),
                    'tools_devops' => Expertise::where('category_slug', 'td')->where('is_active', true)->count(),
                ],
            ],
            'guestbook' => [
                'total' => GuestbookEntry::count(),
                'approved' => GuestbookEntry::where('is_approved', true)->count(),
                'pending' => GuestbookEntry::where('is_approved', false)->count(),
            ],
            'comments' => [
                'total' => Comment::count(),
                'approved' => Comment::where('status', 'approved')->count(),
                'pending' => Comment::where('status', 'pending')->count(),
            ],
        ]);

        return ToolResult::json($stats);
    }
}
