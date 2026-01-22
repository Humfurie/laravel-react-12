<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Project;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class OgImageController extends Controller
{
    /**
     * Generate OG image for a blog post.
     */
    public function blog(string $slug): Response
    {
        $blog = Blog::where('slug', $slug)->firstOrFail();

        return $this->generateImage("og:blog:{$slug}", [
            'title' => $blog->title,
            'subtitle' => $blog->excerpt ?? '',
            'type' => 'Blog Post',
        ]);
    }

    /**
     * Generate OG image for a project.
     */
    public function project(string $slug): Response
    {
        $project = Project::where('slug', $slug)->firstOrFail();

        return $this->generateImage("og:project:{$slug}", [
            'title' => $project->title,
            'subtitle' => $project->tagline ?? $project->description ?? '',
            'type' => 'Project',
            'accentColor' => '#2ECC71',
        ]);
    }

    /**
     * Generate OG image for a static page.
     */
    public function page(string $name): Response
    {
        $pages = [
            'home' => [
                'title' => 'Humphrey Singculan',
                'subtitle' => 'Software Engineer',
                'type' => 'Portfolio',
            ],
            'blog' => [
                'title' => 'Blog',
                'subtitle' => 'Software engineering articles and tutorials',
                'type' => 'Blog',
            ],
            'projects' => [
                'title' => 'Projects',
                'subtitle' => 'Portfolio of software projects',
                'type' => 'Portfolio',
            ],
        ];

        abort_unless(isset($pages[$name]), 404);

        return $this->generateImage("og:page:{$name}", $pages[$name]);
    }

    /**
     * Generate image by calling the OG image service.
     *
     * @param  array<string, string>  $params
     */
    private function generateImage(string $cacheKey, array $params): Response
    {
        $image = Cache::remember($cacheKey, 86400, function () use ($params) {
            $serviceUrl = config('services.og_image.url', 'http://og-image:3001');

            try {
                $response = Http::timeout(10)->get("{$serviceUrl}/generate", $params);

                return $response->successful() ? $response->body() : null;
            } catch (\Exception $e) {
                report($e);

                return null;
            }
        });

        if (! $image) {
            abort(503, 'OG Image service unavailable');
        }

        return response($image, 200)
            ->header('Content-Type', 'image/png')
            ->header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    }
}
