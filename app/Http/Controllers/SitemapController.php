<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $blogs = Blog::published()
            ->orderBy('updated_at', 'desc')
            ->get();

        $xml = view('sitemap.index', [
            'blogs' => $blogs,
            'appUrl' => config('app.url'),
        ])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }

    public function blogs(): Response
    {
        $blogs = Blog::published()
            ->orderBy('updated_at', 'desc')
            ->get();

        $xml = view('sitemap.blogs', [
            'blogs' => $blogs,
            'appUrl' => config('app.url'),
        ])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
}
