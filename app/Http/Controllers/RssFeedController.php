<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class RssFeedController extends Controller
{
    public function rss(): Response
    {
        $blogs = Cache::remember('rss:feed', 3600, function () {
            return Blog::published()
                ->latest('published_at')
                ->take(20)
                ->get();
        });

        $xml = view('feeds.rss', ['blogs' => $blogs])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/rss+xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
}
