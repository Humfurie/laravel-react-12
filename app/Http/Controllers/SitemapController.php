<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Deployment;
use App\Models\Project;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    /**
     * Sitemap index - links to all individual sitemaps.
     */
    public function index(): Response
    {
        $latestBlog = Cache::remember('sitemap:latest_blog', 3600, fn () => Blog::published()->latest('updated_at')->first());

        $latestProject = Cache::remember('sitemap:latest_project', 3600, fn () => Project::public()->latest('updated_at')->first());

        $latestDeployment = Cache::remember('sitemap:latest_deployment', 3600, fn () => Deployment::public()->active()->latest('updated_at')->first());

        $xml = view('sitemap.index', [
            'appUrl' => config('app.url'),
            'latestBlog' => $latestBlog,
            'latestProject' => $latestProject,
            'latestDeployment' => $latestDeployment,
        ])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }

    /**
     * Static pages sitemap (home, blog listing, projects listing).
     */
    public function pages(): Response
    {
        $latestBlog = Cache::remember('sitemap:latest_blog', 3600, fn () => Blog::published()->latest('updated_at')->first());

        $latestProject = Cache::remember('sitemap:latest_project', 3600, fn () => Project::public()->latest('updated_at')->first());

        $xml = view('sitemap.pages', [
            'appUrl' => config('app.url'),
            'latestBlog' => $latestBlog,
            'latestProject' => $latestProject,
        ])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }

    /**
     * Blog posts sitemap with images.
     */
    public function blogs(): Response
    {
        $blogs = Cache::remember('sitemap:blogs', 3600, fn () => Blog::published()->orderBy('updated_at', 'desc')->get());

        $xml = view('sitemap.blogs', [
            'blogs' => $blogs,
            'appUrl' => config('app.url'),
        ])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }

    /**
     * Projects sitemap with images.
     */
    public function projects(): Response
    {
        $projects = Cache::remember('sitemap:projects', 3600, fn () => Project::public()->with('primaryImage')->orderBy('updated_at', 'desc')->get());

        $xml = view('sitemap.projects', [
            'projects' => $projects,
            'appUrl' => config('app.url'),
        ])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }

    /**
     * Deployments sitemap with images.
     */
    public function deployments(): Response
    {
        $deployments = Cache::remember('sitemap:deployments', 3600, fn () => Deployment::public()->active()->with('primaryImage')->orderBy('updated_at', 'desc')->get());

        $xml = view('sitemap.deployments', [
            'deployments' => $deployments,
            'appUrl' => config('app.url'),
        ])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
}
