<?php

namespace App\Mcp\Servers;

use App\Mcp\Prompts\ContentAssistant;
use App\Mcp\Resources\SiteSchema;
use App\Mcp\Tools\Blog\CreateBlog;
use App\Mcp\Tools\Blog\DeleteBlog;
use App\Mcp\Tools\Blog\GetBlog;
use App\Mcp\Tools\Blog\ListBlogs;
use App\Mcp\Tools\Blog\UpdateBlog;
use App\Mcp\Tools\Comment\ListComments;
use App\Mcp\Tools\Comment\ModerateComment;
use App\Mcp\Tools\Dashboard\GetDashboardStats;
use App\Mcp\Tools\Deployment\CreateDeployment;
use App\Mcp\Tools\Deployment\DeleteDeployment;
use App\Mcp\Tools\Deployment\GetDeployment;
use App\Mcp\Tools\Deployment\ListDeployments;
use App\Mcp\Tools\Deployment\UpdateDeployment;
use App\Mcp\Tools\Experience\CreateExperience;
use App\Mcp\Tools\Experience\DeleteExperience;
use App\Mcp\Tools\Experience\ListExperiences;
use App\Mcp\Tools\Experience\UpdateExperience;
use App\Mcp\Tools\Expertise\CreateExpertise;
use App\Mcp\Tools\Expertise\DeleteExpertise;
use App\Mcp\Tools\Expertise\ListExpertises;
use App\Mcp\Tools\Expertise\UpdateExpertise;
use App\Mcp\Tools\Guestbook\ListGuestbookEntries;
use App\Mcp\Tools\Guestbook\ModerateGuestbookEntry;
use App\Mcp\Tools\Image\UploadImageFromUrl;
use App\Mcp\Tools\Project\CreateProject;
use App\Mcp\Tools\Project\DeleteProject;
use App\Mcp\Tools\Project\GetProject;
use App\Mcp\Tools\Project\ListProjects;
use App\Mcp\Tools\Project\UpdateProject;
use Laravel\Mcp\Server;

class PortfolioServer extends Server
{
    public int $defaultPaginationLength = 50;

    protected string $name = 'Humphrey Portfolio';

    protected string $version = '1.0.0';

    protected string $instructions = 'This MCP server provides full read/write access to Humphrey\'s portfolio site. You can manage blog posts, projects, deployments, experiences, expertise items, guestbook entries, and comments. Use list/get tools to read data, create/update tools to modify data, and delete tools to remove items. Dashboard stats provide an overview of site content. All write operations validate input using the same rules as the web admin panel.';

    protected array $tools = [
        // Blog
        ListBlogs::class,
        GetBlog::class,
        CreateBlog::class,
        UpdateBlog::class,
        DeleteBlog::class,
        // Project
        ListProjects::class,
        GetProject::class,
        CreateProject::class,
        UpdateProject::class,
        DeleteProject::class,
        // Experience
        ListExperiences::class,
        CreateExperience::class,
        UpdateExperience::class,
        DeleteExperience::class,
        // Expertise
        ListExpertises::class,
        CreateExpertise::class,
        UpdateExpertise::class,
        DeleteExpertise::class,
        // Deployment
        ListDeployments::class,
        GetDeployment::class,
        CreateDeployment::class,
        UpdateDeployment::class,
        DeleteDeployment::class,
        // Guestbook
        ListGuestbookEntries::class,
        ModerateGuestbookEntry::class,
        // Comment
        ListComments::class,
        ModerateComment::class,
        // Image
        UploadImageFromUrl::class,
        // Dashboard
        GetDashboardStats::class,
    ];

    protected array $resources = [
        SiteSchema::class,
    ];

    protected array $prompts = [
        ContentAssistant::class,
    ];
}
