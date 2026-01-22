{!! '<?xml version="1.0" encoding="UTF-8"?>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    {{-- Home Page --}}
    <url>
        <loc>{{ $appUrl }}</loc>
        <lastmod>{{ now()->toIso8601String() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>

    {{-- Blog Index --}}
    <url>
        <loc>{{ $appUrl }}/blog</loc>
        @if($latestBlog)
            <lastmod>{{ $latestBlog->updated_at->toIso8601String() }}</lastmod>
        @else
            <lastmod>{{ now()->toIso8601String() }}</lastmod>
        @endif
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>

    {{-- Projects Index --}}
    <url>
        <loc>{{ $appUrl }}/projects</loc>
        @if($latestProject)
            <lastmod>{{ $latestProject->updated_at->toIso8601String() }}</lastmod>
        @else
            <lastmod>{{ now()->toIso8601String() }}</lastmod>
        @endif
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
</urlset>
